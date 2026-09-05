import React, { useEffect, useState } from 'react';
import * as Blockly from 'blockly/core';

// ---------------------------------------------------------------------------
// An interactive "build your first script" walkthrough. Unlike LessonPanel
// (static read-along instructions), this actively watches the Blockly
// workspace via a change listener and auto-advances each step the moment
// the student actually drags in the right block -- it's teaching by doing,
// not just telling.
//
// Currently hardcoded to the exact block sequence in the "Wake Up, Pixel!"
// sample lesson. Generalizing this to walk through ANY lesson's block
// sequence (driven by lesson content rather than a fixed array here) is
// good future work once there's more than one guided lesson to prove the
// pattern with.
// ---------------------------------------------------------------------------

interface TourStep {
  instruction: string;
  expectedBlockType: string;
  requireConnected?: boolean; // must be snapped under an existing block, not just sitting loose
}

const TOUR_STEPS: TourStep[] = [
  {
    instruction: "Click the orange Events category, then drag the \u201cwhen \u25b6 clicked\u201d block onto the canvas.",
    expectedBlockType: 'event_whenflagclicked',
  },
  {
    instruction: "Click Motion (blue), then drag a \u201cmove steps\u201d block so it snaps right underneath.",
    expectedBlockType: 'motion_movesteps',
    requireConnected: true,
  },
  {
    instruction: "Click Looks (purple), then drag a \u201csay\u201d block and snap it under that.",
    expectedBlockType: 'looks_say',
    requireConnected: true,
  },
];

interface GuidedTourProps {
  workspace: Blockly.WorkspaceSvg | null;
  onClose: () => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({ workspace, onClose }) => {
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    if (!started || !workspace) return;
    const step = TOUR_STEPS[stepIndex];
    if (!step) return;

    const checkProgress = () => {
      const matches = workspace.getBlocksByType(step.expectedBlockType, false);
      const found = step.requireConnected
        ? matches.some((b) => b.previousConnection?.targetBlock() != null)
        : matches.length > 0;
      if (found) {
        setJustCompleted(true);
        setTimeout(() => {
          setJustCompleted(false);
          if (stepIndex + 1 < TOUR_STEPS.length) {
            setStepIndex((i) => i + 1);
          } else {
            onClose(); // last step done -- hand off to Run on their own
          }
        }, 700);
      }
    };

    checkProgress(); // in case it's already there (e.g. re-opening mid-build)
    workspace.addChangeListener(checkProgress);
    return () => workspace.removeChangeListener(checkProgress);
  }, [started, workspace, stepIndex, onClose]);

  if (!started) {
    return (
      <div style={styles.overlay}>
        <div style={styles.welcomeCard}>
          <div style={styles.welcomeImageBanner}>
            <img src="/mascot/robot_3.png" alt="" style={styles.welcomeMascot} />
          </div>
          <div style={styles.welcomeTextArea}>
            <h2 style={styles.welcomeTitle}>Welcome to PixelCode!</h2>
            <p style={styles.welcomeText}>
              Let's build your very first script together — I'll tell you exactly
              which blocks to drag, one at a time.
            </p>
            <button style={styles.followButton} onClick={() => setStarted(true)}>Follow me</button>
            <button style={styles.skipButton} onClick={onClose}>Skip ▶</button>
          </div>
        </div>
      </div>
    );
  }

  const step = TOUR_STEPS[stepIndex];

  return (
    <div style={styles.stepCard}>
      <div style={styles.stepHeader}>
        <span style={styles.stepProgress}>Step {stepIndex + 1} of {TOUR_STEPS.length}</span>
        <button style={styles.stepClose} onClick={onClose} aria-label="Close tour">×</button>
      </div>
      <p style={styles.stepInstruction}>{step.instruction}</p>
      {justCompleted && <p style={styles.stepDone}>Nice! ✓</p>}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'absolute', inset: 0, background: 'rgba(34, 19, 56, 0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20,
  },
  welcomeCard: {
    width: 420, maxWidth: '90vw', borderRadius: 20, overflow: 'hidden',
    boxShadow: '0 24px 60px rgba(0,0,0,0.3)', background: '#fff',
  },
  welcomeImageBanner: {
    background: 'linear-gradient(160deg, #3B0F5C 0%, #6D28D9 55%, #C026D3 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '28px 0',
  },
  welcomeMascot: { width: 110, height: 110 },
  welcomeTextArea: { padding: 28 },
  welcomeTitle: { fontSize: 20, marginBottom: 10, color: 'var(--ink)' },
  welcomeText: { fontSize: 14, lineHeight: 1.6, color: 'var(--ink-muted)', marginBottom: 20 },
  followButton: {
    display: 'block', width: '100%', padding: '11px 16px', borderRadius: 10, border: 'none',
    background: 'var(--violet)', color: '#fff', fontWeight: 500, fontSize: 14, marginBottom: 10,
  },
  skipButton: {
    display: 'block', width: '100%', padding: '8px 16px', border: 'none', background: 'transparent',
    color: 'var(--ink-muted)', fontSize: 13,
  },
  stepCard: {
    position: 'absolute', top: 16, left: 16, zIndex: 20, width: 300,
    background: 'var(--surface-card)', borderRadius: 14, padding: 16,
    boxShadow: '0 12px 32px rgba(0,0,0,0.18)', border: '1px solid var(--border)',
  },
  stepHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  stepProgress: { fontSize: 12, fontWeight: 500, color: 'var(--violet)' },
  stepClose: { border: 'none', background: 'transparent', fontSize: 16, color: 'var(--ink-muted)', lineHeight: 1 },
  stepInstruction: { fontSize: 14, lineHeight: 1.5, color: 'var(--ink)', margin: 0 },
  stepDone: { fontSize: 13, color: '#16A34A', fontWeight: 500, marginTop: 8, marginBottom: 0 },
};
