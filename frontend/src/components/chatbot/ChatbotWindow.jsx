"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ChatbotMessage from "./ChatbotMessage";
import { sendChatbotMessage } from "@/services/chatbotService";

const ChatbotWindow = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      content: "Hello! I'm your AI assistant. How can I help you with the LNMIIT Alumni Portal today?",
      isUser: false,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false); // Additional flag to prevent duplicate sends
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when window opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    const message = inputMessage.trim();
    // Prevent duplicate sends - check both loading and isSending flags
    if (!message || loading || isSending) return;

    // Set both flags to prevent duplicate requests
    setIsSending(true);
    setLoading(true);

    // Build conversation history BEFORE adding current message to state
    // This ensures we don't include the current message in history (avoiding duplication)
    const conversationHistory = messages
      .slice(1) // Skip welcome message
      .map((msg) => ({
        role: msg.isUser ? "user" : "model",
        content: msg.content,
      }));

    // Add user message to UI immediately (optimistic update)
    const userMessage = { content: message, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");

    try {
      // Call API with current message and history (current message is NOT in history)
      const response = await sendChatbotMessage(message, conversationHistory);

      if (response.success) {
        setMessages((prev) => [
          ...prev,
          { content: response.response, isUser: false },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            content: response.message || "Sorry, I couldn't process your request. Please try again.",
            isUser: false,
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          content: "An error occurred. Please try again later.",
          isUser: false,
        },
      ]);
    } finally {
      setLoading(false);
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !loading && !isSending) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: { xs: 0, sm: 80 },
        right: { xs: 0, sm: 20 },
        width: { xs: "100%", sm: 400 },
        height: { xs: "100vh", sm: 600 },
        maxHeight: { xs: "100vh", sm: "calc(100vh - 100px)" },
        bgcolor: "#ffffff",
        borderRadius: { xs: 0, sm: 2 },
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: "#3584FC",
          color: "#ffffff",
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Help Assistant
        </Typography>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: "#ffffff" }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          bgcolor: "#fafafa",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#888",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#555",
          },
        }}
      >
        {messages.map((msg, index) => (
          <ChatbotMessage
            key={index}
            message={msg.content}
            isUser={msg.isUser}
          />
        ))}
        {loading && (
          <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#e0e0e0",
              }}
            >
              <SmartToyIcon sx={{ fontSize: 18, color: "#666" }} />
            </Box>
            <Box
              sx={{
                bgcolor: "#f5f5f5",
                borderRadius: 2,
                px: 2,
                py: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                Thinking...
              </Typography>
            </Box>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid #e0e0e0",
          bgcolor: "#ffffff",
          display: "flex",
          gap: 1,
          alignItems: "flex-end",
        }}
      >
        <TextField
          inputRef={inputRef}
          fullWidth
          multiline
          maxRows={4}
          placeholder="Type your question..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading || isSending}
          variant="outlined"
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
        <IconButton
          onClick={handleSend}
          disabled={!inputMessage.trim() || loading || isSending}
          sx={{
            bgcolor: "#3584FC",
            color: "#ffffff",
            "&:hover": {
              bgcolor: "#2a6fd4",
            },
            "&:disabled": {
              bgcolor: "#e0e0e0",
              color: "#999",
            },
            width: 40,
            height: 40,
          }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatbotWindow;

