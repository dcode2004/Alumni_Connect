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
import { getFollowing, unfollowUser } from '@/services/followService';
import activeUserAndLoginContext from '@/context/activeUserAndLoginStatus/activeUserAndLoginStatusContext';

const FollowingListModal = ({ open, onClose, userId }) => {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({});
  const { fetchActiveUser } = useContext(activeUserAndLoginContext);

  useEffect(() => {
    if (open) {
      fetchFollowing();
    }
  }, [open, userId]);

  const fetchFollowing = async () => {
    try {
      setLoading(true);
      const response = await getFollowing(userId);
      if (response.success) {
        setFollowing(response.following);
      }
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (targetUserId) => {
    try {
      setLoadingStates(prev => ({ ...prev, [targetUserId]: true }));
      await unfollowUser(targetUserId);
      setFollowing(prev => prev.filter(user => user._id !== targetUserId));
      await fetchActiveUser();
    } catch (error) {
      console.error('Error unfollowing user:', error);
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
          <Typography variant="h6">Following</Typography>
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
        ) : following && following.length > 0 ? (
          <List>
            {following.map((user) => (
              <ListItem
                key={user._id}
                secondaryAction={
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    disabled={loadingStates[user._id]}
                    onClick={() => handleUnfollow(user._id)}
                  >
                    {loadingStates[user._id] ? (
                      <CircularProgress size={20} />
                    ) : (
                      'Unfollow'
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
              Not following anyone
            </Typography>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FollowingListModal; 