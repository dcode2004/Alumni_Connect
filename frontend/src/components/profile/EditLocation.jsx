import React, { useState, useContext } from "react";
import CommonModalBox from "../modal/CommonModalBox";
import { TextField } from "@mui/material";
import GeneralButton from "../common/GeneralButton";
import loadingAndAlertContext from "@/context/loadingAndAlert/loadingAndAlertContext";
import activeUserAndLoginStatus from "@/context/activeUserAndLoginStatus/activeUserAndLoginStatusContext";

const EditLocation = ({ location, closeModal }) => {
  const [city, setCity] = useState(location?.city || "");
  const [state, setState] = useState(location?.state || "");
  const [country, setCountry] = useState(location?.country || "");

  // --- API URL ---
  const baseApi = process.env.NEXT_PUBLIC_BASE_URL;
  // ------ context API -----
  const { startLoading, createAlert, stopLoading } = useContext(loadingAndAlertContext);
  const { fetchActiveUser } = useContext(activeUserAndLoginStatus);

  // ----- local storage -----
  const token = localStorage.getItem("token");

  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  const handleStateChange = (e) => {
    setState(e.target.value);
  };

  const handleCountryChange = (e) => {
    setCountry(e.target.value);
  };

  const handleLocationUpdate = async () => {
    if (!city.trim() || !state.trim() || !country.trim()) {
      createAlert("warning", "Please fill in all location fields");
      return;
    }

    try {
      startLoading();
      const url = `${baseApi}/api/user/editProfile/location`;
      const updateLocation = await fetch(url, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({ 
          city: city.trim(),
          state: state.trim(),
          country: country.trim()
        })
      });
      const response = await updateLocation.json();
      stopLoading();
      closeModal();
      fetchActiveUser();
      if (response.success) {
        createAlert("success", response.message);
        return;
      }
      createAlert("error", response.message);
    } catch (error) {
      stopLoading();
      closeModal();
      console.log("There is some error : ", error);
      createAlert("error", "Some error in updating location");
    }
  };

  const hasChanges = 
    city !== (location?.city || "") ||
    state !== (location?.state || "") ||
    country !== (location?.country || "");

  return (
    <CommonModalBox>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Edit Current Location</h2>
      <p className="text-sm text-gray-500 mb-4">
        Update your current location. This will be visible to other users.
      </p>
      
      <TextField
        className="mb-4"
        name="city"
        value={city}
        onChange={handleCityChange}
        label="City"
        variant="filled"
        fullWidth
        required
        placeholder="e.g., Jaipur"
      />
      
      <TextField
        className="mb-4"
        name="state"
        value={state}
        onChange={handleStateChange}
        label="State"
        variant="filled"
        fullWidth
        required
        placeholder="e.g., Rajasthan"
      />
      
      <TextField
        className="mb-6"
        name="country"
        value={country}
        onChange={handleCountryChange}
        label="Country"
        variant="filled"
        fullWidth
        required
        placeholder="e.g., India"
      />
      
      <div className="h-10 flex justify-center items-center">
        {!hasChanges ? (
          <GeneralButton
            disabled={true}
            className="!bg-green-200 hover:!bg-green-200 cursor-not-allowed p-2"
            buttonText={"Save changes"}
          />
        ) : (
          <GeneralButton
            onClick={handleLocationUpdate}
            className="!bg-green-500 hover:!bg-green-600 p-2"
            buttonText={"Save changes"}
          />
        )}
      </div>
    </CommonModalBox>
  );
};

export default EditLocation;

