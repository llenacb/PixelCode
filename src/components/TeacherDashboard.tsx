import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import type { CodingProject, UserProfile } from '@/types';
import { ProjectViewer } from '@/components/ProjectViewer';

export const TeacherDashboard: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [projectsByStudent, setProjectsByStudent] = useState<Record<string, CodingProject>>({});
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!profile.schoolId) return;
    const q = query(
      collection(db, 'users'),
      where('schoolId', '==', profile.schoolId),
      where('role', '==', 'student'),
    );
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as UserProfile));
      list.sort((a, b) => a.name.localeCompare(b.name));
      setStudents(list);
    });
  }, [profile.schoolId]);

  useEffect(() => {
    if (!profile.schoolId) return;
    const q = query(collection(db, 'codingProjects'), where('schoolId', '==', profile.schoolId));
    return onSnapshot(q, (snap) => {
      const map: Record<string, CodingProject> = {};
      snap.docs.forEach((d) => {
        const data = { id: d.id, ...d.data() } as CodingProject;
        map[data.studentId] = data; // one project per student, matches current editor scope
      });
      setProjectsByStudent(map);
    });
  }, [profile.schoolId]);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src="/mascot/robot_2.png" alt="" style={styles.headerMascot} />
          <h1 style={styles.h1}>PixelCode \u2014 {profile.role === 'schoolAdmin' ? 'school admin' : 'teacher'}</h1>
        </div>
        <button style={styles.signOutButton} onClick={() => signOut(auth)}>Sign out</button>
      </header>

      <div style={styles.card}>
        <h2 style={styles.h2}>Students</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Project</th>
              <th style={styles.th}>Last updated</th>
              <th style={styles.th}></th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => {
              const project = projectsByStudent[s.id];
              return (
                <tr key={s.id} style={styles.tr}>
                  <td style={styles.td}>{s.name}</td>
                  <td style={styles.td}>{s.email}</td>
                  <td style={styles.td}>{project ? project.title : <span style={styles.muted}>No project yet</span>}</td>
                  <td style={styles.td}>
                    {project ? new Date(project.updatedAt).toLocaleString() : <span style={styles.muted}>\u2014</span>}
                  </td>
                  <td style={styles.td}>
                    {project && (
                      <button style={styles.viewButton} onClick={() => setSelectedStudent(s)}>View</button>
                    )}
                  </td>
                </tr>
              );
            })}
            {students.length === 0 && (
              <tr><td style={styles.td} colSpan={5}><span style={styles.muted}>No students in your school yet.</span></td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedStudent && projectsByStudent[selectedStudent.id] && (
        <ProjectViewer
          student={selectedStudent}
          project={projectsByStudent[selectedStudent.id]}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { padding: '32px 40px', maxWidth: 960, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  headerMascot: { width: 40, height: 40 },
  h1: { fontSize: 22, color: 'var(--ink)' },
  signOutButton: {
    padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)',
    background: 'var(--surface-card)', fontSize: 13, fontWeight: 500, color: 'var(--ink-muted)',
  },
  card: {
    background: 'var(--surface-card)', border: '1px solid var(--border)',
    borderRadius: 16, padding: 24,
  },
  h2: { fontSize: 17, color: 'var(--ink)', marginBottom: 16 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--ink-muted)',
    padding: '8px 10px', borderBottom: '1px solid var(--border)',
  },
  tr: {},
  td: { fontSize: 14, color: 'var(--ink)', padding: '10px 10px', borderBottom: '1px solid var(--border)' },
  muted: { color: 'var(--ink-muted)' },
  viewButton: {
    padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)',
    background: '#fff', fontSize: 13, fontWeight: 500, color: 'var(--violet)',
  },
};
