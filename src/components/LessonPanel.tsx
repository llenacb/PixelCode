import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Lesson } from '@/types';
import { BlockStackPreview } from '@/components/BlockStackPreview';

const TIER_LABELS: Record<Lesson['tier'], string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  interaction: 'Interaction',
  advanced: 'Advanced',
};
const TIER_ORDER: Lesson['tier'][] = ['beginner', 'intermediate', 'interaction', 'advanced'];

export const LessonPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selected, setSelected] = useState<Lesson | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'lessons'), where('published', '==', true));
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Lesson));
      list.sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) || a.order - b.order);
      setLessons(list);
    });
  }, []);

  return (
    <div style={styles.panel}>
      <header style={styles.header}>
        <img src="/mascot/robot_2.png" alt="" style={styles.headerMascot} />
        <h2 style={styles.headerTitle}>{selected ? selected.title : 'Lessons'}</h2>
        {selected && (
          <button style={styles.backButton} onClick={() => setSelected(null)}>← All lessons</button>
        )}
        <button style={styles.closeButton} onClick={onClose} aria-label="Close lessons">×</button>
      </header>

      <div style={styles.body}>
        {!selected && (
          <>
            {lessons.length === 0 && (
              <p style={styles.emptyHint}>No lessons published yet — check back soon!</p>
            )}
            {TIER_ORDER.map((tier) => {
              const tierLessons = lessons.filter((l) => l.tier === tier);
              if (tierLessons.length === 0) return null;
              return (
                <div key={tier} style={styles.tierGroup}>
                  <h3 style={styles.tierHeading}>{TIER_LABELS[tier]}</h3>
                  <ul style={styles.lessonList}>
                    {tierLessons.map((l) => (
                      <li key={l.id}>
                        <button style={styles.lessonButton} onClick={() => setSelected(l)}>
                          <span>{l.title}</span>
                          {l.suggestedMinutes && (
                            <span style={styles.lessonTime}>~{l.suggestedMinutes} min</span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </>
        )}

        {selected && (
          <div style={styles.lessonContent}>
            {selected.suggestedMinutes && (
              <span style={styles.timeBadge}>⏱ About {selected.suggestedMinutes} minutes</span>
            )}
            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>{selected.content.introTitle}</h3>
              <p style={styles.sectionText}>{selected.content.introText}</p>
            </section>
            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>{selected.content.conceptTitle}</h3>
              <p style={styles.sectionText}>{selected.content.conceptText}</p>
            </section>
            <section style={styles.section}>
              <h3 style={styles.sectionTitle}>Coding challenge</h3>
              {selected.content.challenges.map((c, i) => (
                <div key={i} style={styles.challenge}>
                  <div style={styles.challengeTitle}>Challenge {i + 1}: {c.title}</div>
                  <p style={styles.sectionText}>{c.instructions}</p>
                  {c.blocks && <BlockStackPreview blocks={c.blocks} />}
                </div>
              ))}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  panel: {
    width: 300, flexShrink: 0, background: 'var(--surface-card)',
    display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px',
    borderBottom: '1px solid var(--border)',
  },
  headerMascot: { width: 28, height: 28 },
  headerTitle: { fontSize: 16, flex: 1, minWidth: 0, color: 'var(--ink)' },
  backButton: {
    border: 'none', background: 'transparent', color: 'var(--violet)',
    fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
  },
  closeButton: {
    border: 'none', background: 'transparent', fontSize: 20, lineHeight: 1,
    color: 'var(--ink-muted)', width: 28, height: 28,
  },
  body: { flex: 1, overflowY: 'auto', padding: 16 },
  emptyHint: { color: 'var(--ink-muted)', fontSize: 14 },
  tierGroup: { marginBottom: 20 },
  tierHeading: { fontSize: 13, color: 'var(--ink-muted)', marginBottom: 8, textTransform: 'none' },
  lessonList: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 },
  lessonButton: {
    width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 8,
    border: '1px solid var(--border)', background: '#fff', fontSize: 14, color: 'var(--ink)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
  },
  lessonTime: { fontSize: 12, color: 'var(--ink-muted)', flexShrink: 0 },
  lessonContent: { display: 'flex', flexDirection: 'column', gap: 20 },
  timeBadge: {
    alignSelf: 'flex-start', fontSize: 13, fontWeight: 600, color: 'var(--violet)',
    background: '#F3E8FF', padding: '6px 12px', borderRadius: 20,
  },
  section: {},
  sectionTitle: { fontSize: 15, marginBottom: 6, color: 'var(--ink)' },
  sectionText: { fontSize: 14, lineHeight: 1.6, color: 'var(--ink)', margin: 0 },
  challenge: { marginBottom: 12 },
  challengeTitle: { fontSize: 14, fontWeight: 500, color: 'var(--violet)', marginBottom: 4 },
};
