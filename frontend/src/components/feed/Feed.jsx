import { useState, useEffect, useContext } from "react";
import { getFeedPosts, likePost, addComment } from "../../services/postService";
import ActiveUserAndLoginStatusContext from "@/context/activeUserAndLoginStatus/activeUserAndLoginStatusContext";
import { Avatar } from "@mui/material";
import CreatePost from "./CreatePost";
import PostSkeleton from "./PostSkeleton";
import CategoryTag from "./CategoryTag";
import CommentDialog from "../modal/CommentDialog";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import YourPosts from "./YourPosts";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showYourPosts, setShowYourPosts] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const { activeUser } = useContext(ActiveUserAndLoginStatusContext);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await getFeedPosts();
      setPosts(response.posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await likePost(postId);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, likes: response.likes } : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleOpenComments = (post) => {
    setSelectedPost(post);
  };

  const handleCloseComments = () => {
    setSelectedPost(null);
    setNewComment("");
  };

  const handleComment = async (postId) => {
    if (!newComment.trim()) return;

    try {
      const response = await addComment(postId, newComment);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, comments: response.comments } : post
        )
      );
      if (selectedPost && selectedPost._id === postId) {
        setSelectedPost(prev => ({
          ...prev,
          comments: response.comments
        }));
      }
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleCreatePost = () => {
    setShowCreatePost(true);
    setShowYourPosts(false);
  };

  const handleYourPosts = () => {
    setShowYourPosts(true);
    setShowCreatePost(false);
  };

  const handleBackToFeed = () => {
    setShowCreatePost(false);
    setShowYourPosts(false);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col gap-6 p-4 md:p-6 bg-gray-100 dark:bg-gray-900 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px] transition-colors duration-300">
        {[1, 2, 3].map((i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-900 bg-[radial-gradient(#d1d5db_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px] transition-colors duration-300">
      {/* Mobile Action Bar */}
      <div className="md:hidden sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-md p-4 flex gap-4 transition-colors duration-300">
        <button 
          onClick={handleYourPosts}
          className="flex-1 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm transition-all hover:shadow"
        >
          Your Posts
        </button>
        <button 
          onClick={handleCreatePost}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-all hover:shadow"
        >
          Create Post
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-white dark:bg-gray-800 shadow-md p-6 space-y-4 h-fit sticky top-20 transition-colors duration-300">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Actions</h2>
        <button 
          onClick={handleYourPosts}
          className="w-full bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm transition-all hover:shadow"
        >
          Your Posts
        </button>
        <button 
          onClick={handleCreatePost}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-all hover:shadow"
        >
          Create Post
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6">
        {showCreatePost ? (
          <div className="animate-fade-in">
            <button
              onClick={handleBackToFeed}
              className="mb-4 text-blue-500 flex items-center hover:text-blue-600 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Feed
            </button>
            <CreatePost
              onPostCreated={() => {
                handleBackToFeed();
                fetchPosts();
              }}
            />
          </div>
        ) : showYourPosts ? (
          <div className="animate-fade-in">
            <button
              onClick={handleBackToFeed}
              className="mb-4 text-blue-500 dark:text-blue-400 flex items-center hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Feed
            </button>
            <YourPosts />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-gray-500 dark:text-gray-400 animate-fade-in">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-xl font-semibold">No posts yet</p>
            <p className="mt-2 text-gray-400">Be the first one to share something!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <div 
                key={post._id} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6 transition-all hover:shadow-md animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Avatar 
                      src={post.userId?.profilePic?.url || ''} 
                      alt={post.userId?.userDetails?.name}
                    />
                    <div className="ml-4">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                        {post.userId?.userDetails?.name || "Anonymous"}
                      </h3>
                      <div className="mt-1">
                        <CategoryTag category={post.category} />
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                <div className="prose max-w-none mb-6">
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{post.content}</p>
                </div>

                {post.media && (
                  <div className="mb-6 rounded-lg overflow-hidden h-64 md:h-80">
                    <img
                      src={post.media}
                      alt="Post media"
                      className="w-full h-full object-contain bg-gray-50 dark:bg-gray-700"
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 py-3 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => handleLike(post._id)}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      post.likes.some(like => like._id === activeUser._id)
                        ? "text-rose-600 bg-rose-50 hover:bg-rose-100"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 mr-2 ${
                        post.likes.some(like => like._id === activeUser._id)
                          ? "text-rose-600 fill-rose-600"
                          : "text-gray-500 fill-none stroke-current"
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                      />
                    </svg>
                    {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
                  </button>

                  <button
                    onClick={() => handleOpenComments(post)}
                    className="flex items-center px-4 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <ChatBubbleOutlineIcon className="w-5 h-5 mr-2" />
                    {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comment Dialog */}
      <CommentDialog
        open={!!selectedPost}
        onClose={handleCloseComments}
        comments={selectedPost?.comments || []}
        postId={selectedPost?._id}
        onAddComment={handleComment}
        newComment={newComment}
        setNewComment={setNewComment}
        activeUser={activeUser}
      />
    </div>
  );
};

export default Feed; 