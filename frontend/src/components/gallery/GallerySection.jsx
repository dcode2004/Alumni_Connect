"use client";
import * as React from "react";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import IconButton from "@mui/material/IconButton";
import InfoIcon from "@mui/icons-material/Info";
import useWindowSize from "../WindoSizeHook";
import { useState, useContext } from "react";
import CreateAGalleryPost from "./CreateAGalleryPost";
import { useEffect } from "react";
import BatchSkeleton from "@/app/batch/BatchSkeleton";
import PostLargerView from "./PostLargerView";
import activeUserAndLoginStatus from "@/context/activeUserAndLoginStatus/activeUserAndLoginStatusContext";
import moment from "moment-timezone";
import CloudIcon from '@mui/icons-material/Cloud';



export default function Gallery() {

  // context api
  const {activeUser} = useContext(activeUserAndLoginStatus);
  const {isSpecialUser} = activeUser != null && activeUser ;

  // Base API URL
  const baseApi = process.env.NEXT_PUBLIC_BASE_URL;

  const { width, height } = useWindowSize();
  const detectColumns = () => {
    if (width < 400) {
      return 2;
    }
    if (width < 900) {
      return 3;
    }
    return 4;
  };
  const [images, setImages] = useState(null);
  const [imagePreview, setImagePreview] = useState({
    preview: false, // default false
    imageIndex: null, // will be changed when clicked
  }); // to see larger image preview

  const handleImagePreview = (imageIndex) => {
    setImagePreview({
      preview: true,
      imageIndex,
    });
  };

  const closeImagePreview = () => {
    setImagePreview({
      preview: false,
      imageIndex: null,
    });
  };

  // fetch posts & then populate gallery section
  const fetchAllGalleryImages = async () => {
    try {
      // ----- local storage -----
      const token = localStorage.getItem("token");
      const url = `${baseApi}/api/gallery/fetch`;
      const fetchPosts = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      });
      const response = await fetchPosts.json();
      if (response.success) {
        setImages(response.data.posts);
        return;
      }

      setImages([]);
    } catch (error) {
      console.log("Some error in fetching gallery images ", error);
    }
  };

  useEffect(() => {
    fetchAllGalleryImages();
  }, []);

  return (
    <div className="p-4 pb-5">
      {imagePreview.preview && (
        <PostLargerView
          currentImageIndex={imagePreview.imageIndex}
          closeImagePreview={closeImagePreview}
          allPosts={images}
          setImages={setImages}
        />
      )}
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 dark:text-white transition-colors duration-300">Community Gallery</h1>
        <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Share and explore memorable moments from our community</p>
      </div>

      {(isSpecialUser === "admin" || isSpecialUser === "batchAdmin") && (
        <div className="mb-4">
          <CreateAGalleryPost setImages={setImages} />
        </div>
      )}

      <ImageList cols={detectColumns()} gap={16}>
        {images === null ? (
          Array.from({ length: 12 }, (_, index) => (
            <div key={index} className="w-full">
              <BatchSkeleton />
            </div>
          ))
        ) : images.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">
            No images have been added to the gallery yet
          </div>
        ) : (
          images.map((image, index) => {
            const { title, url, description, createdAt } = image;
            return (
              <ImageListItem
                className="!h-48 md:!h-64 cursor-pointer hover:opacity-95 transition-opacity"
                key={index}
                onClick={() => handleImagePreview(index)}
              >
                <img
                  srcSet={`${url}?w=248&fit=crop&auto=format&dpr=2 2x`}
                  src={`${url}`}
                  alt={title}
                  loading="lazy"
                  className="inline-block !h-full object-cover"
                />
                <ImageListItemBar
                  title={<p className="text-sm font-medium">{title}</p>}
                  subtitle={
                    <p className="flex items-center gap-1 text-xs">
                      <CloudIcon className="!w-4 !h-4" />
                      {moment(createdAt).format('ll')}
                    </p>
                  }
                  actionIcon={
                    <IconButton
                      sx={{ color: "rgba(255, 255, 255, 0.54)" }}
                      aria-label={`info about ${title}`}
                      onClick={() => handleImagePreview(index)}
                    >
                      <InfoIcon />
                    </IconButton>
                  }
                />
              </ImageListItem>
            );
          })
        )}
      </ImageList>
    </div>
  );
}
