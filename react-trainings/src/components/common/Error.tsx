import React from "react";
import { Typography, useTheme } from "@mui/material";

type ErrorType = {
  text: string;
};

const Error: React.FC<ErrorType> = ({ text }) => {
  const theme = useTheme();

  return (
    <Typography
      variant="body1"
      color="error"
      sx={{
        margin: theme.spacing(2),
        fontWeight: "bold",
        fontSize: theme.typography.body1.fontSize,
      }}
    >
      {text}
    </Typography>
  );
};

export default Error;
