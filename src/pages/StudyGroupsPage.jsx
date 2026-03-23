import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import firebase, { db, serverTimestamp, auth, googleProvider } from '../services/firebaseDb';

export default function StudyGroupsPage() {
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState("");
  const [fbUser, setFbUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setFbUser({
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
      } else {
        setFbUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!db) return;
    const unsubscribe = db.collection('groups').onSnapshot(snapshot => {
      if (snapshot.empty) {
        const defaultGroups = [
          { name: 'Physics 101' },
          { name: 'Data Structures' },
          { name: 'Math Revision' }
        ];
        defaultGroups.forEach(g => {
          const generatedId = g.name.replace(/\s+/g, '').toLowerCase();
          db.collection('groups').doc(generatedId).set({ id: generatedId, ...g });
        });
      } else {
        const fetchedGroups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setGroups(fetchedGroups);
        setActiveGroupId(prev => prev || fetchedGroups[0].id);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!db) return;

    const unsubscribe = db.collection('posts')
      .orderBy('createdAt', 'desc')
      .onSnapshot((snapshot) => {
        const fetchedPosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPosts(fetchedPosts);
        setIsLoadingPosts(false);
      }, () => {
        setIsLoadingPosts(false);
      });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (!auth) return;
    try {
      await auth.signInWithPopup(googleProvider);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePost = async () => {
    if (!newPostText.trim() || !fbUser || isPosting) return;
    
    setIsPosting(true);
    if (db) {
      try {
        await db.collection('posts').add({
          username: fbUser.displayName,
          userId: fbUser.uid,
          userAvatar: fbUser.photoURL,
          text: newPostText,
          likesCount: 0,
          likedBy: [],
          groupId: activeGroupId,
          createdAt: serverTimestamp()
        });
        setNewPostText("");
      } catch (e) {
        console.error("Error creating post:", e);
      }
    }
    setIsPosting(false);
  };

  const handleLike = async (post) => {
    if (!db || !fbUser) return;
    try {
      const likedBy = post.likedBy || [];
      const hasLiked = likedBy.includes(fbUser.uid);
      const postRef = db.collection('posts').doc(post.id);

      if (hasLiked) {
        await postRef.update({
          likedBy: firebase.firestore.FieldValue.arrayRemove(fbUser.uid),
          likesCount: firebase.firestore.FieldValue.increment(-1)
        });
      } else {
        await postRef.update({
          likedBy: firebase.firestore.FieldValue.arrayUnion(fbUser.uid),
          likesCount: firebase.firestore.FieldValue.increment(1)
        });
      }
    } catch (e) {
      console.error("Error updating likes:", e);
    }
  };

  return (
    <div className="study-groups-layout">
      {/* 1. Header row */}
      <div className="study-header">
        <h1>Study Groups</h1>
        <div className="study-header-actions">
          <select 
            className="group-selector"
            value={activeGroupId} 
            onChange={e => setActiveGroupId(e.target.value)}
          >
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Content section */}
      <div className="study-content">
        {/* Left: Feed */}
        <div className="study-feed">
          {/* Create Post Card */}
          <div className="create-post-card">
            {fbUser && fbUser.photoURL ? (
              <img src={fbUser.photoURL} alt="Avatar" className="create-post-avatar" />
            ) : (
              <div className="create-post-avatar avatar-placeholder">
                {fbUser && fbUser.displayName ? fbUser.displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "?"}
              </div>
            )}
            <div className="create-post-content">
              <textarea 
                className="create-post-input" 
                placeholder="Share something with your study group..." 
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handlePost();
                  }
                }}
                disabled={!fbUser || isPosting}
                maxLength={500}
              />
              <div className="create-post-actions">
                <button className="create-post-attach">Attach</button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {fbUser && (
                    <span style={{ fontSize: '13px', color: newPostText.length > 480 ? '#ef4444' : 'var(--text-secondary)' }}>
                      {newPostText.length}/500
                    </span>
                  )}
                  {!fbUser ? (
                    <button className="btn btn-primary" onClick={handleLogin}>Login to post</button>
                  ) : (
                    <button 
                      className="btn btn-primary" 
                      onClick={handlePost} 
                      disabled={!newPostText.trim() || isPosting}
                    >
                      {isPosting ? "Posting..." : "Post"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="posts-container" style={{ marginTop: '24px' }}>
            {isLoadingPosts ? (
              <>
                <div className="post-card">
                  <div className="post-header">
                    <div className="skeleton-avatar"></div>
                    <div className="post-meta">
                      <div className="skeleton-line" style={{ width: '120px' }}></div>
                      <div className="skeleton-line" style={{ width: '80px', height: '10px' }}></div>
                    </div>
                  </div>
                  <div className="post-content">
                    <div className="skeleton-line" style={{ width: '100%' }}></div>
                    <div className="skeleton-line" style={{ width: '90%' }}></div>
                    <div className="skeleton-line" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </>
            ) : posts.filter(post => !post.groupId || post.groupId === activeGroupId).length === 0 ? (
              <div className="empty-state">
                <p style={{ color: 'var(--text-secondary)' }}>No posts yet. Be the first to start the discussion!</p>
              </div>
            ) : (
              posts
                .filter(post => !post.groupId || post.groupId === activeGroupId)
                .map(post => {
                  let displayTime = "Just now";
                  if (post.createdAt?.toDate) {
                    const date = post.createdAt.toDate();
                    displayTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString();
                  }

                  return (
                    <PostCard 
                      key={post.id}
                      postId={post.id}
                      username={post.username}
                      userAvatar={post.userAvatar}
                      currentUser={fbUser}
                      timestamp={displayTime}
                      text={post.text}
                      likesCount={post.likesCount || post.likes || 0}
                      isLiked={post.likedBy ? post.likedBy.includes(fbUser?.uid) : false}
                      onLike={() => handleLike(post)}
                    />
                  );
                })
            )}
          </div>
        </div>

        {/* Right: Sidebar */}
        <div className="study-sidebar">
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Study Groups</h3>
            <div className="groups-list">
              {groups.map(g => (
                 <div 
                   key={g.id} 
                   className={`group-list-item ${g.id === activeGroupId ? 'active' : ''}`}
                   onClick={() => setActiveGroupId(g.id)}
                 >
                   {g.name}
                 </div>
              ))}
            </div>
          </div>
          
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">Active Students</h3>
            <div className="active-students-list">
              {[
                { name: "Emma Wilson", online: true },
                { name: "Liam Chen", online: true },
                { name: "Olivia Davis", online: true },
                { name: "Noah Martinez", online: true },
                { name: "Ava Taylor", online: true }
              ].map((student, idx) => (
                <div key={idx} className="active-student-row">
                  <div className="active-student-avatar-wrapper">
                    <div className="active-student-avatar avatar-placeholder">
                      {student.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    {student.online && <div className="online-indicator"></div>}
                  </div>
                  <span className="active-student-name">{student.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
