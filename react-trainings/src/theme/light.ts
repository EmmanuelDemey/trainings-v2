import { createTheme } from "@mui/material";

export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    error: { main: "#BC3F3C" },
    background: {
      default: "#ffffff",
      paper: "#f5f5f5",
    },
  },
});
