"use client";
import React, { useContext } from "react";
import { IconButton } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import darkModeContext from "@/context/darkMode/darkModeContext";

const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useContext(darkModeContext);

  return (
    <IconButton
      onClick={toggleDarkMode}
      sx={{
        width: 56,
        height: 56,
        bgcolor: darkMode ? "#4a5568 !important" : "#fbbf24 !important",
        color: "#ffffff !important",
        boxShadow: darkMode 
          ? "0 4px 12px rgba(74, 85, 104, 0.4)" 
          : "0 4px 12px rgba(251, 191, 36, 0.4)",
        "&:hover": {
          bgcolor: darkMode ? "#2d3748 !important" : "#f59e0b !important",
          color: "#ffffff !important",
          boxShadow: darkMode
            ? "0 6px 16px rgba(74, 85, 104, 0.5)"
            : "0 6px 16px rgba(251, 191, 36, 0.5)",
        },
        "&:active": {
          bgcolor: darkMode ? "#1a202c !important" : "#d97706 !important",
          color: "#ffffff !important",
        },
        "&:focus": {
          bgcolor: darkMode ? "#4a5568 !important" : "#fbbf24 !important",
          color: "#ffffff !important",
        },
        transition: "all 0.3s ease",
      }}
      aria-label="toggle dark mode"
    >
      {darkMode ? (
        <Brightness7Icon sx={{ fontSize: 28, color: "#ffffff !important" }} />
      ) : (
        <Brightness4Icon sx={{ fontSize: 28, color: "#ffffff !important" }} />
      )}
    </IconButton>
  );
};

export default DarkModeToggle;

