import React from 'react';
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
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const FollowListModal = ({ open, onClose, title, users, type, onFollowAction, loadingStates }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <div className="flex justify-between items-center">
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent dividers>
        {users && users.length > 0 ? (
          <List>
            {users.map((user) => (
              <ListItem
                key={user._id}
                secondaryAction={
                  type === 'followers' ? (
                    !user.isFollowing && (
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={loadingStates[user._id]}
                        onClick={() => onFollowAction(user._id)}
                        sx={{
                          borderColor: '#3584FC',
                          color: '#3584FC',
                          '&:hover': {
                            borderColor: '#3584FC',
                            backgroundColor: 'rgba(53, 132, 252, 0.04)'
                          }
                        }}
                      >
                        Follow Back
                      </Button>
                    )
                  ) : (
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      disabled={loadingStates[user._id]}
                      onClick={() => onFollowAction(user._id)}
                    >
                      Unfollow
                    </Button>
                  )
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
              {type === 'followers' ? 'No followers yet' : 'Not following anyone'}
            </Typography>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FollowListModal; 