"use client";
import React, { useEffect, useState, useContext, useRef } from "react";
import { subscribeToChatMessages, sendMessage } from "@/services/chatService";
import { getUserById } from "@/services/userService";
import ActiveUserAndLoginStatusContext from "@/context/activeUserAndLoginStatus/activeUserAndLoginStatusContext";
import { motion, AnimatePresence } from "framer-motion";

const ChatWindow = ({ chat, onBack }) => {
  const { activeUser } = useContext(ActiveUserAndLoginStatusContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [senderProfiles, setSenderProfiles] = useState({});
  const [otherUserData, setOtherUserData] = useState(null);
  const fetchingRef = useRef({});
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!chat) return;
    const unsub = subscribeToChatMessages(chat.id, (msgs) => {
      setMessages(msgs);
    });
    return () => unsub && unsub();
  }, [chat]);

  // fetch sender profiles for avatars
  useEffect(() => {
    let mounted = true;
    const loadMissing = async () => {
      if (!messages || messages.length === 0) return;
      const missing = [];
      messages.forEach((m) => {
        const id = m.senderId;
        if (!id) return;
        if (String(id) === String(activeUser?._id)) return; // skip self
        if (senderProfiles[id]) return; // already have it
        if (fetchingRef.current[id]) return; // already fetching
        missing.push(id);
      });
      if (missing.length === 0) return;
      await Promise.all(
        missing.map(async (id) => {
          fetchingRef.current[id] = true;
          try {
            const res = await getUserById(id);
            if (mounted && res && res.success) {
              setSenderProfiles((prev) => ({ ...prev, [id]: res.user }));
            }
          } catch (e) {
            console.error("fetch sender profile error", e);
          } finally {
            delete fetchingRef.current[id];
          }
        })
      );
    };
    loadMissing();
    return () => {
      mounted = false;
    };
  }, [messages, activeUser, senderProfiles]);

  // fetch other user for private chats if not already set
  useEffect(() => {
    let mounted = true;
    const fetchOtherUser = async () => {
      if (!chat || chat.type !== "private") {
        setOtherUserData(null);
        return;
      }
      // if chat.otherUser is already set, use it
      if (chat.otherUser) {
        setOtherUserData(chat.otherUser);
        return;
      }
      // otherwise, derive from members and fetch
      if (!activeUser || !Array.isArray(chat.members)) return;
      const userId = String(activeUser._id || activeUser.id);
      const otherId = chat.members.find((m) => String(m) !== userId);
      if (!otherId) return;
      try {
        const res = await getUserById(otherId);
        if (mounted && res && res.success) {
          setOtherUserData(res.user);
        }
      } catch (e) {
        console.error("fetch other user error", e);
      }
    };
    fetchOtherUser();
    return () => {
      mounted = false;
    };
  }, [chat, activeUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!text || !text.trim() || !chat) return;
    const trimmed = text.trim();
    const senderName =
      activeUser?.userDetails?.name || activeUser?.email || "You";
    // optimistic UI: append a temporary message locally
    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      id: tempId,
      senderId: activeUser._id,
      senderName: senderName,
      text: trimmed,
      createdAt: { toDate: () => new Date() },
    };
    setMessages((prev) => [...prev, optimistic]);
    setText("");
    setSending(true);
    try {
      await sendMessage(chat.id, activeUser._id, trimmed, senderName);
    } catch (error) {
      console.error(error);
      // remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  if (!chat)
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
        Select a chat to start messaging
      </div>
    );

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="p-4 border-b dark:border-gray-700 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-gray-700 dark:to-gray-800 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden mr-2 p-2 rounded-md bg-white dark:bg-gray-700 bg-opacity-60 dark:bg-opacity-80 hover:bg-opacity-100 dark:hover:bg-opacity-100 transition-colors"
            >
              <svg
                className="w-5 h-5 text-sky-700 dark:text-sky-300"
                viewBox="0 0 20 20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0L3.586 10l4.707-4.707a1 1 0 111.414 1.414L6.414 10l3.293 3.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
          {chat.type === "group" ? (
            <div className="w-10 h-10 rounded-full bg-sky-200 dark:bg-sky-600 flex items-center justify-center text-sky-800 dark:text-sky-100 font-semibold text-sm">
              B{chat.batchNum}
            </div>
          ) : otherUserData?.profilePic?.url ? (
            <img
              src={otherUserData.profilePic.url}
              alt={otherUserData.name || "User"}
              className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 font-semibold text-sm">
              {(
                otherUserData?.name ||
                otherUserData?.userDetails?.name ||
                chat.title
              )
                ?.charAt(0)
                .toUpperCase() || "U"}
            </div>
          )}
          <div className="flex-1">
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {chat.type === "private"
                ? otherUserData?.name ||
                  otherUserData?.userDetails?.name ||
                  chat.title
                : chat.title}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {chat.type === "group"
                ? `Batch ${chat.batchNum} group chat`
                : `Direct message${
                    otherUserData
                      ? ` • ${
                          otherUserData.name ||
                          otherUserData.userDetails?.name ||
                          "User"
                        }`
                      : ""
                  }`}
            </div>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-auto p-3 sm:p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {messages.map((m) => {
            const mine = activeUser._id === m.senderId;
            return (
              <motion.div
                layout
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`mb-3 flex gap-2 ${
                  mine ? "justify-end" : "justify-start"
                }`}
              >
                {!mine && (
                  <div className="flex flex-col w-full">
                    {chat.type === "group" && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 ml-10">
                        {m.senderName || "User"}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-200 overflow-hidden">
                        {senderProfiles[m.senderId]?.profilePic?.url ? (
                          <img
                            src={senderProfiles[m.senderId].profilePic.url}
                            alt={m.senderName || "Sender"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>
                            {m.senderName?.charAt(0).toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                      <div
                        className={`${
                          mine
                            ? "bg-sky-600 text-white shadow-md"
                            : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-600 shadow-sm"
                        } max-w-[85%] sm:max-w-[70%] p-2 sm:p-3 rounded-lg`}
                      >
                        <div className="text-sm break-words">{m.text}</div>
                        <div
                          className={`text-xs mt-1 text-right ${
                            mine ? "text-sky-100" : "text-gray-400 dark:text-gray-400"
                          }`}
                        >
                          {m.createdAt?.toDate
                            ? m.createdAt.toDate().toLocaleTimeString()
                            : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {mine && (
                  <div className="flex gap-2 w-full justify-end">
                    <div
                      className={`${
                        mine
                          ? "bg-sky-600 text-white shadow-md"
                          : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-600 shadow-sm"
                      } max-w-[85%] sm:max-w-[70%] p-2 sm:p-3 rounded-lg`}
                    >
                      <div className="text-sm break-words">{m.text}</div>
                      <div
                        className={`text-xs mt-1 text-right ${
                          mine ? "text-sky-100" : "text-gray-400 dark:text-gray-400"
                        }`}
                      >
                        {m.createdAt?.toDate
                          ? m.createdAt.toDate().toLocaleTimeString()
                          : ""}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="p-3 sm:p-4 border-t bg-white dark:bg-gray-800 border-t-gray-200 dark:border-t-gray-700 flex items-center gap-2 sm:gap-3 transition-colors duration-300">
        <input
          className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition placeholder-gray-400 dark:placeholder-gray-500"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !sending) handleSend();
          }}
          disabled={sending}
        />
        <button
          onClick={handleSend}
          disabled={sending || !text.trim()}
          className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-sm font-medium transition whitespace-nowrap ${
            sending
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-sky-600 text-white hover:bg-sky-700 active:scale-95"
          }`}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
