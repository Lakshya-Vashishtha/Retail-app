import { Box, TextField, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useState } from "react";

export default function ChatInput({ onSend }: any) {
  const [value, setValue] = useState("");

  const send = () => {
    if (!value.trim()) return;
    onSend(value);
    setValue("");
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        mt: 2,
        p: 1,
        background: "white",
        borderRadius: 2,
      }}
    >
      <TextField
        fullWidth
        placeholder="Ask something about products or sales…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
      />
      <IconButton onClick={send} color="primary">
        <SendIcon />
      </IconButton>
    </Box>
  );
}
