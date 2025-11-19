import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:5000";

export const searchUsers = async (query) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      `${API_URL}/api/user/search?q=${encodeURIComponent(query)}`,
      {
        headers: { token },
      }
    );
    return res.data;
  } catch (error) {
    console.error("searchUsers error", error?.response || error);
    return { success: false, users: [] };
  }
};

export const getUserById = async (userId) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_URL}/api/user/getById/${userId}`, {
      headers: { token },
    });
    return res.data;
  } catch (error) {
    console.error("getUserById error", error?.response || error);
    return { success: false };
  }
};
