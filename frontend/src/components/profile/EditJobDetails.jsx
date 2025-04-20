"use client";
import React, { useContext, useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import loadingAndAlertContext from "@/context/loadingAndAlert/loadingAndAlertContext";
import activeUserAndLoginStatusContext from "@/context/activeUserAndLoginStatus/activeUserAndLoginStatusContext";

const EditJobDetails = ({ closeModal }) => {
  const { setLoading, setAlert } = useContext(loadingAndAlertContext);
  const { activeUser, fetchActiveUser } = useContext(activeUserAndLoginStatusContext);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const [jobDetails, setJobDetails] = useState({
    company: activeUser?.jobDetails?.company || "",
    role: activeUser?.jobDetails?.role || ""
  });

  const handleChange = (e) => {
    setJobDetails({
      ...jobDetails,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseUrl}/api/user/editProfile/jobDetails`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token
        },
        body: JSON.stringify(jobDetails)
      });

      const data = await response.json();

      if (data.success) {
        setAlert({
          alert: true,
          alertType: "success",
          alertMessage: "Job details updated successfully"
        });
        await fetchActiveUser();
        closeModal();
      } else {
        setAlert({
          alert: true,
          alertType: "error",
          alertMessage: data.message || "Failed to update job details"
        });
      }
    } catch (error) {
      setAlert({
        alert: true,
        alertType: "error",
        alertMessage: "An error occurred while updating job details"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Edit Job Details
      </Typography>

      <TextField
        fullWidth
        label="Company"
        name="company"
        value={jobDetails.company}
        onChange={handleChange}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label="Role"
        name="role"
        value={jobDetails.role}
        onChange={handleChange}
        margin="normal"
        required
      />

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={closeModal} variant="outlined">
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="contained" 
          sx={{
            backgroundColor: '#3584FC !important',
            '&:hover': {
              backgroundColor: '#1565C0 !important',
            }
          }}
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
};

export default EditJobDetails; 