import React from "react";

const PostItem = ({ post, currentUser, onLike, onDislike, onRemoveReaction, onDelete, onEdit }) => {
  const isLiked = currentUser && post.likes.some(like => like._id === currentUser._id || like === currentUser._id);
  const isDisliked = currentUser && post.dislikes.some(dislike => dislike._id === currentUser._id || dislike === currentUser._id);
  const isAuthor = currentUser && (post.author._id === currentUser._id || post.author === currentUser._id);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const handleLike = () => {
    if (isLiked) {
      onRemoveReaction(post._id);
    } else {
      onLike(post._id);
    }
  };

  const handleDislike = () => {
    if (isDisliked) {
      onRemoveReaction(post._id);
    } else {
      onDislike(post._id);
    }
  };

  return (
    <div className="post-item fade-in">
      <div className="post-header">
        <div className="post-author">
          <div className="author-avatar">
            {post.author.username.charAt(0).toUpperCase()}
          </div>
          <div className="author-info">
            <span className="author-name">@{post.author.username}</span>
            <span className="post-date">{formatDate(post.createdAt)}</span>
          </div>
        </div>
        {isAuthor && (
          <div className="post-actions">
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => onEdit(post)}
              aria-label="Edit post"
              title="Edit post"
            >
              ✏️
            </button>
            <button 
              className="btn btn-danger btn-sm" 
              onClick={() => onDelete(post._id)}
              aria-label="Delete post"
              title="Delete post"
            >
              🗑️
            </button>
          </div>
        )}
      </div>
      
      <div className="post-content">
        <h3 className="post-title">{post.title}</h3>
        <p className="post-text">{post.content}</p>
      </div>
      
      <div className="post-footer">
        <div className="reaction-buttons">
          <button 
            className={`reaction-btn like-btn ${isLiked ? 'active' : ''}`}
            onClick={handleLike}
            disabled={!currentUser}
            aria-label="Like post"
          >
            👍 {post.likes.length}
          </button>
          <button 
            className={`reaction-btn dislike-btn ${isDisliked ? 'active' : ''}`}
            onClick={handleDislike}
            disabled={!currentUser}
            aria-label="Dislike post"
          >
            👎 {post.dislikes.length}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostItem;
