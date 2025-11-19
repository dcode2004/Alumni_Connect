"use client";
import React from "react";
import { Card, CardContent, Typography, Button, Box, Chip } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import LinkIcon from "@mui/icons-material/Link";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const SeminarCard = ({ seminar, isUpcoming = true, onEdit, onDelete, isHost = false }) => {
  const seminarDate = new Date(seminar.seminarDate);
  const isPast = seminarDate < new Date();

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLinkClick = (e) => {
    e.stopPropagation();
    window.open(seminar.link, "_blank", "noopener,noreferrer");
  };

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 2,
        boxShadow: isUpcoming && !isPast ? 3 : 1,
        border: isUpcoming && !isPast ? "2px solid #3584FC" : "1px solid #e0e0e0",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-2px)",
        },
      }}
      className="dark:bg-gray-800 dark:border-gray-700"
    >
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 2 }}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: "#3584FC", flex: 1 }} className="dark:text-blue-400">
            {seminar.title}
          </Typography>
          {isUpcoming && !isPast && (
            <Chip
              label="Upcoming"
              color="primary"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
          {isPast && (
            <Chip
              label="Completed"
              size="small"
              sx={{ ml: 1, bgcolor: "#e0e0e0", color: "#666" }}
            />
          )}
        </Box>

        {seminar.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, lineHeight: 1.6 }}
            className="dark:text-gray-300"
          >
            {seminar.description}
          </Typography>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {/* Host */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <PersonIcon sx={{ fontSize: 18, color: "#666" }} className="dark:text-gray-400" />
            <Typography variant="body2" color="text.secondary" className="dark:text-gray-300">
              <strong>Host:</strong> {seminar.hostName || seminar.hostId?.userDetails?.name || "Unknown"}
            </Typography>
          </Box>

          {/* Date */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CalendarTodayIcon sx={{ fontSize: 18, color: "#666" }} className="dark:text-gray-400" />
            <Typography variant="body2" color="text.secondary" className="dark:text-gray-300">
              <strong>Date:</strong> {formatDate(seminarDate)}
            </Typography>
          </Box>

          {/* Time */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccessTimeIcon sx={{ fontSize: 18, color: "#666" }} className="dark:text-gray-400" />
            <Typography variant="body2" color="text.secondary" className="dark:text-gray-300">
              <strong>Time:</strong> {seminar.seminarTime}
            </Typography>
          </Box>

          {/* Link */}
          {isUpcoming && !isPast && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
              <LinkIcon sx={{ fontSize: 18, color: "#3584FC" }} />
              <Button
                variant="contained"
                size="small"
                endIcon={<OpenInNewIcon />}
                onClick={handleLinkClick}
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
                Join Seminar
              </Button>
            </Box>
          )}

          {/* Edit/Delete buttons for host */}
          {isHost && (
            <Box sx={{ display: "flex", gap: 1, mt: 2, pt: 2, borderTop: "1px solid #e0e0e0" }} className="dark:border-gray-700">
              <Button
                variant="outlined"
                size="small"
                onClick={() => onEdit(seminar)}
                sx={{ textTransform: "none" }}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                size="small"
                color="error"
                onClick={() => onDelete(seminar)}
                sx={{ textTransform: "none" }}
              >
                Delete
              </Button>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SeminarCard;

