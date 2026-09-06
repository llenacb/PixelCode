import React from 'react';

export interface PreviewBlock {
  label: string;
  color: string;
  /** Indented (nested) one level -- used for blocks sitting inside a
   *  repeat/forever/if body, so the preview shows the same shape a
   *  student sees in the real editor. */
  nested?: boolean;
}

/** A small, non-interactive drawing of a block stack -- not a live
 *  Blockly instance (that would need exact serialized block state
 *  hand-authored per lesson, which is fragile and slow to write
 *  correctly). This achieves the same teaching goal -- "here's exactly
 *  what to drag, in this shape and color" -- from simple, easy-to-author
 *  data instead. */
export const BlockStackPreview: React.FC<{ blocks: PreviewBlock[] }> = ({ blocks }) => (
  <div style={styles.stack}>
    {blocks.map((b, i) => (
      <div
        key={i}
        style={{
          ...styles.block,
          background: b.color,
          marginLeft: b.nested ? 20 : 0,
        }}
      >
        <div style={styles.notch} />
        {b.label}
      </div>
    ))}
  </div>
);

const styles: Record<string, React.CSSProperties> = {
  stack: { display: 'flex', flexDirection: 'column', margin: '12px 0' },
  block: {
    position: 'relative', color: '#fff', fontSize: 13, fontWeight: 500,
    padding: '8px 12px 8px 20px', borderRadius: 4, marginBottom: 2,
    fontFamily: 'var(--font-body)', lineHeight: 1.3,
  },
  notch: {
    position: 'absolute', top: -3, left: 12, width: 14, height: 6,
    background: 'inherit', borderRadius: '0 0 3px 3px',
  },
};
