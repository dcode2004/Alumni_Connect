"use client";
import React, { useState, useEffect, useContext } from "react";
import { Box, Typography, Button, Container, Tabs, Tab } from "@mui/material";
import SeminarCard from "@/components/seminar/SeminarCard";
import CreateSeminarModal from "@/components/seminar/CreateSeminarModal";
import Loading from "@/components/common/Loading";
import ActiveUserAndLoginStatusContext from "@/context/activeUserAndLoginStatus/activeUserAndLoginStatusContext";
import loadingAndAlertContext from "@/context/loadingAndAlert/loadingAndAlertContext";
import AddIcon from "@mui/icons-material/Add";
import EventIcon from "@mui/icons-material/Event";

const SeminarPage = () => {
  const [seminars, setSeminars] = useState({ upcoming: [], previous: [] });
  const [loading, setLoading] = useState(true);
  const [canHost, setCanHost] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingSeminar, setEditingSeminar] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const { activeUser, loginStatus } = useContext(ActiveUserAndLoginStatusContext);
  const { createAlert, startLoading, stopLoading } = useContext(loadingAndAlertContext);

  const baseApi = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    fetchSeminars();
    if (loginStatus && activeUser) {
      checkCanHost();
    }
  }, [loginStatus, activeUser]);

  const fetchSeminars = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${baseApi}/api/seminar/`);
      const data = await response.json();
      if (data.success) {
        setSeminars({
          upcoming: data.upcoming || [],
          previous: data.previous || [],
        });
      } else {
        createAlert("error", "Failed to fetch seminars");
      }
    } catch (error) {
      console.error("Error fetching seminars:", error);
      createAlert("error", "An error occurred while fetching seminars");
    } finally {
      setLoading(false);
    }
  };

  const checkCanHost = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseApi}/api/seminar/canHost`, {
        headers: { token },
      });
      const data = await response.json();
      if (data.success) {
        setCanHost(data.canHost);
      }
    } catch (error) {
      console.error("Error checking host status:", error);
    }
  };

  const handleCreateSuccess = () => {
    fetchSeminars();
    setEditingSeminar(null);
  };

  const handleEdit = (seminar) => {
    setEditingSeminar(seminar);
    setCreateModalOpen(true);
  };

  const handleDelete = async (seminar) => {
    if (!window.confirm("Are you sure you want to delete this seminar?")) {
      return;
    }

    startLoading();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${baseApi}/api/seminar/${seminar._id}`, {
        method: "DELETE",
        headers: { token },
      });

      const data = await response.json();
      if (data.success) {
        createAlert("success", "Seminar deleted successfully!");
        fetchSeminars();
      } else {
        createAlert("error", data.message || "Failed to delete seminar");
      }
    } catch (error) {
      console.error("Error deleting seminar:", error);
      createAlert("error", "An error occurred while deleting the seminar");
    } finally {
      stopLoading();
    }
  };

  const handleCloseModal = () => {
    setCreateModalOpen(false);
    setEditingSeminar(null);
  };

  const isHost = (seminar) => {
    if (!activeUser) return false;
    return String(seminar.hostId?._id || seminar.hostId) === String(activeUser._id);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <section className="page_section" style={{ minHeight: "calc(100vh - 100px)", padding: "2rem 0" }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <EventIcon sx={{ fontSize: 40, color: "#3584FC" }} className="dark:text-blue-400" />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: "#3584FC" }} className="dark:text-blue-400">
              Seminars
            </Typography>
          </Box>
          {canHost && loginStatus && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingSeminar(null);
                setCreateModalOpen(true);
              }}
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
              Host Seminar
            </Button>
          )}
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }} className="dark:border-gray-600">
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} className="dark:text-white">
            <Tab label={`Upcoming (${seminars.upcoming.length})`} className="dark:text-gray-300" />
            <Tab label={`Previous (${seminars.previous.length})`} className="dark:text-gray-300" />
          </Tabs>
        </Box>

        {/* Content */}
        {tabValue === 0 ? (
          <Box>
            {seminars.upcoming.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  bgcolor: "#f5f5f5",
                  borderRadius: 2,
                }}
                className="dark:bg-gray-800"
              >
                <EventIcon sx={{ fontSize: 60, color: "#ccc", mb: 2 }} className="dark:text-gray-600" />
                <Typography variant="h6" color="text.secondary" className="dark:text-gray-300">
                  No upcoming seminars
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }} className="dark:text-gray-400">
                  Check back later for new seminars
                </Typography>
              </Box>
            ) : (
              seminars.upcoming.map((seminar) => (
                <SeminarCard
                  key={seminar._id}
                  seminar={seminar}
                  isUpcoming={true}
                  isHost={isHost(seminar)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </Box>
        ) : (
          <Box>
            {seminars.previous.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  bgcolor: "#f5f5f5",
                  borderRadius: 2,
                }}
                className="dark:bg-gray-800"
              >
                <EventIcon sx={{ fontSize: 60, color: "#ccc", mb: 2 }} className="dark:text-gray-600" />
                <Typography variant="h6" color="text.secondary" className="dark:text-gray-300">
                  No previous seminars
                </Typography>
              </Box>
            ) : (
              seminars.previous.map((seminar) => (
                <SeminarCard
                  key={seminar._id}
                  seminar={seminar}
                  isUpcoming={false}
                  isHost={isHost(seminar)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </Box>
        )}

        {/* Create/Edit Modal */}
        <CreateSeminarModal
          open={createModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleCreateSuccess}
          editingSeminar={editingSeminar}
        />
      </Container>
    </section>
  );
};

export default SeminarPage;

