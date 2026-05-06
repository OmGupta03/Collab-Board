import api from "./api";

export const aiService = {
  runShapeSnap: async (base64) => {
    const response = await api.post("/ai/shapesnap", { base64 });
    return response.data;
  },
  
  analyzeBoard: async (base64, action) => {
    const response = await api.post("/ai/analyze", { base64, action });
    return response.data;
  }
};
