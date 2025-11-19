"use client";
import React, { useEffect, useState, useContext } from "react";
import ActiveUserAndLoginStatusContext from "@/context/activeUserAndLoginStatus/activeUserAndLoginStatusContext";
import { ensureBatchGroupChat, getUserChatsOnce } from "@/services/chatService";
import { getUserById } from "@/services/userService";

// format Firestore timestamp or Date-like into short time string
const formatTime = (ts) => {
  if (!ts) return "";
  try {
    let d;
    if (ts?.seconds) d = new Date(ts.seconds * 1000);
    else if (typeof ts?.toDate === "function") d = ts.toDate();
    else d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    return "";
  }
};

const ChatSidebar = ({ onSelectChat, onNewChat }) => {
  const { activeUser } = useContext(ActiveUserAndLoginStatusContext);
  const [groupChat, setGroupChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [userMap, setUserMap] = useState({});

  useEffect(() => {
    const init = async () => {
      if (!activeUser) return;
      try {
        const batchNum = activeUser.batchNum;
        const grp = await ensureBatchGroupChat(batchNum, activeUser);
        setGroupChat(grp);

        // fetch user chats
        const userChats = await getUserChatsOnce(activeUser._id);
        const merged = userChats
          .slice()
          .sort(
            (a, b) =>
              (b.lastMessage?.createdAt?.seconds || 0) -
              (a.lastMessage?.createdAt?.seconds || 0)
          );
        setChats(merged);
        // prefetch other participant profiles for private chats
        const map = {};
        await Promise.all(
          merged.map(async (c) => {
            if (c.type === "private" && Array.isArray(c.members)) {
              const otherId = c.members.find(
                (m) => m !== activeUser._id && m !== activeUser?._id
              );
              if (otherId && !map[otherId]) {
                const res = await getUserById(otherId);
                if (res.success) map[otherId] = res.user;
              }
            }
          })
        );
        setUserMap(map);
      } catch (error) {
        console.error(error);
      }
    };
    init();
  }, [activeUser]);

  const handleOpenGroup = () => {
    if (groupChat) onSelectChat(groupChat);
  };

  return (
    <aside className="w-full md:w-80 bg-white border-r h-full flex flex-col shadow-sm">
      <div className="p-3 sm:p-4 border-b bg-gradient-to-r from-sky-50 to-blue-50">
        <div className="text-lg sm:text-xl font-semibold text-gray-900">
          Chats
        </div>
        <div className="mt-3">
          <button
            onClick={handleOpenGroup}
            className="w-full text-left px-3 py-2 rounded-lg hover:bg-sky-100 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-200 flex items-center justify-center text-sky-800 font-bold text-sm">
                B{activeUser?.batchNum}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900 truncate">
                  Batch {activeUser?.batchNum}
                </div>
                <div className="text-xs text-gray-600">All batch members</div>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-3">
          <button
            onClick={() => onNewChat()}
            className="w-full text-left bg-white text-sky-700 px-3 py-2 rounded-lg hover:bg-sky-50 transition font-semibold text-sm shadow-md hover:shadow-lg"
          >
            + New Chat
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-sm text-gray-500 text-center mt-8">
            No direct chats yet.
            <br />
            Start one using + New Chat
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {chats.map((c) => (
              <li
                key={c.id}
                className="cursor-pointer hover:bg-sky-50 transition active:bg-sky-100"
                onClick={() => onSelectChat(c)}
              >
                <div className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-blue-200 flex-shrink-0 flex items-center justify-center text-gray-700 font-semibold text-sm overflow-hidden">
                      {c.type === "private" ? (
                        (() => {
                          const userId =
                            activeUser && (activeUser._id || activeUser.id);
                          const otherId = Array.isArray(c.members)
                            ? c.members.find(
                                (m) => String(m) !== String(userId)
                              )
                            : null;
                          const u = otherId ? userMap[otherId] : null;
                          const displayName =
                            (u && (u.userDetails?.name || u.name || u.email)) ||
                            c.title;
                          return u && u.profilePic?.url ? (
                            <img
                              src={u.profilePic.url}
                              alt={displayName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>
                              {(displayName || "U").charAt(0).toUpperCase()}
                            </span>
                          );
                        })()
                      ) : (
                        <span>{c.title.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 truncate text-sm">
                        {c.type === "private"
                          ? (() => {
                              const userId =
                                activeUser && (activeUser._id || activeUser.id);
                              const otherId = Array.isArray(c.members)
                                ? c.members.find(
                                    (m) => String(m) !== String(userId)
                                  )
                                : null;
                              const u = otherId ? userMap[otherId] : null;
                              return (
                                (u &&
                                  (u.userDetails?.name || u.name || u.email)) ||
                                c.title
                              );
                            })()
                          : c.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {c.lastMessage?.text || "No messages yet"}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0 ml-2">
                    {c.lastMessage && (
                      <div className="text-xs text-sky-500 font-bold">●</div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {formatTime(c.lastMessage?.createdAt)}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
};

export default ChatSidebar;
