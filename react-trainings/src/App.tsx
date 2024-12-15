import { useState } from "react";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { LikesProvider } from "./context";
import { router } from "./router";
import { lightTheme, darkTheme } from "./theme";
import { ThemeSwitcher, Language } from "@components/common";
import "./i18n";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [likes, setLikes] = useState({});

  const updateLikes = (k: string, v: number) => {
    setLikes({ ...likes, [k]: v });
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: isDarkMode
            ? darkTheme.palette.background.default
            : lightTheme.palette.background.default,
        }}
      >
        <LikesProvider value={{ likes, setLikes: updateLikes }}>
          <ThemeSwitcher isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          <Language />
          <RouterProvider router={router} />
        </LikesProvider>
      </div>
    </ThemeProvider>
  );
}

export default App;
