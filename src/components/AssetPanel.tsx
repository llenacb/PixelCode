import React, { useRef, useState } from 'react';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '@/lib/firebase';
import type { Costume, SoundAsset } from '@/types';

const BUILTIN_COSTUMES: { name: string; url: string }[] = [
  { name: 'Robot (still)', url: '/mascot/robot_1.png' },
  { name: 'Robot (face)', url: '/mascot/robot_2.png' },
  { name: 'Robot (standing)', url: '/mascot/robot_3.png' },
];

interface AssetPanelProps {
  schoolId?: string;
  studentId: string;
  costumes: Costume[];
  currentCostumeIndex: number;
  onSelectCostume: (index: number) => void;
  onAddCostume: (costume: Costume) => void;
  onRemoveCostume: (index: number) => void;
  sounds: SoundAsset[];
  onAddSound: (sound: SoundAsset) => void;
  onPlaySound: (sound: SoundAsset) => void;
}

export const AssetPanel: React.FC<AssetPanelProps> = ({
  schoolId, studentId, costumes, currentCostumeIndex, onSelectCostume, onAddCostume, onRemoveCostume,
  sounds, onAddSound, onPlaySound,
}) => {
  const costumeFileRef = useRef<HTMLInputElement>(null);
  const soundFileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File, kind: 'costume' | 'sound') => {
    // Storage path MUST match storage.rules exactly: it matches
    // submissions/{schoolId}/{studentUid}/{projectId}/{fileName} -- four
    // segments after 'submissions', no more. 'default' stands in for a
    // real project id until multi-project support lands in a later
    // phase. kind/timestamp are folded into the filename itself (not an
    // extra path segment) so this still matches that 4-segment pattern.
    const path = `submissions/${schoolId}/${studentId}/default/${kind}-${Date.now()}-${file.name}`;
    // TEMPORARY DEBUG: prints exactly what the upload is attempting and
    // what the current token actually carries, so a permission-denied
    // can be diagnosed precisely instead of guessed at. Remove once
    // resolved.
    const tokenResult = await auth.currentUser?.getIdTokenResult();
    console.log('PixelCode debug \u2014 upload path:', path);
    console.log('PixelCode debug \u2014 auth.currentUser.uid:', auth.currentUser?.uid);
    console.log('PixelCode debug \u2014 token claims:', tokenResult?.claims);
    const fileRef = storageRef(storage, path);
    await uploadBytes(fileRef, file);
    return getDownloadURL(fileRef);
  };

  const handleCostumeFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !schoolId) return;
    setUploading('costume');
    setError(null);
    try {
      const url = await uploadFile(file, 'costume');
      onAddCostume({ id: crypto.randomUUID(), name: file.name.replace(/\.[^.]+$/, ''), url });
    } catch (err: any) {
      console.error('PixelCode: costume upload failed', err);
      setError(`Couldn\u2019t upload costume: ${err.code || err.message || 'unknown error'}`);
    } finally {
      setUploading(null);
    }
  };

  const handleSoundFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !schoolId) return;
    setUploading('sound');
    setError(null);
    try {
      const url = await uploadFile(file, 'sound');
      onAddSound({ id: crypto.randomUUID(), name: file.name.replace(/\.[^.]+$/, ''), url });
    } catch (err: any) {
      console.error('PixelCode: sound upload failed', err);
      setError(`Couldn\u2019t upload sound: ${err.code || err.message || 'unknown error'}`);
    } finally {
      setUploading(null);
    }
  };

  const addBuiltinCostume = (builtin: { name: string; url: string }) => {
    const existingIndex = costumes.findIndex((c) => c.url === builtin.url);
    if (existingIndex !== -1) {
      onSelectCostume(existingIndex); // already have it -- just switch to it, don't duplicate
      return;
    }
    onAddCostume({ id: crypto.randomUUID(), name: builtin.name, url: builtin.url });
  };

  return (
    <div style={styles.panel}>
      {error && <p style={styles.errorBanner}>{error}</p>}
      <section>
        <h3 style={styles.heading}>Costumes</h3>
        <div style={styles.thumbRow}>
          {costumes.map((c, i) => (
            <div key={c.id} style={styles.thumbWrap}>
              <button
                onClick={() => onSelectCostume(i)}
                style={{
                  ...styles.thumbButton,
                  ...(i === currentCostumeIndex ? styles.thumbButtonActive : {}),
                }}
                title={c.name}
              >
                <img src={c.url} alt={c.name} style={styles.thumbImg} />
              </button>
              {costumes.length > 1 && (
                <button
                  style={styles.removeButton}
                  onClick={() => onRemoveCostume(i)}
                  aria-label={`Remove ${c.name}`}
                  title="Remove"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        <div style={styles.addRow}>
          <button
            style={styles.addButton}
            onClick={() => costumeFileRef.current?.click()}
            disabled={uploading === 'costume'}
          >
            {uploading === 'costume' ? 'Uploading\u2026' : '+ Upload costume'}
          </button>
          <input
            ref={costumeFileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleCostumeFile}
          />
        </div>
        <div style={styles.builtinRow}>
          {BUILTIN_COSTUMES.map((b) => (
            <button key={b.url} style={styles.builtinButton} onClick={() => addBuiltinCostume(b)} title={`Add ${b.name}`}>
              <img src={b.url} alt={b.name} style={styles.builtinImg} />
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 style={styles.heading}>Sounds</h3>
        <ul style={styles.soundList}>
          {sounds.map((s) => (
            <li key={s.id} style={styles.soundItem}>
              <span style={styles.soundName}>{s.name}</span>
              <button style={styles.playButton} onClick={() => onPlaySound(s)} aria-label={`Preview ${s.name}`}>▶</button>
            </li>
          ))}
          {sounds.length === 0 && <li style={styles.emptyHint}>No sounds uploaded yet.</li>}
        </ul>
        <button
          style={styles.addButton}
          onClick={() => soundFileRef.current?.click()}
          disabled={uploading === 'sound'}
        >
          {uploading === 'sound' ? 'Uploading\u2026' : '+ Upload sound'}
        </button>
        <input
          ref={soundFileRef}
          type="file"
          accept="audio/*"
          style={{ display: 'none' }}
          onChange={handleSoundFile}
        />
      </section>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  panel: { width: 220, padding: 16, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto' },
  errorBanner: { fontSize: 12, color: 'var(--danger)', background: '#FEF2F2', padding: '8px 10px', borderRadius: 8, margin: 0 },
  heading: { fontSize: 14, marginBottom: 10, color: 'var(--ink)' },
  thumbRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  thumbWrap: { position: 'relative' },
  thumbButton: {
    width: 48, height: 48, borderRadius: 8, border: '2px solid var(--border)',
    background: '#fff', padding: 2, overflow: 'hidden',
  },
  thumbButtonActive: { borderColor: 'var(--violet)' },
  thumbImg: { width: '100%', height: '100%', objectFit: 'contain' },
  removeButton: {
    position: 'absolute', top: -6, right: -6, width: 18, height: 18, borderRadius: '50%',
    border: '1px solid var(--border)', background: '#fff', color: 'var(--ink-muted)',
    fontSize: 12, lineHeight: 1, padding: 0,
  },
  addRow: { marginBottom: 10 },
  addButton: {
    width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px dashed var(--border)',
    background: 'transparent', fontSize: 13, color: 'var(--ink-muted)', fontWeight: 500,
  },
  builtinRow: { display: 'flex', gap: 8 },
  builtinButton: {
    width: 40, height: 40, borderRadius: 8, border: '1px solid var(--border)',
    background: '#fff', padding: 2,
  },
  builtinImg: { width: '100%', height: '100%', objectFit: 'contain' },
  soundList: { listStyle: 'none', padding: 0, margin: '0 0 10px 0', display: 'flex', flexDirection: 'column', gap: 6 },
  soundItem: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    fontSize: 13, padding: '6px 8px', borderRadius: 6, background: 'var(--surface)',
  },
  soundName: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--ink)' },
  playButton: {
    border: 'none', background: 'var(--violet)', color: '#fff', width: 22, height: 22,
    borderRadius: '50%', fontSize: 10, lineHeight: 1, flexShrink: 0, marginLeft: 8,
  },
  emptyHint: { fontSize: 12, color: 'var(--ink-muted)' },
};
