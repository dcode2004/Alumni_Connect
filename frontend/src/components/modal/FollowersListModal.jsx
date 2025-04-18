import React, { useState, useEffect, useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  IconButton,
  Typography,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { getFollowers, followUser, unfollowUser, getFollowStatus } from '@/services/followService';
import activeUserAndLoginContext from '@/context/activeUserAndLoginStatus/activeUserAndLoginStatusContext';

const FollowersListModal = ({ open, onClose, userId }) => {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({});
  const [followStatus, setFollowStatus] = useState({});
  const { fetchActiveUser } = useContext(activeUserAndLoginContext);

  useEffect(() => {
    if (open) {
      fetchFollowers();
    }
  }, [open, userId]);

  const fetchFollowers = async () => {
    try {
      setLoading(true);
      const response = await getFollowers(userId);
      if (response.success) {
        setFollowers(response.followers);
        // Check follow status for each follower
        const statusPromises = response.followers.map(user => 
          getFollowStatus(user._id)
        );
        const statusResults = await Promise.all(statusPromises);
        const statusMap = {};
        response.followers.forEach((user, index) => {
          statusMap[user._id] = statusResults[index].success && statusResults[index].isFollowing;
        });
        setFollowStatus(statusMap);
      }
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowAction = async (targetUserId) => {
    try {
      setLoadingStates(prev => ({ ...prev, [targetUserId]: true }));
      const isFollowing = followStatus[targetUserId];
      
      if (isFollowing) {
        await unfollowUser(targetUserId);
        setFollowStatus(prev => ({ ...prev, [targetUserId]: false }));
      } else {
        await followUser(targetUserId);
        setFollowStatus(prev => ({ ...prev, [targetUserId]: true }));
      }
      
      await fetchActiveUser();
    } catch (error) {
      console.error('Error updating follow status:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, [targetUserId]: false }));
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <div className="flex justify-between items-center">
          <Typography variant="h6">Followers</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <div className="flex justify-center py-4">
            <CircularProgress />
          </div>
        ) : followers && followers.length > 0 ? (
          <List>
            {followers.map((user) => (
              <ListItem
                key={user._id}
                secondaryAction={
                  <Button
                    variant="outlined"
                    size="small"
                    color={followStatus[user._id] ? "error" : "primary"}
                    disabled={loadingStates[user._id]}
                    onClick={() => handleFollowAction(user._id)}
                    sx={!followStatus[user._id] ? {
                      borderColor: '#3584FC',
                      color: '#3584FC',
                      '&:hover': {
                        borderColor: '#3584FC',
                        backgroundColor: 'rgba(53, 132, 252, 0.04)'
                      }
                    } : undefined}
                  >
                    {loadingStates[user._id] ? (
                      <CircularProgress size={20} />
                    ) : (
                      followStatus[user._id] ? 'Unfollow' : 'Follow Back'
                    )}
                  </Button>
                }
              >
                <ListItemAvatar>
                  <Avatar 
                    src={user.profilePic?.url || ''} 
                    alt={user.userDetails?.name}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={user.userDetails?.name || 'Unknown'}
                  secondary={
                    <React.Fragment>
                      <Typography component="span" variant="body2" color="text.primary">
                        {user.email}
                      </Typography>
                      <br />
                      {`Batch ${user.batchNum}`}
                    </React.Fragment>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <div className="text-center py-4">
            <Typography color="text.secondary">
              No followers yet
            </Typography>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FollowersListModal; 