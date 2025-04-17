import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const getFollowers = async (userId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/follow/followers/${userId}`,
      {
        headers: {
          token: localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getFollowing = async (userId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/follow/following/${userId}`,
      {
        headers: {
          token: localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const followUser = async (userId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/follow/follow/${userId}`,
      {},
      {
        headers: {
          token: localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const unfollowUser = async (userId) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/follow/unfollow/${userId}`,
      {},
      {
        headers: {
          token: localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getFollowStatus = async (userId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/follow/status/${userId}`,
      {
        headers: {
          token: localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
