import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000";

export const sendChatbotMessage = async (message, conversationHistory = []) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/api/chatbot/query`,
      {
        message,
        conversationHistory,
      },
      {
        headers: token ? { token } : {},
      }
    );
    return response.data;
  } catch (error) {
    console.error("Chatbot service error:", error?.response || error);
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to get response. Please try again.",
    };
  }
};

export const checkChatbotHealth = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/chatbot/health`);
    return response.data;
  } catch (error) {
    console.error("Chatbot health check error:", error);
    return { success: false, configured: false };
  }
};

