"use client";
import React, { useState } from "react";
import { Box, IconButton, Badge } from "@mui/material";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import ChatbotWindow from "./ChatbotWindow";
import DarkModeToggle from "@/components/header/DarkModeToggle";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Dark Mode Toggle - Above Chatbot Button */}
      {!isOpen && (
        <Box
          sx={{
            position: "fixed",
            bottom: { xs: 100, sm: 108 },
            right: { xs: 24, sm: 32 },
            zIndex: 999,
          }}
        >
          <DarkModeToggle />
        </Box>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <Box
          sx={{
            position: "fixed",
            bottom: { xs: 24, sm: 32 },
            right: { xs: 24, sm: 32 },
            zIndex: 999,
          }}
        >
        <IconButton
          onClick={handleToggle}
          sx={{
            width: 56,
            height: 56,
            bgcolor: "#3584FC !important",
            color: "#ffffff !important",
            boxShadow: "0 4px 12px rgba(53, 132, 252, 0.4)",
            "&:hover": {
              bgcolor: "#2a6fd4 !important",
              color: "#ffffff !important",
              boxShadow: "0 6px 16px rgba(53, 132, 252, 0.5)",
            },
            "&:active": {
              bgcolor: "#1f5fb3 !important",
              color: "#ffffff !important",
            },
            "&:focus": {
              bgcolor: "#3584FC !important",
              color: "#ffffff !important",
            },
            transition: "all 0.3s ease",
            animation: isOpen ? "none" : "pulse 2s infinite",
            "@keyframes pulse": {
              "0%": {
                boxShadow: "0 4px 12px rgba(53, 132, 252, 0.4)",
              },
              "50%": {
                boxShadow: "0 4px 20px rgba(53, 132, 252, 0.6)",
              },
              "100%": {
                boxShadow: "0 4px 12px rgba(53, 132, 252, 0.4)",
              },
            },
          }}
        >
          <ChatBubbleIcon sx={{ fontSize: 28, color: "#ffffff !important" }} />
        </IconButton>
        </Box>
      )}

      {/* Chat Window */}
      {isOpen && (
        <ChatbotWindow
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default ChatbotWidget;

