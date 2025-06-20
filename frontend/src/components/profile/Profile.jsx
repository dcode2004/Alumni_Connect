"use client";
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Profile.module.css";
import {
  Avatar,
  Button,
  TextField,
  Typography,
  Box,
  Modal
} from "@mui/material";
import UserTypeForm from "../../app/registration/registrationform/UserTypeForm";
import activeUserAndLoginContext from "@/context/activeUserAndLoginStatus/activeUserAndLoginStatusContext";
import loadingAndAlertContext from "@/context/loadingAndAlert/loadingAndAlertContext";
import Alert from "@/components/common/Alert";
import Loading from "@/components/common/Loading";
import EditOption from "./EditOption";
import ProfileEditModal from "../modal/ProfileEditModal";
import FollowingListModal from '../modal/FollowingListModal';
import FollowersListModal from '../modal/FollowersListModal';
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import Link from "next/link";
import EditJobDetails from "./EditJobDetails";

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

const Profile = () => {
  const { activeUser, loginStatus, logOutUser, fetchActiveUser, setLoginStatus } = useContext(activeUserAndLoginContext);
  const { setLoading, setAlert, loading, alert } = useContext(
    loadingAndAlertContext
  );

  const { name, regNum, homeState, mobile, gradCourse, } = activeUser != null && activeUser.userDetails;
  const { batchNum, email, rollNum } = activeUser != null && activeUser;
  const { linkedInLink, githubLink } = activeUser != null && activeUser.userDetails.socialLinks;
  // registeringUser = 42 or 41
  // user = allDetails of user --> user.email is email id of user
  const router = useRouter();
  //user will automatically redirect if not done previous two step
  useEffect(() => {
    if (loginStatus === false) {
      router.push("/login")
    }
  }, [loginStatus]);


  const [modal, setModal] = useState(false); // to open & close modal
  const [modalType, setModalType] = useState(null);

  const closeModal = () => {
    setModal(false);
  }
  const showModal = (modalType) => {
    setModal(true);
    setModalType(modalType);
  }

  // New state for follow functionality
  const [followingModalOpen, setFollowingModalOpen] = useState(false);
  const [followersModalOpen, setFollowersModalOpen] = useState(false);

  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);

  return (
    <>
      <section className="page_section min-h-screen">
        {activeUser != null && loginStatus === true ? (
          <>
            {/* ---- Loading -----  */}
            {loading && <Loading />}
            {alert && <Alert alert={alert} />}

            <div className={styles.registration_main_container}>
              {modal && <ProfileEditModal userDetails={activeUser} closeModal={closeModal} modalType={modalType} />}

              {/* Following List Modal */}
              <FollowingListModal
                open={followingModalOpen}
                onClose={() => setFollowingModalOpen(false)}
                userId={activeUser._id}
              />

              {/* Followers List Modal */}
              <FollowersListModal
                open={followersModalOpen}
                onClose={() => setFollowersModalOpen(false)}
                userId={activeUser._id}
              />

              {/* top heading of form */}
              <div className={styles.register_top_container}>
                <UserTypeForm
                  mainHeading={name}
                  subHeading={batchNum + " Batch"}
                />
              </div>

              {/* actual form inputs */}
              <div className={styles.form_input_container}>

                {/* --- BOX 3 --- */}
                <div className={`${styles.input_box} ${styles.input_box3}`}>
                  <Typography style={{ color: "#3584FC", textAlign: "center" }} >Profile Picture</Typography>
                  <div className={styles.upload_profile_pic_box}>
                    <div className={styles.profile_box}>
                      <Avatar
                        alt={
                          activeUser.profilePic.url === ""
                            ? ""
                            : activeUser.userDetails.name
                        }
                        src={activeUser.profilePic.url || ""}
                        sx={{ width: 250, height: 250 }}
                      />
                    </div>
                  </div>
                  {/* Follow buttons */}
                  <div className="flex justify-center gap-4 mt-4 mb-2">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setFollowingModalOpen(true)}
                      sx={{
                        borderColor: '#3584FC',
                        color: '#3584FC',
                        '&:hover': {
                          borderColor: '#3584FC',
                          backgroundColor: 'rgba(53, 132, 252, 0.04)'
                        }
                      }}
                    >
                      Following {activeUser.following?.length > 0 && `(${activeUser.following.length})`}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setFollowersModalOpen(true)}
                      sx={{
                        borderColor: '#3584FC',
                        color: '#3584FC',
                        '&:hover': {
                          borderColor: '#3584FC',
                          backgroundColor: 'rgba(53, 132, 252, 0.04)'
                        }
                      }}
                    >
                      Followers {activeUser.followers?.length > 0 && `(${activeUser.followers.length})`}
                    </Button>
                  </div>
                  <EditOption className="flex justify-center mt-5" onClick={() => { showModal("profilePicture") }} editText={"Edit Profile picture"} />

                  {/* Job Details - Only show for previous batch students */}
                  {activeUser && !activeUser.isAdmin && activeUser.batchId && !activeUser.batchId.isLatest && (
                    <div className="mt-4">
                      <Typography variant="h6" gutterBottom sx={{ color: "#3584FC", textAlign: "center" }}>
                        Job Details
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Typography>
                          Company: {activeUser?.jobDetails?.company || "Not specified"}
                        </Typography>
                        <Typography>
                          Role: {activeUser?.jobDetails?.role || "Not specified"}
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setShowJobDetailsModal(true)}
                          sx={{
                            borderColor: '#3584FC',
                            color: '#3584FC',
                            '&:hover': {
                              borderColor: '#3584FC',
                              backgroundColor: 'rgba(53, 132, 252, 0.04)'
                            }
                          }}
                        >
                          Edit Job Details
                        </Button>
                      </Box>
                    </div>
                  )}
                </div>


                {/* Box 1 */}
                <div className={`${styles.input_box} ${styles.input_box1}`}>
                  {/* ---BATCH--- */}
                  <TextField
                    className={`${styles.input_field}`}
                    style={{ margin: "0.5rem", marginLeft: "0" }}
                    name="batch"
                    fullWidth
                    // id="outlined-basic"
                    label="Batch"
                    variant="filled"
                    placeholder="ex: 42"
                    value={batchNum}
                    disabled
                  />
                  {/* ---EMAIL---- */}
                  <TextField
                    style={{ margin: "0.5rem", marginLeft: "0" }}
                    className={`${styles.input_field}`}
                    name="email"
                    fullWidth
                    // id="outlined-basic"
                    label="Email"
                    value={email}
                    variant="filled"
                    placeholder="ex: rollno@lnmiit.ac.in"
                    disabled
                  />


                  {/* --- name --- */}
                  <TextField
                    className={styles.input_field}
                    style={{ margin: "0.5rem", marginLeft: "0" }}
                    name="fName"
                    value={name}
                    required
                    fullWidth
                    // id="filled-error-helper-text"
                    label="First name"
                    variant="filled"
                    disabled
                  />

                  {/* --- Home state --- */}
                  <TextField
                    className={styles.input_field}
                    style={{ margin: "0.5rem", marginLeft: "0" }}
                    name="homeState"
                    value={activeUser.userDetails.homeState || ""}
                    fullWidth
                    label="Home state"
                    variant="filled"
                    disabled
                  ></TextField>

                  {/* --- Graduation --- */}
                  <div className="relative" >
                    <TextField
                      className={`${styles.input_field}`}
                      name="gradCourse"
                      value={activeUser.userDetails.gradCourse}
                      style={{ margin: "0.5rem", marginLeft: "0" }}
                      fullWidth
                      label="Graduation course"
                      variant="filled"
                      disabled
                    />
                    <EditOption className={"absolute right-1 top-7"} onClick={() => { showModal("graduation") }} editText={"Edit"} />
                  </div>

                </div>

                {/* BOX 2 */}
                <div className={`${styles.input_box} ${styles.input_box2}`}>

                  {/* ---Field of Interest ---- */}
                  <div className="relative w-full" >
                    <TextField
                      className={`${styles.input_field}`}
                      style={{ margin: "0.5rem", marginRight: "0", marginLeft: "0" }}
                      name="fieldOfInterest"
                      value={activeUser.fieldOfInterest || ""}
                      label="Field of interest"
                      variant="filled"
                      disabled
                      fullWidth
                    />
                    <EditOption className={"absolute top-7 right-1"} onClick={() => { showModal("fieldOfInterest") }} editText={"Edit"} />
                  </div>

                  {/* --- ANY TAG PROVIDED ---*/}
                  <TextField
                    className={styles.input_field}
                    style={{ margin: "0.5rem", marginLeft: "0" }}
                    fullWidth
                    name="tag"
                    value={activeUser.tag || ""}
                    label="Any tag provided"
                    variant="filled"
                    helperText="Tags will be assigned by seniors/admin."
                    disabled
                  ></TextField>

                  {/* ------- SOCIAL LINKS -------- */}
                  <div className="mt-5" >
                    <div className="flex items-center" >
                      <h4 className="text-sm text-gray-400 mr-3">Social Links</h4> <EditOption onClick={() => { showModal("socialLinks") }} editText={"Edit"} />
                    </div>

                    {/* --- Linked In ---- */}
                    <div className="flex items-center" >
                      <TextField
                        className={styles.input_field}
                        fullWidth
                        style={{ margin: "0.5rem", marginLeft: "0" }}
                        name="linkedInLink"
                        value={
                          activeUser.userDetails.socialLinks.linkedInLink || ""
                        }
                        autoComplete="off"
                        label="LinkedIn Profile link"
                        variant="filled"
                        placeholder="ex: https://www.linkedin.com/in/..."
                        disabled
                      />

                      {linkedInLink === "" ?
                        <span
                          className={`${linkedInLink === "" ? "text-gray-300/30" : "text-sky-500"} mr-1 text-lg`}
                        >
                          <LinkedInIcon />
                        </span>
                        :
                        <Link
                          className={`${linkedInLink === "" ? "text-gray-300/30" : "text-sky-500"} mr-1 text-lg`}
                          target="_blank"
                          href={linkedInLink}
                        >
                          <LinkedInIcon />
                        </Link>
                      }

                    </div>

                    {/* --- GITHUB --- */}
                    <div className="flex items-center" >
                      <TextField
                        className={styles.input_field}
                        fullWidth
                        name="githubLink"
                        style={{ margin: "0.5rem", marginLeft: "0" }}
                        value={
                          activeUser.userDetails.socialLinks.githubLink || ""
                        }
                        autoComplete="off"
                        label="Github Profile link"
                        variant="filled"
                        placeholder="ex: https://github.com/..."
                        disabled
                      />

                      {githubLink === "" ?
                        <span
                          className={`text-gray-300/30`}
                        >
                          <GitHubIcon />
                        </span>
                        :
                        <Link
                          className={`text-black mr-1 text-lg`}
                          target="_blank"
                          href={githubLink}
                        >
                          <GitHubIcon />
                        </Link>
                      }
                    </div>


                  </div>
                </div>


              </div>

              {/* actual form inputs ends */}
              <div className="flex items-center justify-center" style={{ margin: "0.5rem", marginTop: "5rem" }}>
                <Button
                  onClick={() => {
                    logOutUser()
                  }}
                  className={styles.submit_button}
                  variant="contained"
                  component="label"
                  style={{
                    backgroundColor: "red",
                    width: "200px",
                    height: "3rem",
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>
          </>
        ) : (
          <Loading />
        )}
      </section>

      <Modal
        open={showJobDetailsModal}
        onClose={() => setShowJobDetailsModal(false)}
      >
        <Box sx={modalStyle}>
          <EditJobDetails closeModal={() => setShowJobDetailsModal(false)} />
        </Box>
      </Modal>
    </>
  );
};

export default Profile;