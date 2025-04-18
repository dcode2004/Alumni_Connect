import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Avatar } from '@mui/material';

const CommentDialog = ({ open, onClose, comments, postId, onAddComment, newComment, setNewComment, activeUser }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          maxHeight: '80vh'
        }
      }}
    >
      <DialogTitle className="flex justify-between items-center border-b pb-4">
        <span className="text-xl font-semibold">Comments</span>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <div className="sticky top-0 z-10 bg-white border-b">
        {/* Add Comment Input */}
        <div className="flex items-center space-x-2 p-4">
          <Avatar 
            src={activeUser?.profilePic?.url || ''} 
            alt={activeUser?.userDetails?.name}
          />
          <div className="flex-1">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
          <button
            onClick={() => {
              onAddComment(postId);
            }}
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post
          </button>
        </div>
      </div>

      <DialogContent className="!pt-0">
        {/* Comments List */}
        <div className="space-y-4 mt-4">
          {comments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment, index) => (
              <div 
                key={index} 
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Avatar 
                  src={comment.userId?.profilePic?.url || ''} 
                  alt={comment.userId?.userDetails?.name}
                />
                <div className="flex-1">
                  <div className="flex items-baseline space-x-2">
                    <span className="font-semibold text-sm text-gray-900">
                      {comment.userId?.userDetails?.name || "Anonymous"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm mt-1">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog; 