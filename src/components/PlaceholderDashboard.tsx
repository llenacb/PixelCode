import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { UserProfile } from '@/types';

const roleLabel: Record<string, string> = {
  schoolAdmin: 'School admin',
  teacher: 'Teacher',
  student: 'Student',
};

export const PlaceholderDashboard: React.FC<{ profile: UserProfile }> = ({ profile }) => (
  <div style={styles.page}>
    <img src="/mascot/robot_3.png" alt="" style={styles.mascot} />
    <h1 style={styles.h1}>Hi {profile.name.split(' ')[0]}!</h1>
    <p style={styles.p}>
      {roleLabel[profile.role] ?? profile.role} tools are being built next \u2014 the
      coding editor and lesson runner come in the following build phases.
    </p>
    <button style={styles.button} onClick={() => signOut(auth)}>Sign out</button>
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24,
  },
  mascot: { width: 140, marginBottom: 16 },
  h1: { fontSize: 24, marginBottom: 8, color: 'var(--ink)' },
  p: { color: 'var(--ink-muted)', maxWidth: 360, marginBottom: 24 },
  button: {
    padding: '10px 20px', borderRadius: 8, border: '1px solid var(--border)',
    background: 'var(--surface-card)', fontSize: 14, fontWeight: 500,
  },
};
