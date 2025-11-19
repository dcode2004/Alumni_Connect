"use client";
import React, { useContext } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import darkModeContext from "@/context/darkMode/darkModeContext";

const MuiThemeProvider = ({ children }) => {
  const { darkMode } = useContext(darkModeContext);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: "#3584FC",
      },
      secondary: {
        main: "#7CC5FA",
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default MuiThemeProvider;

