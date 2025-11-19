"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";

const ChatbotMessage = ({ message, isUser = false }) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        mb: 2,
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-start",
      }}
    >
      {/* Avatar */}
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: isUser ? "#3584FC" : "#e0e0e0",
          flexShrink: 0,
        }}
      >
        {isUser ? (
          <PersonIcon sx={{ fontSize: 18, color: "#ffffff" }} />
        ) : (
          <SmartToyIcon sx={{ fontSize: 18, color: "#666" }} />
        )}
      </Box>

      {/* Message Bubble */}
      <Box
        sx={{
          maxWidth: "75%",
          bgcolor: isUser ? "#3584FC" : "#f5f5f5",
          color: isUser ? "#ffffff" : "#333",
          borderRadius: 2,
          px: 2,
          py: 1.5,
          boxShadow: 1,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {message}
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatbotMessage;

