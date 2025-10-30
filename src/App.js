import React, { useState, useEffect } from "react";
import "./App.css";
import api from "./axios";
import AuthForm from "./components/AuthForm";
import PostItem from "./components/PostItem";

function App() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authMode, setAuthMode] = useState("signin");
  const [editingPost, setEditingPost] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const { data: authData } = await api.get("/api/auth/me");
        setUser(authData.user);
      } catch (err) {
        console.error("Failed fetching user:", err);
      }
    };

    fetchUserData();
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data: postsData } = await api.get("/api/posts");
      setPosts(postsData);
    } catch (err) {
      console.error("Failed fetching posts:", err);
    }
  };

  const handleAuthSuccess = async (authedUser) => {
    setUser(authedUser);
    await fetchPosts();
  };

  const createPost = async () => {
    if (!title.trim() || !content.trim()) return;
    
    try {
      const res = await api.post("/api/posts", { title, content });
      setPosts([res.data, ...posts]);
      setTitle("");
      setContent("");
      setShowCreateForm(false);
    } catch (err) {
      console.error("Failed creating post:", err);
    }
  };

  const updatePost = async () => {
    if (!title.trim() || !content.trim()) return;
    
    try {
      const res = await api.put(`/api/posts/${editingPost._id}`, { title, content });
      setPosts(posts.map((p) => (p._id === editingPost._id ? res.data : p)));
      setTitle("");
      setContent("");
      setEditingPost(null);
    } catch (err) {
      console.error("Failed updating post:", err);
    }
  };

  const deletePost = async (id) => {
    try {
      await api.delete(`/api/posts/${id}`);
      setPosts(posts.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Failed deleting post:", err);
    }
  };

  const likePost = async (id) => {
    try {
      const res = await api.post(`/api/posts/${id}/like`);
      setPosts(posts.map((p) => (p._id === id ? res.data : p)));
    } catch (err) {
      console.error("Failed liking post:", err);
    }
  };

  const dislikePost = async (id) => {
    try {
      const res = await api.post(`/api/posts/${id}/dislike`);
      setPosts(posts.map((p) => (p._id === id ? res.data : p)));
    } catch (err) {
      console.error("Failed disliking post:", err);
    }
  };

  const removeReaction = async (id) => {
    try {
      const res = await api.delete(`/api/posts/${id}/reaction`);
      setPosts(posts.map((p) => (p._id === id ? res.data : p)));
    } catch (err) {
      console.error("Failed removing reaction:", err);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setTitle(post.title);
    setContent(post.content);
    setShowCreateForm(true);
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setTitle("");
    setContent("");
    setShowCreateForm(false);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setUser(null);
    setPosts([]);
  };

  if (!user) {
    return (
      <div className="app">
        <div className="container">
          <div className="auth-form">
            <div className="card">
              <div className="card-header">
                <div className="logo">
                  <div className="logo-icon">💬</div>
                  <div className="logo-text">Forum</div>
                </div>
                <p className="card-subtitle">Sign in to join the discussion</p>
              </div>
              <div className="card-body">
                <AuthForm mode={authMode} onAuthSuccess={handleAuthSuccess} />
                <p className="auth-toggle">
                  {authMode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}
                  >
                    {authMode === "signin" ? "Sign Up" : "Sign In"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">💬</div>
            <div className="logo-text">Forum</div>
          </div>
          <div className="user-menu">
            <div className="user-info">
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">Welcome, {user.username}!</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="content">
            {!showCreateForm ? (
              <button 
                className="btn btn-primary btn-lg" 
                onClick={() => setShowCreateForm(true)}
                style={{ width: '100%', marginBottom: 'var(--space-6)' }}
              >
                 Create New Post
              </button>
            ) : (
              <div className="create-post-form">
                <h3>{editingPost ? "✏️ Edit Post" : " Create New Post"}</h3>
                <div className="form">
                  <div className="form-group">
                    <input
                      className="form-input"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Post title..."
                    />
                  </div>
                  <div className="form-group">
                    <textarea
                      className="form-input textarea"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="What's on your mind?"
                      rows="4"
                    />
                  </div>
                  <div className="form-actions">
                    <button 
                      className="btn btn-primary" 
                      onClick={editingPost ? updatePost : createPost}
                    >
                      {editingPost ? "Update Post" : "Create Post"}
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="posts-list">
              {posts.length === 0 ? (
                <div className="no-posts">
                  <div className="no-posts-icon">💭</div>
                  <p>No posts yet. Be the first to start a discussion!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostItem
                    key={post._id}
                    post={post}
                    currentUser={user}
                    onLike={likePost}
                    onDislike={dislikePost}
                    onRemoveReaction={removeReaction}
                    onDelete={deletePost}
                    onEdit={handleEdit}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;