"use client";
import React, { useState, useEffect } from "react";
import darkModeContext from "./darkModeContext";

const DarkModeStates = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Load dark mode preference from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) {
      const isDark = savedMode === "true";
      setDarkMode(isDark);
      applyDarkMode(isDark);
    } else {
      // Check system preference if no saved preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkMode(prefersDark);
      applyDarkMode(prefersDark);
    }
  }, []);

  // Apply dark mode to document
  const applyDarkMode = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode.toString());
    applyDarkMode(newMode);
  };

  return (
    <darkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </darkModeContext.Provider>
  );
};

export default DarkModeStates;

