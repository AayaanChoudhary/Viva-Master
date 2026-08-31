import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Form Validation (Frontend)
    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const config = { headers: { 'Content-Type': 'application/json' } };
      const body = JSON.stringify({ email, password });
      
      const res = await axios.post('http://localhost:5000/api/auth/login', body, config);
      
      // Save JWT token
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="card form-card">
        <div className="card-header text-center">
          <h2>Secure File Vault</h2>
          <p>Login to access your files</p>
        </div>

        {error && (
          <div className="error-alert mb-4">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              className="form-control"
              placeholder="Enter email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={onChange}
                className="form-control"
                placeholder="Enter password"
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn primary full-width" disabled={loading}>
            {loading ? <div className="spinner-small"></div> : <><LogIn size={18} /> Login</>}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          Don't have an account? <Link to="/register" className="text-primary">Register here</Link>
        </p>
      </div>
    </div>
  );
}
