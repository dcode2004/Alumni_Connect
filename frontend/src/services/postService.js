import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Create a new post
export const createPost = async (content, category, media = null) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/posts/create`,
      { content, category, media },
      {
        headers: {
          token: localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error creating post" };
  }
};

// Get feed posts
export const getFeedPosts = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/posts/feed`, {
      headers: {
        token: localStorage.getItem("token"),
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error fetching feed" };
  }
};

// Like/unlike a post
export const likePost = async (postId) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/posts/${postId}/like`,
      {},
      {
        headers: {
          token: localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error liking post" };
  }
};

// Add comment to a post
export const addComment = async (postId, content) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/posts/${postId}/comment`,
      { content },
      {
        headers: {
          token: localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Error adding comment" };
  }
};

export const getUserPosts = async () => {
  try {
    // Get posts from feed endpoint
    const response = await axios.get(`${API_URL}/api/posts/feed`, {
      headers: {
        token: localStorage.getItem("token"),
      },
    });

    // Get current user from context or make a request to get user details
    const userResponse = await axios.get(`${API_URL}/api/user/fetchUser`, {
      headers: {
        token: localStorage.getItem("token"),
      },
    });

    if (!userResponse.data.success || !response.data.success) {
      throw new Error("Failed to fetch data");
    }

    // Filter posts to only show the current user's posts
    const userPosts = response.data.posts.filter(
      (post) => post.userId._id === userResponse.data.user._id
    );

    return {
      success: true,
      posts: userPosts,
    };
  } catch (error) {
    console.error("Error in getUserPosts:", error);
    throw error.response?.data || { message: "Error fetching user posts" };
  }
};

export const deletePost = async (postId) => {
  try {
    const response = await fetch(`${API_URL}/api/posts/${postId}`, {
      method: "DELETE",
      headers: {
        token: localStorage.getItem("token"),
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to delete post");
    }
    return data;
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};

export const updatePost = async (postId, content, category, media) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/posts/${postId}`,
      { content, category, media },
      {
        headers: {
          token: localStorage.getItem("token"),
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating post:", error);
    throw error.response?.data || { message: "Error updating post" };
  }
};
