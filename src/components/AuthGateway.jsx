import { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { useTheme } from '../context/ThemeContext';
import { Shield, Sparkles, Sun, Moon } from 'lucide-react';

export const AuthGateway = () => {
  const { login, signup } = useCRM();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('login'); // 'login', 'signup', 'forgot'
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: 'harshital784@gmail.com',
    password: 'harshita@0807',
    agree: false
  });
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (activeTab === 'login') {
        await login(formData.email, formData.password);
      } else if (activeTab === 'signup') {
        const data = await signup(formData.email, formData.password, formData.name);
        if (data && !data.session) {
          setSuccessMessage("Account registered successfully! Please check your email for a verification link.");
        } else {
          setSuccessMessage("Account created successfully! Logging you in...");
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "An authentication error occurred. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      {/* Top right theme toggle */}
      <button 
        onClick={toggleTheme}
        className="btn btn-secondary" 
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          borderRadius: '50%',
          padding: '12px',
          zIndex: 10
        }}
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div 
        className="glass-panel animate-fade-in" 
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '40px',
          position: 'relative',
          zIndex: 1,
          border: '1px solid var(--glass-border)',
          background: 'var(--bg-card)'
        }}
      >
        {/* Header / Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
              color: '#ffffff',
              marginBottom: '16px',
              boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)'
            }}
          >
            <Shield size={24} />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>Nexus</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Enterprise-grade sales performance & client automation
          </p>
        </div>

        {error && (
          <div 
            style={{ 
              padding: '12px 16px', 
              backgroundColor: 'var(--error-bg)', 
              color: 'var(--error-text)', 
              borderRadius: '8px', 
              borderLeft: '4px solid var(--error)',
              fontSize: '13px',
              marginBottom: '20px',
              lineHeight: '1.4'
            }}
          >
            {error}
          </div>
        )}

        {successMessage && (
          <div 
            style={{ 
              padding: '12px 16px', 
              backgroundColor: 'var(--success-bg)', 
              color: 'var(--success-text)', 
              borderRadius: '8px', 
              borderLeft: '4px solid var(--success)',
              fontSize: '13px',
              marginBottom: '20px',
              lineHeight: '1.4'
            }}
          >
            {successMessage}
          </div>
        )}

        {activeTab === 'login' && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="login-email">Work Email</label>
              <input 
                id="login-email"
                type="email" 
                name="email"
                value={formData.email} 
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label htmlFor="login-pass" style={{ margin: 0 }}>Password</label>
                <button 
                  type="button" 
                  onClick={() => {
                    setError(null);
                    setSuccessMessage(null);
                    setActiveTab('forgot');
                  }}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <input 
                id="login-pass"
                type="password" 
                name="password"
                value={formData.password} 
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ padding: '12px', fontSize: '15px' }}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Sign In to Workspace'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMessage(null);
                    setActiveTab('signup');
                  }}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Sign up free
                </button>
              </p>
            </div>
          </form>
        )}

        {activeTab === 'signup' && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label htmlFor="signup-name">Full Name</label>
              <input 
                id="signup-name"
                type="text" 
                name="name" 
                placeholder="Full Name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label htmlFor="signup-email">Work Email</label>
              <input 
                id="signup-email"
                type="email" 
                name="email" 
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>
            
            <div>
              <label htmlFor="signup-pass">Choose Password</label>
              <input 
                id="signup-pass"
                type="password" 
                name="password" 
                placeholder="Min. 8 characters"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <input 
                id="signup-agree"
                type="checkbox" 
                name="agree" 
                checked={formData.agree}
                onChange={handleInputChange}
                style={{ width: 'auto', marginTop: '3px', cursor: 'pointer' }}
                disabled={loading}
                required
              />
              <label htmlFor="signup-agree" style={{ fontSize: '12px', cursor: 'pointer' }}>
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ padding: '12px', fontSize: '15px' }}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Create Account'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setSuccessMessage(null);
                    setActiveTab('login');
                  }}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        )}

        {activeTab === 'forgot' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
              Enter your work email address, and we'll send a password reset link to recover access.
            </p>
            <div>
              <label htmlFor="forgot-email">Email Address</label>
              <input 
                id="forgot-email"
                type="email" 
                placeholder="name@company.com"
                required
              />
            </div>

            <button 
              onClick={() => {
                alert('A reset link has been dispatched to your email address (simulated).');
                setActiveTab('login');
              }} 
              className="btn btn-primary" 
              style={{ padding: '12px', fontSize: '15px' }}
            >
              Send Recovery Link
            </button>

            <button 
              onClick={() => {
                setError(null);
                setSuccessMessage(null);
                setActiveTab('login');
              }} 
              className="btn btn-secondary" 
              style={{ padding: '12px' }}
            >
              Back to Login
            </button>
          </div>
        )}

        {/* Footer info tag */}
        <div 
          style={{
            marginTop: '32px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: 'var(--text-muted)',
            fontSize: '11px'
          }}
        >
          <Sparkles size={12} />
          <span>Secured by Supabase Authentication</span>
        </div>
      </div>
    </div>
  );
};
