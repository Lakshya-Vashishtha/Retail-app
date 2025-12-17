import { useState, useRef, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import ChatInput from "../features/assistant/ChatInput";
import ChatMessage from "../features/assistant/ChatMessage";
import { assistantAPI } from "../api/assistant";

export default function AssistantPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<any>(null);

  const scrollToBottom = () => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (question: string) => {
    const newUserMessage = { sender: "user", text: question };
    setMessages((prev) => [...prev, newUserMessage]);
    setLoading(true);

    try {
      const res = await assistantAPI.ask(question);

      const botMessage = {
        sender: "assistant",
        text: res.data.answer,
        sources: res.data.sources || [],
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "assistant",
          text: "Error: Unable to get response.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 800, margin: "auto", mt: 3 }}>
      <Typography variant="h5" mb={2}>
        AI Assistant
      </Typography>

      <Box
        sx={{
          minHeight: "60vh",
          maxHeight: "70vh",
          overflowY: "auto",
          p: 2,
          borderRadius: 2,
          bgcolor: "#f8fafc",
        }}
      >
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}

        {loading && (
          <Typography sx={{ opacity: 0.6, fontStyle: "italic" }}>
            Assistant is typing…
          </Typography>
        )}

        {/* Auto-scroll anchor */}
        <div ref={chatRef}></div>
      </Box>

      <ChatInput onSend={sendMessage} />
    </Box>
  );
}
