import { IconButton } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";

type ThemeSwitcherProps = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeSwitcher = ({ isDarkMode, toggleTheme }: ThemeSwitcherProps) => (
  <div style={{ position: "absolute", top: 16, right: 16 }}>
    <IconButton onClick={toggleTheme} color="inherit">
      {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  </div>
);

export default ThemeSwitcher;
