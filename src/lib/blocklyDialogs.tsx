import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as Blockly from 'blockly/core';

// ---------------------------------------------------------------------------
// Blockly's default "New Variable" / "New List" / rename-a-function dialogs
// all go through Blockly.dialog.prompt(...) under the hood, which by
// default just calls the browser's plain window.prompt() -- an unstyled
// native OS dialog, not something that matches the rest of the app (or
// looks anywhere near as good as Scratch's/Kitten's own branded dialogs).
// Overriding Blockly.dialog.setPrompt once here replaces ALL of those
// flows at once with one consistent, branded modal.
// ---------------------------------------------------------------------------

interface PromptModalProps {
  message: string;
  defaultValue: string;
  onSubmit: (value: string | null) => void;
}

function titleFor(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('list')) return 'New List';
  if (lower.includes('function') || lower.includes('procedure')) return 'New Function';
  if (lower.includes('rename')) return 'Rename';
  return 'New Variable';
}

const PromptModal: React.FC<PromptModalProps> = ({ message, defaultValue, onSubmit }) => {
  const [value, setValue] = useState(defaultValue);

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.header}>{titleFor(message)}</div>
        <div style={styles.body}>
          <label style={styles.label}>{message}</label>
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSubmit(value);
              if (e.key === 'Escape') onSubmit(null);
            }}
            style={styles.input}
          />
          <div style={styles.buttonRow}>
            <button style={styles.cancelButton} onClick={() => onSubmit(null)}>Cancel</button>
            <button style={styles.okButton} onClick={() => onSubmit(value)}>OK</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export function installBlockyPixelCodePrompt() {
  Blockly.dialog.setPrompt((message, defaultValue, callback) => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    const cleanup = (result: string | null) => {
      root.unmount();
      container.remove();
      callback(result);
    };

    root.render(<PromptModal message={message} defaultValue={defaultValue} onSubmit={cleanup} />);
  });
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(34, 19, 56, 0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
  },
  card: {
    width: 340, borderRadius: 14, overflow: 'hidden', background: '#fff',
    boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
  },
  header: {
    background: 'var(--violet)', color: '#fff', fontFamily: 'var(--font-display)',
    fontSize: 16, fontWeight: 600, padding: '14px 20px',
  },
  body: { padding: 20 },
  label: { display: 'block', fontSize: 13, color: 'var(--ink-muted)', marginBottom: 8 },
  input: {
    width: '100%', fontSize: 15, padding: '9px 12px', borderRadius: 8,
    border: '1px solid var(--border)', outline: 'none', marginBottom: 18, boxSizing: 'border-box',
  },
  buttonRow: { display: 'flex', justifyContent: 'flex-end', gap: 10 },
  cancelButton: {
    padding: '9px 16px', borderRadius: 8, border: '1px solid var(--border)',
    background: '#fff', fontSize: 14, fontWeight: 500, color: 'var(--ink)',
  },
  okButton: {
    padding: '9px 20px', borderRadius: 8, border: 'none',
    background: 'var(--violet)', color: '#fff', fontSize: 14, fontWeight: 500,
  },
};
