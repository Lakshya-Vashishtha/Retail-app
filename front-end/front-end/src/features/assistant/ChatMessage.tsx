import { Box, Typography } from "@mui/material";

export default function ChatMessage({ message }: any) {
  const isUser = message.sender === "user";

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        mb: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: "70%",
          p: 2,
          borderRadius: 3,
          bgcolor: isUser ? "#2563eb" : "#e2e8f0",
          color: isUser ? "white" : "black",
        }}
      >
        <Typography>{message.text}</Typography>

        {message.sources && message.sources.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              Sources:
            </Typography>
            {message.sources.map((src: any, i: number) => (
              <Typography key={i} variant="caption" display="block">
                • {src.document}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
