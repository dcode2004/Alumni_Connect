"use client";
import { getUserById } from "@/services/userService";
import React, { useContext, useEffect, useState } from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import NewChatDialog from "@/components/chat/NewChatDialog";
import ActiveUserAndLoginStatusContext from "@/context/activeUserAndLoginStatus/activeUserAndLoginStatusContext";
import {
  getOrCreatePrivateChat,
  ensureBatchGroupChat,
} from "@/services/chatService";

const ChatPage = () => {
  const { activeUser, fetchActiveUser } = useContext(
    ActiveUserAndLoginStatusContext
  );
  const [selectedChat, setSelectedChat] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [viewingChat, setViewingChat] = useState(false);

  useEffect(() => {
    fetchActiveUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // listen for NewChatDialog events fired by sidebar
    const handler = async (e) => {
      const user = e.detail;
      if (!activeUser) return;
      const chat = await getOrCreatePrivateChat(activeUser._id, user);
      // attach otherUser info for direct chats created from dialog
      setSelectedChat({ ...chat, otherUser: user });
    };
    window.addEventListener("startPrivateChat", handler);
    return () => window.removeEventListener("startPrivateChat", handler);
  }, [activeUser]);

  // when user selects a chat from sidebar, fetch other participant info for private chats
  const handleSelectChat = async (c) => {
    if (!c) return setSelectedChat(null);
    if (c.type === "private" && Array.isArray(c.members)) {
      const otherId = c.members.find(
        (m) => m !== activeUser._id && m !== activeUser?._id
      );
      if (otherId) {
        const res = await getUserById(otherId);
        if (res.success) {
          setSelectedChat({ ...c, otherUser: res.user });
          return;
        }
      }
    }
    setSelectedChat(c);
  };

  useEffect(() => {
    const setupGroup = async () => {
      if (!activeUser) return;
      await ensureBatchGroupChat(activeUser.batchNum, activeUser);
    };
    setupGroup();
  }, [activeUser]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="min-h-[calc(100vh-100px)] bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      <div className="flex h-[calc(100vh-100px)] gap-0 md:gap-4 p-0 md:p-4 overflow-hidden relative">
        {isMobile ? (
          <>
            {!viewingChat ? (
              <div className="w-full">
                <ChatSidebar
                  onSelectChat={(c) => {
                    handleSelectChat(c);
                    setViewingChat(true);
                  }}
                  onNewChat={() => setNewChatDialogOpen(true)}
                />
              </div>
            ) : (
              <div className="w-full flex-1 flex flex-col">
                <ChatWindow
                  chat={selectedChat}
                  onBack={() => setViewingChat(false)}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="w-full md:w-80 flex-col">
              <ChatSidebar
                onSelectChat={(c) => {
                  handleSelectChat(c);
                }}
                onNewChat={() => setNewChatDialogOpen(true)}
              />
            </div>
            <div className="flex-1 flex flex-col md:rounded-lg md:border md:border-gray-200 dark:border-gray-700 md:overflow-hidden md:shadow-lg bg-white dark:bg-gray-800 transition-colors duration-300">
              <ChatWindow chat={selectedChat} />
            </div>
          </>
        )}
      </div>

      {/* New Chat Dialog - Rendered at page level to appear in center */}
      <NewChatDialog
        open={newChatDialogOpen}
        onClose={() => setNewChatDialogOpen(false)}
        onStartChat={(user) => {
          const ev = new CustomEvent("startPrivateChat", { detail: user });
          window.dispatchEvent(ev);
          setNewChatDialogOpen(false);
        }}
      />
    </section>
  );
};

export default ChatPage;
