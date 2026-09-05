import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export const LoginView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: any) {
      setError('That email and password combination didn\u2019t work.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.panel}>
        <img src="/mascot/robot_2.png" alt="" style={styles.mascot} />
        <h1 style={styles.title}>PixelCode</h1>
        <p style={styles.subtitle}>Sign in to keep building.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              style={styles.input}
              autoComplete="email"
            />
          </label>
          <label style={styles.label}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              style={styles.input}
              autoComplete="current-password"
            />
          </label>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={isSubmitting} style={styles.button}>
            {isSubmitting ? 'Signing in\u2026' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(160deg, #3B0F5C 0%, #6D28D9 55%, #C026D3 100%)',
    padding: 24,
  },
  panel: {
    background: 'var(--surface-card)',
    borderRadius: 20,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 380,
    textAlign: 'center',
    boxShadow: '0 24px 60px rgba(59, 15, 92, 0.35)',
  },
  mascot: {
    width: 96,
    height: 96,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    color: 'var(--ink)',
  },
  subtitle: {
    color: 'var(--ink-muted)',
    marginTop: 6,
    marginBottom: 28,
    fontSize: 15,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    textAlign: 'left',
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--ink-muted)',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  input: {
    fontSize: 15,
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid var(--border)',
    outline: 'none',
    color: 'var(--ink)',
  },
  error: {
    color: 'var(--danger)',
    fontSize: 13,
    margin: 0,
  },
  button: {
    marginTop: 4,
    padding: '12px 16px',
    borderRadius: 10,
    border: 'none',
    background: 'var(--violet)',
    color: '#fff',
    fontWeight: 500,
    fontSize: 15,
  },
};
