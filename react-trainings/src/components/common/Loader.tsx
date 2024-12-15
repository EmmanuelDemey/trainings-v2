import React from "react";
import { CircularProgress, Box, useTheme } from "@mui/material";

type LoaderProps = {
  size?: number;
  color?: "primary" | "secondary";
};

const Loader: React.FC<LoaderProps> = ({ size = 100, color = "primary" }) => {
  const theme = useTheme();

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        width: "100%",
        height: "100%",
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(2),
      }}
    >
      <CircularProgress size={size} color={color} />
    </Box>
  );
};

export default Loader;
