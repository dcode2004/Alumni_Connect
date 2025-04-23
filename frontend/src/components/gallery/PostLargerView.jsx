"use client";
import React, { useContext, useState } from "react";
import BasicModalBackground from "../modal/BasicModalBackground";
import CommonModalBox from "../modal/CommonModalBox";
import { Close } from "@mui/icons-material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import GeneralButton from "../common/GeneralButton";
import loadingAndAlertContext from "@/context/loadingAndAlert/loadingAndAlertContext";
import activeUserAndLoginStatus from "@/context/activeUserAndLoginStatus/activeUserAndLoginStatusContext";
import CloudIcon from '@mui/icons-material/Cloud';
import { CircularProgress } from "@mui/material";

import { app } from "../../../firebase/firebase";
import {
  getStorage,
  ref,
  deleteObject,
} from "firebase/storage";
import moment from "moment-timezone";

const PostLargerView = ({ currentImageIndex, allPosts, closeImagePreview, setImages }) => {
  // --- API URL ---
  const baseApi = process.env.NEXT_PUBLIC_BASE_URL;
  // ------ context API -----
  const { startLoading, createAlert, stopLoading } = useContext(
    loadingAndAlertContext
  );
  const { fetchActiveUser } = useContext(activeUserAndLoginStatus);

  // ----- local storage -----
  const token = localStorage.getItem("token");

  // ------ firebase ----------
  const storage = getStorage(app);

  const [activeImageIndex, setActiveImageIndex] = useState(currentImageIndex);
  const currentPost = allPosts[activeImageIndex];
  // Access properties directly from currentPost as they're not nested
  const { url, title, description, createdAt, _id } = currentPost || {};
  const docGivenName = currentPost?.docGivenName || currentPost?.fileName;
  const { activeUser } = useContext(activeUserAndLoginStatus);

  const handlePrevNext = (indexValue) => {
    if (indexValue > allPosts.length - 1 || indexValue < 0) {
      return;
    }
    setActiveImageIndex(indexValue);
  };

  const getYear = createdAt ? new Date(createdAt).getFullYear() : null;
  const deletePosts = async (postId) => {
    try {
      startLoading();

      if (!postId || !getYear) {
        throw new Error('Missing required information for deletion');
      }

      // Using the correct gallery endpoint with proper parameter structure
      const response = await fetch(
        `${baseApi}/api/gallery/delete/${postId}?postYear=${getYear}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            token: token
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error('Failed to delete post');
      }

      const data = await response.json();
      
      stopLoading();
      createAlert("success", "Post deleted successfully");
      setImages(prev => prev.filter(item => item._id !== postId));
      closeImagePreview();

    } catch (error) {
      stopLoading();
      console.error("Error deleting post:", error);
      createAlert("error", error.message || "Failed to delete post");
      closeImagePreview();
    }
  };

  // Add null check for rendering
  if (!currentPost) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-start justify-center z-40 mt-16"
      onClick={closeImagePreview}
    >
      <CommonModalBox 
        className="bg-white border border-gray-200 max-w-3xl w-[95%] relative p-3 rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <Close
          className="absolute right-2 top-2 cursor-pointer text-gray-600 hover:text-gray-800 z-10 bg-white rounded-full p-1"
          onClick={closeImagePreview}
        />

        <div>
          {/* Title and Date */}
          <div className="mb-2">
            <h3 className="text-lg font-medium pr-8">{title || 'Untitled'}</h3>
            <p className="text-gray-600 text-sm">
              <CloudIcon className="text-gray-500 mr-1" style={{ fontSize: '16px' }} />
              {moment(createdAt).format("ll")}
            </p>
          </div>

          {/* Image with Navigation */}
          <div className="relative">
            {activeImageIndex > 0 && (
              <button 
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevNext(activeImageIndex - 1);
                }}
              >
                <ArrowBackIosIcon className="text-gray-700" />
              </button>
            )}
            
            {activeImageIndex < allPosts.length - 1 && (
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevNext(activeImageIndex + 1);
                }}
              >
                <ArrowForwardIosIcon className="text-gray-700" />
              </button>
            )}

            {url ? (
              <img
                src={url}
                alt={title || 'Gallery image'}
                loading="lazy"
                className="max-h-[50vh] w-auto mx-auto"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="flex items-center justify-center h-48">
                <CircularProgress />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mt-3 max-h-[120px] overflow-y-auto">
            {description ? (
              <p className="text-gray-700">{description}</p>
            ) : (
              <p className="text-gray-500">No description available</p>
            )}
          </div>

          {/* Delete Button */}
          {activeUser.isSpecialUser === "admin" && (
            <div className="mt-3 flex justify-center">
              <GeneralButton
                buttonText="Delete Post"
                onClick={(e) => {
                  e.stopPropagation();
                  deletePosts(_id);
                }}
                className="!bg-red-500"
              />
            </div>
          )}
        </div>
      </CommonModalBox>
    </div>
  );
};

export default PostLargerView;
