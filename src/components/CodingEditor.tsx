import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';
import 'blockly/blocks'; // built-in math_number, math_arithmetic, text blocks used in the toolbox
import { collection, addDoc, updateDoc, doc, query, where, limit, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { TOOLBOX_XML, setAvailableSounds } from '@/lib/blocklyBlocks';
import { runProgram, playBeep, type RunHandle } from '@/lib/interpreter';
import { Stage, type StageHandle } from '@/components/Stage';
import { AssetPanel } from '@/components/AssetPanel';
import { LessonPanel } from '@/components/LessonPanel';
import type { UserProfile, Costume, SoundAsset } from '@/types';

const DEFAULT_COSTUME: Costume = { id: 'default', name: 'Robot', url: '/mascot/robot_3.png' };

export const CodingEditor: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const blocklyHostRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const stageRef = useRef<StageHandle>(null);
  const runHandleRef = useRef<RunHandle | null>(null);
  const projectDocIdRef = useRef<string | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [title, setTitle] = useState('My first project');
  const [isLoaded, setIsLoaded] = useState(false);
  const [costumes, setCostumes] = useState<Costume[]>([DEFAULT_COSTUME]);
  const [currentCostumeIndex, setCurrentCostumeIndex] = useState(0);
  const [sounds, setSounds] = useState<SoundAsset[]>([]);
  const [showLessons, setShowLessons] = useState(false);

  // Set up the Blockly workspace once.
  useEffect(() => {
    if (!blocklyHostRef.current) return;
    const workspace = Blockly.inject(blocklyHostRef.current, {
      toolbox: TOOLBOX_XML,
      grid: { spacing: 20, length: 3, colour: '#E5DEEE', snap: true },
      zoom: { controls: true, wheel: true, startScale: 0.9 },
      trashcan: true,
    });
    workspaceRef.current = workspace;
    return () => workspace.dispose();
  }, []);

  // Load the student's existing project, if there is one, once the
  // workspace exists.
  useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace) return;
    (async () => {
      const q = query(
        collection(db, 'codingProjects'),
        where('studentId', '==', profile.id),
        limit(1),
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        const data = docSnap.data();
        projectDocIdRef.current = docSnap.id;
        setTitle(data.title || 'My first project');
        try {
          Blockly.serialization.workspaces.load(data.blocklyState, workspace);
        } catch (err) {
          console.error('PixelCode: could not load saved blocks', err);
        }
        const loadedCostumes: Costume[] = data.costumes?.length ? data.costumes : [DEFAULT_COSTUME];
        const loadedIndex = data.currentCostumeIndex ?? 0;
        setCostumes(loadedCostumes);
        setCurrentCostumeIndex(loadedIndex);
        setSounds(data.sounds || []);

        const saved = data.stageState;
        if (saved && stageRef.current) {
          stageRef.current.setPosition(saved.x ?? 0, saved.y ?? 0);
          stageRef.current.setRotationDeg(saved.rotationDeg ?? 0);
          stageRef.current.setVisible(saved.visible ?? true);
        }
        const costumeUrl = loadedCostumes[loadedIndex]?.url;
        if (costumeUrl) await stageRef.current?.setCostume(costumeUrl);
      }
      setIsLoaded(true);
    })();
    // Runs once, after the workspace is created -- the empty dep array is
    // intentional (workspaceRef itself never changes identity).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceRef.current]);

  // Keep the sound_play block's dropdown in sync with the current sound list.
  useEffect(() => {
    setAvailableSounds(sounds);
  }, [sounds]);

  const playSoundById = (id: string | undefined) => {
    if (!id || id === '__beep__') {
      playBeep();
      return;
    }
    const sound = sounds.find((s) => s.id === id);
    if (sound) {
      new Audio(sound.url).play().catch(() => {});
    } else {
      playBeep(); // referenced sound was since removed -- fall back rather than silently do nothing
    }
  };

  const handleRun = () => {
    const workspace = workspaceRef.current;
    const stage = stageRef.current;
    if (!workspace || !stage || isRunning) return;
    setStatus(null);
    const code = javascriptGenerator.workspaceToCode(workspace);
    setIsRunning(true);
    runHandleRef.current = runProgram(
      code,
      stage,
      {
        nextCostume: async () => {
          setCurrentCostumeIndex((prev) => {
            const next = costumes.length ? (prev + 1) % costumes.length : 0;
            const url = costumes[next]?.url;
            if (url) stage.setCostume(url);
            return next;
          });
        },
        playSound: (name) => playSoundById(name),
      },
      () => setIsRunning(false),
    );
  };

  const handleStop = () => {
    runHandleRef.current?.stop();
    setIsRunning(false);
  };

  const handleSave = async () => {
    const workspace = workspaceRef.current;
    const stage = stageRef.current;
    if (!workspace || !stage) return;
    setStatus('Saving\u2026');
    try {
      const blocklyState = Blockly.serialization.workspaces.save(workspace);
      const stageState = stage.getState();
      const now = new Date().toISOString();
      if (projectDocIdRef.current) {
        await updateDoc(doc(db, 'codingProjects', projectDocIdRef.current), {
          title, blocklyState, stageState, costumes, currentCostumeIndex, sounds, updatedAt: now,
        });
      } else {
        const ref = await addDoc(collection(db, 'codingProjects'), {
          studentId: profile.id,
          schoolId: profile.schoolId,
          title, blocklyState, stageState, costumes, currentCostumeIndex, sounds,
          createdAt: now, updatedAt: now,
        });
        projectDocIdRef.current = ref.id;
      }
      setStatus('Saved!');
    } catch (err: any) {
      setStatus(`Couldn\u2019t save: ${err.message}`);
    }
  };

  const handleSelectCostume = async (index: number) => {
    setCurrentCostumeIndex(index);
    const url = costumes[index]?.url;
    if (url) await stageRef.current?.setCostume(url);
  };

  const handleAddCostume = (costume: Costume) => {
    setCostumes((prev) => [...prev, costume]);
  };

  const handleRemoveCostume = async (index: number) => {
    setCostumes((prev) => prev.filter((_, i) => i !== index));
    // If we removed the currently-worn costume (or one before it), the
    // selection needs to shift so it still points at a valid entry --
    // and the sprite on stage needs to actually reflect that change.
    setCurrentCostumeIndex((prev) => {
      const next = index < prev ? prev - 1 : index === prev ? 0 : prev;
      return next;
    });
    const remaining = costumes.filter((_, i) => i !== index);
    const newIndex = index < currentCostumeIndex ? currentCostumeIndex - 1
      : index === currentCostumeIndex ? 0 : currentCostumeIndex;
    const url = remaining[newIndex]?.url;
    if (url) await stageRef.current?.setCostume(url);
  };

  const handleAddSound = (sound: SoundAsset) => {
    setSounds((prev) => [...prev, sound]);
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <img src="/mascot/robot_2.png" alt="" style={styles.headerMascot} />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.titleInput}
          aria-label="Project title"
        />
        <div style={styles.headerActions}>
          {status && <span style={styles.status}>{status}</span>}
          <button onClick={() => setShowLessons(true)} style={styles.lessonsButton}>📘 Lessons</button>
          <button onClick={handleSave} style={styles.saveButton} disabled={!isLoaded}>Save</button>
          {isRunning ? (
            <button onClick={handleStop} style={styles.stopButton}>Stop</button>
          ) : (
            <button onClick={handleRun} style={styles.runButton} disabled={!isLoaded}>▶ Run</button>
          )}
          <button onClick={() => signOut(auth)} style={styles.signOutButton}>Sign out</button>
        </div>
      </header>

      <div style={styles.workArea}>
        {showLessons && <LessonPanel onClose={() => setShowLessons(false)} />}
        <div style={styles.stagePanel}>
          <Stage ref={stageRef} />
        </div>
        <div ref={blocklyHostRef} style={styles.blocklyHost} />
        <AssetPanel
          schoolId={profile.schoolId}
          studentId={profile.id}
          costumes={costumes}
          currentCostumeIndex={currentCostumeIndex}
          onSelectCostume={handleSelectCostume}
          onAddCostume={handleAddCostume}
          onRemoveCostume={handleRemoveCostume}
          sounds={sounds}
          onAddSound={handleAddSound}
          onPlaySound={(s) => playSoundById(s.id)}
        />
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh' },
  header: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px',
    borderBottom: '1px solid var(--border)', background: 'var(--surface-card)',
  },
  headerMascot: { width: 32, height: 32 },
  titleInput: {
    fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500,
    border: 'none', outline: 'none', color: 'var(--ink)', background: 'transparent',
    flex: 1, minWidth: 0,
  },
  headerActions: { display: 'flex', alignItems: 'center', gap: 10 },
  status: { fontSize: 13, color: 'var(--ink-muted)' },
  saveButton: {
    padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)',
    background: '#fff', fontSize: 14, fontWeight: 500, color: 'var(--ink)',
  },
  runButton: {
    padding: '8px 20px', borderRadius: 8, border: 'none',
    background: '#4CAF50', color: '#fff', fontSize: 14, fontWeight: 500,
  },
  stopButton: {
    padding: '8px 20px', borderRadius: 8, border: 'none',
    background: '#E53935', color: '#fff', fontSize: 14, fontWeight: 500,
  },
  workArea: { display: 'flex', flex: 1, minHeight: 0, position: 'relative' },
  lessonsButton: {
    padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)',
    background: '#fff', fontSize: 14, fontWeight: 500, color: 'var(--ink)',
  },
  signOutButton: {
    padding: '8px 14px', borderRadius: 8, border: '1px solid var(--border)',
    background: 'transparent', fontSize: 13, fontWeight: 500, color: 'var(--ink-muted)',
  },
  stagePanel: {
    padding: 16, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    background: 'var(--surface)',
  },
  blocklyHost: { flex: 1, minWidth: 0 },
};
