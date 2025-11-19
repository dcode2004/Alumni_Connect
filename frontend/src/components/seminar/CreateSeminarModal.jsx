"use client";
import React, { useState, useContext } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from "@mui/material";
import loadingAndAlertContext from "@/context/loadingAndAlert/loadingAndAlertContext";

const CreateSeminarModal = ({ open, onClose, onSuccess, editingSeminar = null }) => {
  const [title, setTitle] = useState(editingSeminar?.title || "");
  const [description, setDescription] = useState(editingSeminar?.description || "");
  const [seminarDate, setSeminarDate] = useState(
    editingSeminar
      ? new Date(editingSeminar.seminarDate).toISOString().split("T")[0]
      : ""
  );
  const [seminarTime, setSeminarTime] = useState(editingSeminar?.seminarTime || "");
  const [link, setLink] = useState(editingSeminar?.link || "");

  const { startLoading, stopLoading, createAlert } = useContext(loadingAndAlertContext);
  const baseApi = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !seminarDate || !seminarTime.trim() || !link.trim()) {
      createAlert("error", "Please fill in all required fields");
      return;
    }

    // Validate link format
    try {
      new URL(link);
    } catch {
      createAlert("error", "Please enter a valid URL");
      return;
    }

    startLoading();
    try {
      const token = localStorage.getItem("token");
      const url = editingSeminar
        ? `${baseApi}/api/seminar/${editingSeminar._id}`
        : `${baseApi}/api/seminar/create`;

      const method = editingSeminar ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          seminarDate,
          seminarTime: seminarTime.trim(),
          link: link.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        createAlert("success", editingSeminar ? "Seminar updated successfully!" : "Seminar created successfully!");
        onSuccess();
        handleClose();
      } else {
        createAlert("error", data.message || "Failed to save seminar");
      }
    } catch (error) {
      console.error("Error saving seminar:", error);
      createAlert("error", "An error occurred. Please try again.");
    } finally {
      stopLoading();
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setSeminarDate("");
    setSeminarTime("");
    setLink("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" sx={{ fontWeight: 600, color: "#3584FC" }}>
          {editingSeminar ? "Edit Seminar" : "Host New Seminar"}
        </Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Seminar Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
              variant="outlined"
            />

            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              multiline
              rows={3}
              fullWidth
              variant="outlined"
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label="Date *"
                type="date"
                value={seminarDate}
                onChange={(e) => setSeminarDate(e.target.value)}
                required
                fullWidth
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                inputProps={
                  !editingSeminar
                    ? { min: new Date().toISOString().split("T")[0] }
                    : {}
                }
              />

              <TextField
                label="Time *"
                value={seminarTime}
                onChange={(e) => setSeminarTime(e.target.value)}
                required
                fullWidth
                variant="outlined"
                placeholder="e.g., 10:00 AM - 11:30 AM"
                helperText="Format: 10:00 AM - 11:30 AM"
              />
            </Box>

            <TextField
              label="Seminar Link *"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              required
              fullWidth
              variant="outlined"
              placeholder="https://meet.google.com/..."
              helperText="Enter the full URL for the seminar (Zoom, Google Meet, etc.)"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: "#3584FC !important",
              color: "#ffffff !important",
              "&:hover": { 
                bgcolor: "#2a6fd4 !important",
                color: "#ffffff !important",
              },
              "&:active": {
                bgcolor: "#1f5fb3 !important",
                color: "#ffffff !important",
              },
              "&:focus": {
                bgcolor: "#3584FC !important",
                color: "#ffffff !important",
              },
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            {editingSeminar ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateSeminarModal;

