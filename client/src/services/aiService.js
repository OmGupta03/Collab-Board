import api from "./api";

export const aiService = {

  analyzeBoard: async (base64, action) => {
    const response = await api.post("/ai/analyze", { base64, action });
    return response.data;
  }
};
