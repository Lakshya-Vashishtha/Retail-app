import api from "./axiosConfig";

export const assistantAPI = {
  ask: (question: string, k = 4) =>
    api.post("/rag/ask/", {
      question,
      k,
    }),
};
