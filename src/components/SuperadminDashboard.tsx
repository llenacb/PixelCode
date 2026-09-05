import React, { useEffect, useState } from 'react';
import { addDoc, collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { signOut } from 'firebase/auth';
import { auth, db, functions } from '@/lib/firebase';
import type { Lesson, School, UserRole } from '@/types';

const createSchool = httpsCallable(functions, 'createSchool');
const provisionUser = httpsCallable(functions, 'provisionUser');

const LESSON_JSON_PLACEHOLDER = `{
  "title": "Wake Up, Pixel!",
  "tier": "beginner",
  "order": 1,
  "published": true,
  "content": {
    "introTitle": "A quiet morning",
    "introText": "Pixel the robot has been asleep all night. When you press the green flag, it's time to wake up and say hello!",
    "conceptTitle": "The when-clicked block",
    "conceptText": "Every script starts with a hat block. The 'when \\u25b6 clicked' block runs everything snapped underneath it the moment you press Run.",
    "challenges": [
      { "title": "Say hello", "instructions": "Snap a 'say' block under 'when \\u25b6 clicked' and make Pixel say hi." },
      { "title": "Take a step", "instructions": "Add a 'move 10 steps' block before the say block, so Pixel walks forward first." }
    ]
  }
}`;

export const SuperadminDashboard: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const [userForm, setUserForm] = useState({
    name: '', email: '', password: '', role: 'schoolAdmin' as UserRole, schoolId: '',
  });

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonJson, setLessonJson] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'schools'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setSchools(snap.docs.map((d) => ({ id: d.id, ...d.data() } as School)));
    });
  }, []);

  useEffect(() => {
    return onSnapshot(collection(db, 'lessons'), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lesson));
      list.sort((a, b) => a.tier.localeCompare(b.tier) || a.order - b.order);
      setLessons(list);
    });
  }, []);

  const handlePublishLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    let parsed: Partial<Omit<Lesson, 'id'>>;
    try {
      parsed = JSON.parse(lessonJson);
    } catch {
      setStatus('That\u2019s not valid JSON \u2014 check for a missing comma or quote.');
      return;
    }
    if (!parsed.title || !parsed.tier || !parsed.content) {
      setStatus('Lesson JSON needs at least title, tier, and content.');
      return;
    }
    setStatus('Publishing lesson\u2026');
    try {
      await addDoc(collection(db, 'lessons'), {
        title: parsed.title,
        tier: parsed.tier,
        content: parsed.content,
        order: parsed.order ?? 0,
        published: parsed.published ?? true,
      });
      setLessonJson('');
      setStatus('Lesson published.');
    } catch (err: any) {
      setStatus(`Couldn\u2019t publish lesson: ${err.message}`);
    }
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) {
      setStatus('Enter a school name first.');
      return;
    }
    setStatus('Creating school\u2026');
    try {
      await createSchool({ name: newSchoolName.trim() });
      setNewSchoolName('');
      setStatus('School created.');
    } catch (err: any) {
      setStatus(`Couldn\u2019t create school: ${err.message}`);
    }
  };

  const handleProvisionUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email || !userForm.password) {
      setStatus('Fill in name, email, and password first.');
      return;
    }
    if (userForm.role !== 'superadmin' && !userForm.schoolId) {
      setStatus('Pick a school for this account.');
      return;
    }
    setStatus('Creating account\u2026');
    try {
      await provisionUser(userForm);
      setUserForm({ name: '', email: '', password: '', role: 'schoolAdmin', schoolId: '' });
      setStatus('Account created.');
    } catch (err: any) {
      setStatus(`Couldn\u2019t create account: ${err.message}`);
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src="/mascot/robot_2.png" alt="" style={styles.headerMascot} />
          <h1 style={styles.h1}>PixelCode — superadmin</h1>
        </div>
        <button style={styles.signOutButton} onClick={() => signOut(auth)}>Sign out</button>
      </header>

      {status && <p style={styles.status}>{status}</p>}

      <div style={styles.grid}>
        <section style={styles.card}>
          <h2 style={styles.h2}>Schools</h2>
          <form onSubmit={handleCreateSchool} style={styles.inlineForm}>
            <input
              placeholder="School name"
              value={newSchoolName}
              onChange={(e) => setNewSchoolName(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.button}>Add school</button>
          </form>
          <ul style={styles.list}>
            {schools.map((s) => (
              <li key={s.id} style={styles.listItem}>
                <span>{s.name}</span>
                <code style={styles.code}>{s.id}</code>
              </li>
            ))}
            {schools.length === 0 && <li style={styles.empty}>No schools yet.</li>}
          </ul>
        </section>

        <section style={styles.card}>
          <h2 style={styles.h2}>Provision an account</h2>
          <form onSubmit={handleProvisionUser} style={styles.form}>
            <input
              placeholder="Full name"
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              style={styles.input}
            />
            <input
              placeholder="Email"
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              style={styles.input}
            />
            <input
              placeholder="Temporary password"
              type="text"
              value={userForm.password}
              onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              style={styles.input}
            />
            <select
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
              style={styles.input}
            >
              <option value="schoolAdmin">School admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
              <option value="superadmin">Superadmin</option>
            </select>
            {userForm.role !== 'superadmin' && (
              <select
                value={userForm.schoolId}
                onChange={(e) => setUserForm({ ...userForm, schoolId: e.target.value })}
                style={styles.input}
              >
                <option value="">Select a school…</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
            <button type="submit" style={styles.button}>Create account</button>
          </form>
        </section>
      </div>

      <section style={styles.contentCard}>
        <h2 style={styles.h2}>Content</h2>
        <p style={styles.hint}>
          Paste a lesson as JSON (see the placeholder shape) and publish it \u2014
          it becomes visible to every school\u2019s students immediately.
        </p>
        <form onSubmit={handlePublishLesson} style={styles.form}>
          <textarea
            value={lessonJson}
            onChange={(e) => setLessonJson(e.target.value)}
            placeholder={LESSON_JSON_PLACEHOLDER}
            style={styles.textarea}
            rows={12}
          />
          <button type="submit" style={styles.button}>Publish lesson</button>
        </form>
        <ul style={styles.list}>
          {lessons.map((l) => (
            <li key={l.id} style={styles.listItem}>
              <span>{l.title} <code style={styles.code}>({l.tier})</code></span>
              <span style={styles.code}>{l.published ? 'published' : 'draft'}</span>
            </li>
          ))}
          {lessons.length === 0 && <li style={styles.empty}>No lessons published yet.</li>}
        </ul>
      </section>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '32px 40px', maxWidth: 960, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  headerMascot: { width: 40, height: 40 },
  signOutButton: {
    padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)',
    background: 'var(--surface-card)', fontSize: 13, fontWeight: 500, color: 'var(--ink-muted)',
  },
  h1: { fontSize: 22, color: 'var(--ink)' },
  h2: { fontSize: 17, color: 'var(--ink)', marginBottom: 16 },
  status: {
    background: '#F3E8FF', color: 'var(--violet)', padding: '10px 14px',
    borderRadius: 10, fontSize: 14, marginBottom: 20,
  },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  card: {
    background: 'var(--surface-card)', border: '1px solid var(--border)',
    borderRadius: 16, padding: 24,
  },
  inlineForm: { display: 'flex', gap: 10, marginBottom: 16 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: {
    fontSize: 14, padding: '9px 12px', borderRadius: 8,
    border: '1px solid var(--border)', outline: 'none', width: '100%',
  },
  button: {
    padding: '10px 16px', borderRadius: 8, border: 'none',
    background: 'var(--violet)', color: '#fff', fontWeight: 500, fontSize: 14,
    whiteSpace: 'nowrap',
  },
  list: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 },
  listItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    fontSize: 14, padding: '8px 0', borderBottom: '1px solid var(--border)',
  },
  code: { fontSize: 11, color: 'var(--ink-muted)' },
  empty: { fontSize: 14, color: 'var(--ink-muted)' },
  contentCard: {
    marginTop: 24, background: 'var(--surface-card)', border: '1px solid var(--border)',
    borderRadius: 16, padding: 24,
  },
  hint: { fontSize: 13, color: 'var(--ink-muted)', marginTop: -8, marginBottom: 16 },
  textarea: {
    fontFamily: 'monospace', fontSize: 12, padding: 12, borderRadius: 8,
    border: '1px solid var(--border)', outline: 'none', width: '100%', resize: 'vertical',
  },
};
