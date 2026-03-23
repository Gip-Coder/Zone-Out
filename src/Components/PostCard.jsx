import React, { useState, useEffect } from 'react';
import { db, serverTimestamp } from '../services/firebaseDb';

export default function PostCard({ postId, username, userAvatar, currentUser, text, timestamp, likesCount = 0, isLiked = false, onLike }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (!showComments || !db || !postId) return;

    const unsubscribe = db.collection('posts')
      .doc(postId)
      .collection('comments')
      .orderBy('createdAt', 'asc')
      .onSnapshot((snapshot) => {
        const fetchedComments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setComments(fetchedComments);
      });

    return () => unsubscribe();
  }, [showComments, postId]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !db || !postId || !currentUser) return;
    
    await db.collection('posts').doc(postId).collection('comments').add({
      username: currentUser.displayName,
      userId: currentUser.uid,
      text: newComment,
      createdAt: serverTimestamp()
    });
    setNewComment("");
  };

  return (
    <div className="post-card">
      <div className="post-header">
        {userAvatar ? (
          <img src={userAvatar} alt="Avatar" className="post-avatar" />
        ) : (
          <div className="post-avatar avatar-placeholder">
            {username ? username.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?"}
          </div>
        )}
        <div className="post-meta">
          <span className="post-username">{username}</span>
          <span className="post-timestamp">{timestamp}</span>
        </div>
      </div>
      <div className="post-content">
        {text}
      </div>
      <div className="post-actions">
        <button 
          className="post-action-btn" 
          onClick={onLike}
          style={isLiked ? { color: 'var(--accent-primary)' } : {}}
        >
          Like {likesCount > 0 && `(${likesCount})`}
        </button>
        <button 
          className="post-action-btn"
          onClick={() => setShowComments(!showComments)}
        >
          Comment
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <div className="comments-list">
            {comments.length === 0 ? (
              <div className="empty-state" style={{ padding: '8px 12px', fontSize: '14px', background: 'transparent', textAlign: 'left', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                No comments yet.
              </div>
            ) : (
              comments.map(c => (
                <div key={c.id} className="comment-item">
                  <span className="comment-username">{c.username}</span> 
                  <span className="comment-text">{c.text}</span>
                </div>
              ))
            )}
          </div>
          <div className="comment-input-row">
            <input 
              type="text" 
              className="comment-input" 
              placeholder={currentUser ? "Add a comment..." : "Login to comment"}
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePostComment()}
              disabled={!currentUser}
            />
            {currentUser && (
              <button className="btn btn-primary btn-sm" onClick={handlePostComment}>Post</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
