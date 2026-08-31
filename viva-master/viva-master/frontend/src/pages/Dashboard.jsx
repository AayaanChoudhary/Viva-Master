import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Upload, FileText, LogOut, Shield, Trash2, Code, Share2, Database } from 'lucide-react';
import { io } from 'socket.io-client';

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  
  // AI Chat States
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchFiles();

    // Setup Socket.IO for Real-time Communication
    const socket = io('http://localhost:5000');
    
    socket.on('file_updated', (data) => {
      // Show toast or alert (using alert for simplicity, but a toast UI is better)
      console.log('Real-time event:', data.message);
      // Automatically refresh the file list when someone uploads/deletes a file
      fetchFiles();
    });

    return () => socket.disconnect();
  }, [navigate, token]);

  const fetchFiles = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('http://localhost:5000/api/files', config);
      setFiles(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch files');
      setLoading(false);
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  const handleFileChange = (e) => {
    setUploadFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      };
      await axios.post('http://localhost:5000/api/files/upload', formData, config);
      setUploadFile(null);
      
      // Reset file input UI
      document.getElementById('fileInput').value = '';
      
      fetchFiles(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5000/api/files/${fileId}`, config);
      fetchFiles(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete file');
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatQuery.trim()) return;

    const userMessage = { role: 'user', text: chatQuery };
    setChatHistory([...chatHistory, userMessage]);
    setChatQuery('');
    setChatLoading(true);

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post('http://localhost:5000/api/ai/chat', { query: userMessage.text }, config);
      
      const aiMessage = { 
        role: 'ai', 
        text: res.data.answer,
        logs: res.data.logs 
      };
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'error', text: 'AI Error: ' + err.message }]);
    } finally {
      setChatLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header card">
        <div className="user-info">
          <h2>Welcome, {user?.name}</h2>
          <span className={`badge ${user?.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
            {user?.role === 'admin' && <Shield size={14} className="mr-1" />}
            {user?.role.toUpperCase()}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/hoisting-demo" className="btn outline">
            <Code size={16} /> Hoisting
          </Link>
          <Link to="/promises-vs-callbacks" className="btn outline">
            <Code size={16} /> Promises vs Callbacks
          </Link>
          <Link to="/sql-joins" className="btn outline">
            <Database size={16} /> SQL JOINs
          </Link>
          <button onClick={logout} className="btn outline">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="upload-section card">
          <h3>Upload a File</h3>
          <form onSubmit={handleUpload} className="upload-form">
            <input
              type="file"
              id="fileInput"
              onChange={handleFileChange}
              className="file-input"
            />
            <button 
              type="submit" 
              className="btn primary" 
              disabled={!uploadFile || uploading}
            >
              {uploading ? 'Uploading...' : <><Upload size={16} /> Upload</>}
            </button>
          </form>
          {error && <p className="text-error mt-2">{error}</p>}
        </div>

        {/* AI File Assistant */}
        <div className="ai-chat-section card" style={{ marginTop: '2rem' }}>
          <h3>AI File Assistant</h3>
          <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
            Ask me to summarize your text files! (e.g. "Summarize my file" or "ignore previous instructions")
          </p>
          
          <div className="chat-history" style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
            {chatHistory.length === 0 && <p className="text-secondary text-center">No messages yet.</p>}
            {chatHistory.map((msg, idx) => (
              <div key={idx} style={{ marginBottom: '1rem', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                <span className={`badge ${msg.role === 'user' ? 'badge-user' : msg.role === 'error' ? 'badge-error' : 'badge-admin'}`} style={{ marginBottom: '0.5rem' }}>
                  {msg.role.toUpperCase()}
                </span>
                <p style={{ fontSize: '0.9rem', color: msg.role === 'error' ? 'var(--error)' : 'white' }}>{msg.text}</p>
                {msg.logs && (
                  <details style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'left' }}>
                    <summary>Agent Thought Process</summary>
                    <ul style={{ marginLeft: '1rem', marginTop: '0.25rem' }}>
                      {msg.logs.map((log, i) => (
                        <li key={i}><strong>{log.step}:</strong> {log.detail}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </div>
            ))}
            {chatLoading && <div className="spinner-small" style={{ margin: '0 auto' }}></div>}
          </div>

          <form onSubmit={handleChatSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              placeholder="Ask the AI about your files..."
              className="form-control"
              style={{ flex: 1 }}
              disabled={chatLoading}
            />
            <button type="submit" className="btn primary" disabled={chatLoading || !chatQuery.trim()}>
              Ask
            </button>
          </form>
        </div>

        <div className="files-section card">
        <h3>{user?.role === 'admin' ? 'All System Files' : 'Your Files'}</h3>
          
          {loading ? (
            <div className="loading-state">
              <div className="spinner-small"></div>
              <p>Loading files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} className="text-secondary" />
              <p>No files uploaded yet.</p>
            </div>
          ) : (
            <ul className="file-list">
              {files.map(file => (
                <li key={file._id} className="file-item">
                  <div className="file-info">
                    <FileText className="text-primary" />
                    <div>
                      <p className="file-name">{file.originalname}</p>
                      <p className="file-meta">
                        {(file.size / 1024).toFixed(2)} KB
                        {user?.role === 'admin' && file.user && ` • Uploaded by: ${file.user.email}`}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a 
                      href={`http://localhost:5000/api/files/share/${file._id}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn icon-btn outline" 
                      title="Public SSR Share Link"
                    >
                      <Share2 size={16} />
                    </a>
                    <button 
                      onClick={() => handleDelete(file._id)} 
                      className="btn icon-btn danger" 
                      title="Delete File"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
