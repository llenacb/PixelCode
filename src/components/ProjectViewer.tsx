import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import '@/lib/blocklyBlocks'; // registers PixelCode's custom block types so they render correctly
import { Stage, type StageHandle } from '@/components/Stage';
import type { CodingProject, UserProfile } from '@/types';

export const ProjectViewer: React.FC<{
  student: UserProfile;
  project: CodingProject;
  onClose: () => void;
}> = ({ student, project, onClose }) => {
  const blocklyHostRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<StageHandle>(null);

  useEffect(() => {
    if (!blocklyHostRef.current) return;
    // No toolbox -- this is display-only, a teacher isn't editing the
    // student's blocks here, just looking at what they built.
    const workspace = Blockly.inject(blocklyHostRef.current, {
      readOnly: true,
      zoom: { controls: true, wheel: true, startScale: 0.8 },
    });
    try {
      Blockly.serialization.workspaces.load(project.blocklyState, workspace);
      workspace.scrollCenter();
    } catch (err) {
      console.error('PixelCode: could not load student project for viewing', err);
    }
    return () => workspace.dispose();
  }, [project]);

  useEffect(() => {
    (async () => {
      const stage = stageRef.current;
      if (!stage) return;
      const s: any = project.stageState || {};
      stage.setPosition(s.x ?? 0, s.y ?? 0);
      stage.setRotationDeg(s.rotationDeg ?? 0);
      stage.setVisible(s.visible ?? true);
      const costumeUrl = project.costumes?.[project.currentCostumeIndex]?.url;
      if (costumeUrl) await stage.setCostume(costumeUrl);
    })();
  }, [project]);

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        <header style={styles.header}>
          <div>
            <h2 style={styles.title}>{project.title}</h2>
            <p style={styles.subtitle}>{student.name} · last updated {new Date(project.updatedAt).toLocaleString()}</p>
          </div>
          <button style={styles.closeButton} onClick={onClose} aria-label="Close">×</button>
        </header>
        <div style={styles.body}>
          <div style={styles.stageColumn}>
            <Stage ref={stageRef} />
          </div>
          <div ref={blocklyHostRef} style={styles.blocklyHost} />
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(34, 19, 56, 0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24,
  },
  panel: {
    background: '#fff', borderRadius: 16, width: '100%', maxWidth: 1100, height: '85vh',
    display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px', borderBottom: '1px solid var(--border)',
  },
  title: { fontSize: 17, color: 'var(--ink)', margin: 0 },
  subtitle: { fontSize: 13, color: 'var(--ink-muted)', margin: '4px 0 0 0' },
  closeButton: { border: 'none', background: 'transparent', fontSize: 22, color: 'var(--ink-muted)', lineHeight: 1 },
  body: { flex: 1, display: 'flex', minHeight: 0 },
  stageColumn: { padding: 16, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', background: 'var(--surface)' },
  blocklyHost: { flex: 1, minWidth: 0 },
};
