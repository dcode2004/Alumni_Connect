import * as React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { Avatar, CardActionArea, Skeleton, Button } from "@mui/material";
import styles from "./page.module.css";
import AddIcon from "@mui/icons-material/Add";
import StudentModal from "./StudentModal";
import { useRouter } from "next/navigation";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import Link from "next/link";
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VerificationStatus from "@/components/header/VerificationStatus";
import { followUser, unfollowUser, getFollowStatus } from "@/services/followService";
import { useContext } from "react";
import activeUserAndLoginContext from "@/context/activeUserAndLoginStatus/activeUserAndLoginStatusContext";
import loadingAndAlertContext from "@/context/loadingAndAlert/loadingAndAlertContext";

const StudentCard = (props) => {
  const [open, setOpen] = React.useState(false);
  const [isFollowing, setIsFollowing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { activeUser, fetchActiveUser } = useContext(activeUserAndLoginContext);
  const { setAlert, setLoading } = useContext(loadingAndAlertContext);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const disableLink = (e) => {
    e.preventDefault();
  };
  const {email, status, fieldOfInterest, _id, jobDetails, batchId} = props.student != undefined && props.student;
  const {name, homeState} = props.student != undefined && props.student.userDetails;
  const {linkedInLink, githubLink} = props.student != undefined && props.student.userDetails.socialLinks;

  // Check if current user is following this user
  React.useEffect(() => {
    const checkFollowStatus = async () => {
      if (_id && activeUser && _id !== activeUser._id) {
        try {
          const response = await getFollowStatus(_id);
          setIsFollowing(response.isFollowing);
        } catch (error) {
          console.error("Error checking follow status:", error);
        }
      }
    };
    checkFollowStatus();
  }, [_id, activeUser]);

  const handleFollowAction = async (action) => {
    if (!activeUser) {
      console.log("No active user");
      return;
    }
    if (_id === activeUser._id) {
      console.log("Cannot follow self");
      return;
    }

    try {
      setIsLoading(true);
      console.log(`Attempting to ${action} user ${_id}`);
      
      if (action === 'unfollow') {
        const response = await unfollowUser(_id);
        console.log('Unfollow response:', response);
        setAlert({
          type: "success",
          message: `Unfollowed ${name}`
        });
        setIsFollowing(false);
      } else {
        const response = await followUser(_id);
        console.log('Follow response:', response);
        setAlert({
          type: "success",
          message: `Following ${name}`
        });
        setIsFollowing(true);
      }
      
      console.log('Refreshing user data...');
      await fetchActiveUser();
      console.log('User data refreshed');
    } catch (error) {
      console.error('Follow action error:', error);
      setAlert({
        type: "error",
        message: error.response?.data?.message || error.message || "Failed to update follow status"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={styles.card_item}>
      {props.cardType === "student" ? (
        <CardContent className={styles.card_item_content}>
          <span className="absolute top-0 left-2" >
            <VerificationStatus status={status} />
          </span>
          <Avatar
            style={{
              width: "150px",
              height: "150px",
              margin: "0.5rem 0 0.5rem 0"
            }}
            src={props.student.profilePic.url || ""}
          />
          <Typography
            style={{
              color: "black",
              fontSize: "1rem",
              fontWeight: "500",
            }}
            className="text-center"
            gutterBottom
            variant="p"
            component="div"
          >
            {name}
          </Typography>
          <Typography className="text-xs" >
            From : {homeState}
          </Typography>
          {/* Current Location */}
          {props.student.lastLogin?.location?.city && (
            <Typography className="text-xs mt-1 flex items-center gap-1" style={{ color: '#3584FC' }}>
              <LocationOnIcon sx={{ fontSize: '14px' }} />
              Currently in: {props.student.lastLogin.location.city}
              {props.student.lastLogin.location.state && `, ${props.student.lastLogin.location.state}`}
            </Typography>
          )}
          <div className="min-h-[64px] mt-2 overflow-y-auto" >
            {fieldOfInterest === "nothing selected" ? 
              <></>
            :
              <p className="flex flex-col mb-2" >
                <span className="block text-xs text-sky-400 text-center" >Field of Interest</span>
                <span className="block text-sm text-center" >{fieldOfInterest}</span>
              </p>
            }
            {!batchId?.isLatest && jobDetails && (
              <p className="flex flex-col mb-2" >
                <span className="block text-xs text-sky-400 text-center" >Current Position</span>
                <span className="block text-sm text-center font-medium" >{jobDetails.role}</span>
                <span className="block text-sm text-center" >{jobDetails.company}</span>
              </p>
            )}
          </div>
          <div className={styles.social_links_box}>
            <Link
              style={{
                color: `${
                  linkedInLink === ""
                    ? "#d0d0d1"
                    : "#088dec" 
                }`
              }}
              target="_blank"
              onClick={
                linkedInLink === "" &&
                disableLink
              }
              href={linkedInLink}
            >
              <LinkedInIcon className={styles.social_icon} />
            </Link>
            <Link
               style={{
                color: `${
                  githubLink === ""
                    ? "#d0d0d1"
                    : "#1F2328"
                }`, 
                marginRight:"0.5rem"
              }}
              target="_blank"
              onClick={
                githubLink === "" &&
                disableLink
              }
              href={githubLink}
            >
              <GitHubIcon className={styles.social_icon} />
            </Link>
          </div>
          {/* Follow/Unfollow Buttons */}
          {activeUser && _id !== activeUser._id && (
            <div className="flex gap-2 justify-center mt-2">
              <Button
                variant="outlined"
                size="small"
                disabled={isLoading || isFollowing}
                onClick={() => handleFollowAction('follow')}
                sx={{
                  minWidth: '60px',
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderColor: '#3584FC',
                  color: '#3584FC',
                  ...(isFollowing ? {
                    opacity: 0.5,
                    '&:hover': {
                      borderColor: '#3584FC',
                      opacity: 0.7
                    }
                  } : {
                    backgroundColor: 'rgba(53, 132, 252, 0.04)',
                    '&:hover': {
                      borderColor: '#3584FC',
                      backgroundColor: 'rgba(53, 132, 252, 0.08)'
                    }
                  })
                }}
              >
                {isLoading ? '...' : 'Follow'}
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={isLoading || !isFollowing}
                onClick={() => handleFollowAction('unfollow')}
                sx={{
                  minWidth: '60px',
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderColor: '#d32f2f',
                  color: '#d32f2f',
                  ...(!isFollowing ? {
                    opacity: 0.5,
                    '&:hover': {
                      borderColor: '#d32f2f',
                      opacity: 0.7
                    }
                  } : {
                    backgroundColor: 'rgba(211, 47, 47, 0.04)',
                    '&:hover': {
                      borderColor: '#d32f2f',
                      backgroundColor: 'rgba(211, 47, 47, 0.08)'
                    }
                  })
                }}
              >
                {isLoading ? '...' : 'Unfollow'}
              </Button>
            </div>
          )}
        </CardContent>
      ) : (
        <CardContent className={styles.card_item_content} >
        {/* ---- SKELETON -- */}
        <Skeleton
            variant="circular"
            style={{
              width: "150px",
              height: "150px",
              margin: "0.5rem 0 0.5rem 0"
            }}
          />
          <Skeleton
            variant="text"
            style={{
              width:"200px",
              fontSize: "1.2rem",
              fontWeight: "500",
              marginBottom: "0.5rem",
              marginTop: "0.8rem",
            }}
          />
          <div className={styles.social_links_box}>
            <Skeleton variant="rounded" width={25} height={25} className={styles.social_icon} />
            <Skeleton variant="rounded" width={25} height={25} className={styles.social_icon} />
          </div>
        </CardContent>
      )}
      <StudentModal open={open} handleClose={handleClose} />
    </Card>
  );
};

export default StudentCard;
