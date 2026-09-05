import React from 'react';

interface Props {
  children: React.ReactNode;
  /** Shown in the fallback message so it's clear which part broke. */
  label: string;
}

interface State {
  error: Error | null;
}

/**
 * Without this, any uncaught error anywhere in the tree (a Blockly event
 * listener throwing mid-drag, a bad lesson JSON shape, etc.) unmounts the
 * ENTIRE React app to a blank white page -- no error message, no way back
 * except a manual refresh. This catches it at a component boundary
 * instead, so one broken feature doesn't take down the whole session.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`PixelCode: ${this.props.label} crashed`, error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={styles.box}>
          <p style={styles.title}>Something went wrong in {this.props.label}.</p>
          <p style={styles.detail}>{this.state.error.message}</p>
          <button style={styles.button} onClick={() => this.setState({ error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const styles: Record<string, React.CSSProperties> = {
  box: {
    padding: 20, margin: 16, borderRadius: 12, background: '#FEF2F2',
    border: '1px solid #FCA5A5', maxWidth: 420,
  },
  title: { fontSize: 14, fontWeight: 600, color: 'var(--danger)', marginBottom: 6 },
  detail: { fontSize: 12, color: 'var(--ink-muted)', marginBottom: 12, fontFamily: 'monospace' },
  button: {
    padding: '8px 14px', borderRadius: 8, border: 'none',
    background: 'var(--danger)', color: '#fff', fontSize: 13, fontWeight: 500,
  },
};
