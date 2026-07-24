import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer', phone: '', address: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await signup(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <h1>Create an account</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input id="name" value={form.name} onChange={(e) => update('name', e.target.value)} required />
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          minLength={6}
          required
        />
        <label htmlFor="phone">Phone</label>
        <input id="phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        <label htmlFor="address">Address</label>
        <input id="address" value={form.address} onChange={(e) => update('address', e.target.value)} />
        <label htmlFor="role">I am a</label>
        <select id="role" value={form.role} onChange={(e) => update('role', e.target.value)}>
          <option value="customer">Customer</option>
          <option value="owner">Restaurant owner</option>
        </select>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Sign up'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
