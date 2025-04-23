import { useState, useEffect, useContext } from "react";
import { getUserPosts, deletePost, updatePost } from "../../services/postService";
import ActiveUserAndLoginStatusContext from "@/context/activeUserAndLoginStatus/activeUserAndLoginStatusContext";
import { Avatar } from "@mui/material";
import CategoryTag from "./CategoryTag";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firebaseConfig } from "../../../firebase/firebase";
import randomString from "randomstring";

const CATEGORIES = [
  "Interview Experience",
  "Job Posting",
  "General",
  "Project Showcase",
  "Academic Query"
];

const YourPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editMedia, setEditMedia] = useState(null);
  const [editMediaFile, setEditMediaFile] = useState(null);
  const [deleteConfirmPost, setDeleteConfirmPost] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const { activeUser } = useContext(ActiveUserAndLoginStatusContext);

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const storage = getStorage(app);

  useEffect(() => {
    fetchUserPosts();
  }, []);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserPosts();
      if (response.success && Array.isArray(response.posts)) {
        setPosts(response.posts);
      } else {
        setError("Invalid response format from server");
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError(error.message || "Error fetching your posts");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Log when component renders
  console.log("YourPosts rendering. Posts:", posts, "Loading:", loading);

  const handleEdit = (post) => {
    setEditingPost(post);
    setEditContent(post.content);
    setEditCategory(post.category);
    setEditMedia(post.media || null);
    setEditMediaFile(null);
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5 MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit. Please select a smaller image.");
        return;
      }
      
      // Store the file for upload during post update
      setEditMediaFile(file);
      
      // Create a temporary preview URL
      setEditMedia(URL.createObjectURL(file));
    }
  };

  const handleRemoveMedia = () => {
    setEditMedia(null);
    setEditMediaFile(null);
  };

  const handleUpdate = async () => {
    try {
      setUpdateLoading(true);
      let mediaUrl = editMedia;
      
      // If we have a new media file, upload it to Firebase
      if (editMediaFile) {
        const random_string = randomString.generate({
          length: 6,
          charset: "alphanumeric",
        });
        
        const timestamp = Date.now();
        const { batchNum } = activeUser || {};
        const fileName = `post_${timestamp}_${random_string}`;
        const storageRef = ref(storage, `images/posts/${batchNum || 'general'}/${fileName}`);
        
        const metadata = { contentType: editMediaFile.type };
        
        // Upload the file to Firebase Storage
        const uploadSnapshot = await uploadBytes(storageRef, editMediaFile, metadata);
        
        // Get the download URL
        mediaUrl = await getDownloadURL(uploadSnapshot.ref);
      }

      const response = await updatePost(editingPost._id, editContent, editCategory, mediaUrl);
      if (response.success) {
        // Update the post in the local state
        setPosts(posts.map(post => 
          post._id === editingPost._id 
            ? { ...post, content: editContent, category: editCategory, media: mediaUrl }
            : post
        ));
        setEditingPost(null);
        setEditMedia(null);
        setEditMediaFile(null);
      } else {
        throw new Error(response.message || "Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      alert(error.message || "Failed to update post. Please try again.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await deletePost(postId);
      setPosts(posts.filter(post => post._id !== postId));
      setDeleteConfirmPost(null);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/6 mt-2"></div>
              </div>
            </div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <svg className="w-16 h-16 mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xl font-semibold text-red-500">Error Loading Posts</p>
        <p className="mt-2 text-gray-400">{error}</p>
        <button
          onClick={fetchUserPosts}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <p className="text-xl font-semibold">No posts yet</p>
        <p className="mt-2 text-gray-400">Start sharing with your community!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div 
          key={post._id} 
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Avatar 
                src={activeUser?.profilePic?.url || ''} 
                alt={activeUser?.userDetails?.name}
              />
              <div className="ml-4">
                <h3 className="font-semibold text-lg text-gray-900">
                  {activeUser?.userDetails?.name || "Anonymous"}
                </h3>
                <div className="mt-1">
                  <CategoryTag category={post.category} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <IconButton 
                onClick={() => handleEdit(post)}
                className="text-blue-500 hover:text-blue-600"
              >
                <EditIcon />
              </IconButton>
              <IconButton 
                onClick={() => setDeleteConfirmPost(post)}
                className="text-red-500 hover:text-red-600"
              >
                <DeleteIcon />
              </IconButton>
            </div>
          </div>

          <div className="prose max-w-none mb-6">
            <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
          </div>

          {post.media && (
            <div className="mb-6 rounded-lg overflow-hidden h-64 md:h-80">
              <img
                src={post.media}
                alt="Post media"
                className="w-full h-full object-contain bg-gray-50"
              />
            </div>
          )}

          <div className="flex items-center gap-2 py-3 border-t border-gray-100 text-sm text-gray-500">
            <span>{post.likes?.length || 0} likes</span>
            <span>•</span>
            <span>{post.comments?.length || 0} comments</span>
            <span>•</span>
            <span>{new Date(post.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
        </div>
      ))}

      {/* Edit Dialog */}
      <Dialog
        open={!!editingPost}
        onClose={() => setEditingPost(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="flex justify-between items-center">
          Edit Post
          <IconButton onClick={() => setEditingPost(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="text-gray-700 whitespace-nowrap">Category:</label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="flex-1 p-2 border rounded-md"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 border rounded-md h-40"
              placeholder="Post content..."
            />

            {editMedia ? (
              <div className="relative">
                <div className="h-48 md:h-64 rounded-md overflow-hidden bg-gray-50">
                  <img
                    src={editMedia}
                    alt="Post media"
                    className="w-full h-full object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMediaChange}
                  className="hidden"
                  id="edit-image-upload"
                />
                <label
                  htmlFor="edit-image-upload"
                  className="flex items-center justify-center w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col items-center">
                    <CloudUploadIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Click to upload an image (max 5MB)</span>
                  </div>
                </label>
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <button
            onClick={() => setEditingPost(null)}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={updateLoading || !editContent.trim()}
            className={`px-4 py-2 rounded-md transition-colors ${
              updateLoading || !editContent.trim()
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {updateLoading ? "Updating..." : "Update Post"}
          </button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmPost}
        onClose={() => setDeleteConfirmPost(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle className="flex justify-between items-center">
          <span>Delete Post</span>
          <IconButton onClick={() => setDeleteConfirmPost(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <p className="pt-2">Are you sure you want to delete this post? This action cannot be undone.</p>
        </DialogContent>
        <DialogActions className="p-4">
          <button
            onClick={() => setDeleteConfirmPost(null)}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDelete(deleteConfirmPost._id)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default YourPosts; 