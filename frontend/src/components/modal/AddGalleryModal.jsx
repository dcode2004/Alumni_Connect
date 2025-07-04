import React, { useState, useEffect, useContext } from "react";
import BasicModalBackground from "../modal/BasicModalBackground";
import CommonModalBox from "./CommonModalBox";
import GeneralButton from "../common/GeneralButton";
import CloseIcon from "@mui/icons-material/Close";
import { Button } from "@mui/material";
import { app } from "../../../firebase/firebase";
import randomString from "randomstring";
import { getStorage, ref, uploadBytes, getDownloadURL, } from "firebase/storage";
import loadingAndAlertContext from "@/context/loadingAndAlert/loadingAndAlertContext";
import activeUserAndLoginStatus from "@/context/activeUserAndLoginStatus/activeUserAndLoginStatusContext";
import useWindowSize from '../WindoSizeHook';

import moment from 'moment-timezone';
import { images } from "../../../next.config";

const AddGalleryModal = ({ setModal, setImages }) => {

    const {width, height} = useWindowSize();

  // Base API URL
  const baseApi = process.env.NEXT_PUBLIC_BASE_URL;

  // ------ firebase ----------
  const storage = getStorage(app);

  // ------ context API -----
  const { startLoading, createAlert ,stopLoading } = useContext(loadingAndAlertContext);
  const { fetchActiveUser, activeUser } = useContext(activeUserAndLoginStatus);
  const {name} = activeUser != null && activeUser.userDetails;
  // ----- local storage -----
  const token = localStorage.getItem("token");

  const [image, setImage] = useState("");
//   const updateImagesAfterUpload = (newImage)=>{
//     setImage((prev)=>{
//         console.log("Previous ", prev);
//         return [response.data.post, ...prev]
//     })
//   }
  const [imageDetails, setImageDetails] = useState({
    imageTitle: "",
    imageDescription : ""
  })
  const [customAlert, setCustomAlert] = useState({
    alert:false,
    msg:""
  })
  const createModalAlert = (msg)=>{
    setCustomAlert({
        alert:true,
        msg
    })
  }
//   console.log(moment().tz("Asia/Kolkata").format()); 
//   console.log(new Date(moment().tz("Asia/Kolkata").format()).getFullYear());

  useEffect(() => {
    if (customAlert.alert) {
        setTimeout(()=>{
            setCustomAlert({alert:false,msg:""});
        }, 3000)
    }
  }, [customAlert.alert, images])
  
  const handleImageDetailsChange = (e)=>{
     setImageDetails((prev)=>{
        return {...prev, [e.target.name] : e.target.value }
     })
  }
  const handleFileInput = (e) => {
    // this will be helpful when user opens file window & cancels without selecting any file. Because if file is undefined & set it directly to react hook. It cause problem.
    if (e.target.files[0] != undefined) {
      const selectedFile = e.target.files[0];
      const fileSize = selectedFile.size; // Size in bytes
      const maxSize = 500 * 1024 * 2 * 3; // 500 * 1024 * 2 = 1MB
      if (fileSize > maxSize) {
        createModalAlert(`File size is larger than ${maxSize/(500 * 1024 * 2)} MB`);
        return;
      }
      setImage(e.target.files[0]);
    }
  };

  const handleImageUpload = async () => {
    if (!image || !imageDetails.imageTitle.trim()) {
      createModalAlert("Please select an image and provide a title");
      return;
    }

    try {
      startLoading();
      
      const formData = new FormData();
      formData.append('image', image);
      formData.append('postTitle', imageDetails.imageTitle.trim());
      formData.append('postDescription', imageDetails.imageDescription.trim());
      formData.append('postYear', new Date().getFullYear().toString());

      const url = `${baseApi}/api/gallery/upload`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'token': token
        },
        body: formData
      });

      const data = await response.json();
      stopLoading();

      if (data.success) {
        setImages((prev) => [data.data.post, ...prev]);
        createAlert("success", "Image uploaded successfully");
        setModal(false);
      } else {
        createAlert("error", data.message || "Failed to upload image");
      }
    } catch (error) {
      stopLoading();
      console.error("Error uploading image:", error);
      createAlert("error", "Failed to upload image. Please try again.");
    }
  };

  return (
    <BasicModalBackground className="relative">
      <CloseIcon
        className="absolute top-0 right-0 text-white cursor-pointer"
        onClick={() => {
          setModal(false);
        }}
      />
      <CommonModalBox className={`overflow-y-scroll pl-2 pr-2 relative border-2 border-sky-500 w-[95%] md:w-[50%] ${height < 550 && "!min-h-full overflow-y-scroll"} rounded-lg bg-white `}>
        <CloseIcon
          className="absolute top-2 right-2 cursor-pointer"
          onClick={() => {
            setModal(false);
          }}
        />
        <div className="h-10 pl-2 text-white" >
           {customAlert.alert && <p className="bg-red-500 p-1" >{customAlert.msg}</p> }
        </div>
        <div className="h-28 w-auto m-1 p-2 mb-6 border border-gray-300">
          {image === "" ? (
            <p className="text-gray-300 text-sm">Image preview will be shown here</p>
          ) : (
            <img
              className="h-full"
              src={image !== "" ? `${URL.createObjectURL(image)}` : ""}
              alt="Image preview"
            />
          )}
        </div>
        <div className="mb-5 mr-3 flex items-center">
          <Button variant="contained" component="label">
            Choose Image
            <input
              accept=".png, .jpg, .jpeg"
              onChange={handleFileInput}
              type="file"
              value={""}
              hidden
            />
          </Button>
          {image !== "" && (
            <GeneralButton
              onClick={()=>{setImage("")}}
              className="!bg-red-500 hover:!bg-red-600"
            >
              Remove Image
            </GeneralButton>
          )}
        </div>
        <div className="mb-5" >
          <div className="flex flex-col mb-5">
            <label className="text-xs pl-1 text-gray-500" htmlFor="post title">
              Post Title <span className="text-red-400">(Required)</span>{" "}
            </label>
            <input
              className="w-80 outline-none border-b-2 border-sky-500 p-1"
              type="text"
              onChange={handleImageDetailsChange}
              value={imageDetails.imageTitle}
              name="imageTitle"
              autoComplete="off"
              placeholder="Ex: Ganesh puja celebration"
              required
            />
          </div>
          <div className="flex flex-col" >
            <label className="text-xs pl-1 text-gray-500" htmlFor="Post description">Post description <span>(Optional)</span> </label>
            <textarea
              className="w-80 h-14 outline-none border-b-2 p-1 border-sky-500"
              type="tex"
              onChange={handleImageDetailsChange}
              autoComplete="off"
              value={imageDetails.imageDescription}
              name="imageDescription"
              placeholder="Tell something more about post."
              required
            />
          </div>
        </div>

        <GeneralButton
          onClick={handleImageUpload}
          className={`${
            image !== "" && imageDetails.imageTitle !== "" 
              ? "!bg-green-500"
              : "!bg-gray-300 hover:!bg-gray-300 cursor-default"
          }  p-3 hover:!bg-green-600 `}
        >
          Upload Image
        </GeneralButton>
      </CommonModalBox>
    </BasicModalBackground>
  );
};

export default AddGalleryModal;
