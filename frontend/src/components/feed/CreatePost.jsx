import { useState, useContext } from "react";
import { createPost } from "../../services/postService";
import ActiveUserAndLoginStatusContext from "@/context/activeUserAndLoginStatus/activeUserAndLoginStatusContext";
import { Avatar } from "@mui/material";
import CategoryTag from "./CategoryTag";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const CATEGORIES = [
  "Interview Experience",
  "Job Posting",
  "General",
  "Project Showcase",
  "Academic Query"
];

const CreatePost = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const { activeUser } = useContext(ActiveUserAndLoginStatusContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      await createPost(content, category, media);
      setContent("");
      setCategory("General");
      setMedia(null);
      onPostCreated?.();
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Here you would typically upload the file to a storage service
      // and get back a URL to store in the media field
      setMedia(URL.createObjectURL(file));
    }
  };

  const { userDetails, profilePic } = activeUser || {};
  const { name } = userDetails || {};
  const { url: profilePicture } = profilePic || {};

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Avatar
          src={profilePicture || ""}
          alt={name}
          className="w-10 h-10"
        />
        <div className="ml-3">
          <h3 className="font-semibold">{name}</h3>
          <CategoryTag category={category} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="text-gray-700 font-medium whitespace-nowrap">
            Category of your post:
          </label>
          <div className="relative flex-1">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-8 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Share your ${category.toLowerCase()}...`}
          className="w-full min-h-[120px] bg-gray-50 border border-gray-200 rounded-lg p-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
          rows={4}
        />

        {media ? (
          <div className="relative group">
            <img
              src={media}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => setMedia(null)}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="flex items-center justify-center w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex flex-col items-center">
                <CloudUploadIcon className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Click to upload an image</span>
              </div>
            </label>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              loading || !content.trim()
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600 hover:shadow"
            }`}
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost; 