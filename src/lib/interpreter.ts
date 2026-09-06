import type { StageHandle } from '@/components/Stage';

// ---------------------------------------------------------------------------
// Executes the JavaScript that Blockly's generator produced (see
// blocklyBlocks.ts) against a small `api` object that maps onto the
// Stage's imperative handle.
//
// A program is now a SET of independent scripts, not one flat script:
// - flagScripts run immediately when Run is pressed (like before).
// - keyScripts[key] run every time that key is pressed WHILE the program
//   is running -- registered via a real keydown listener, not something
//   that happens once at Run time.
// `definitions` holds shared async function declarations (from the
// Functions category), available to every script.
//
// Stop works by flipping a shared `running` flag that every await point
// (wait/tick/sayFor, and the top of every loop iteration) checks before
// continuing -- this is what makes a `forever` loop, or a key listener
// left waiting indefinitely, actually interruptible.
// ---------------------------------------------------------------------------

export interface RunHandle {
  stop(): void;
}

export interface InterpreterExtras {
  nextCostume(): void | Promise<void>;
  playSound(name?: string): void | Promise<void>;
}

export interface ScriptSet {
  definitions: string;
  flagScripts: string[];
  keyScripts: Record<string, string[]>;
}

function sleep(ms: number, stillRunning: () => boolean): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    function step() {
      if (!stillRunning() || performance.now() - start >= ms) {
        resolve();
        return;
      }
      requestAnimationFrame(step);
    }
    step();
  });
}

export function playBeep() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    osc.frequency.value = 523.25; // C5 -- a plain, friendly confirmation beep
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {
    // Audio can fail to init before any user gesture in some browsers --
    // not worth surfacing as an error to a student clicking Run.
  }
}

/** Maps a real browser KeyboardEvent to one of our block dropdown's key
 *  names (see KEY_OPTIONS in blocklyBlocks.ts) -- null for keys we don't
 *  have a block for (Shift, Tab, function keys, etc). */
function normalizeKeyEvent(e: KeyboardEvent): string | null {
  if (e.key === ' ') return 'space';
  if (e.key === 'ArrowUp') return 'up';
  if (e.key === 'ArrowDown') return 'down';
  if (e.key === 'ArrowLeft') return 'left';
  if (e.key === 'ArrowRight') return 'right';
  if (e.key === 'Enter') return 'enter';
  if (/^[a-zA-Z]$/.test(e.key)) return e.key.toLowerCase();
  if (/^[0-9]$/.test(e.key)) return e.key;
  return null;
}

export function runProgram(
  scriptSet: ScriptSet,
  stage: StageHandle,
  extras: InterpreterExtras,
  onFinished?: () => void,
): RunHandle {
  let running = true;
  const isRunning = () => running;
  const heldKeys = new Set<string>();

  const api = {
    isRunning,
    async move(steps: number) {
      const s = stage.getState();
      const rad = (s.rotationDeg * Math.PI) / 180;
      stage.setPosition(s.x + steps * Math.cos(rad), s.y + steps * Math.sin(rad));
    },
    async turn(degrees: number) {
      const s = stage.getState();
      stage.setRotationDeg(s.rotationDeg + degrees);
    },
    async goTo(x: number, y: number) {
      stage.setPosition(x, y);
    },
    async say(text: string) {
      stage.setSpeech(String(text));
    },
    async sayFor(text: string, secs: number) {
      stage.setSpeech(String(text));
      await sleep(secs * 1000, isRunning);
      if (isRunning()) stage.setSpeech(null);
    },
    async show() {
      stage.setVisible(true);
    },
    async hide() {
      stage.setVisible(false);
    },
    async wait(secs: number) {
      await sleep(secs * 1000, isRunning);
    },
    async tick() {
      // Used by the `forever` loop's generated code so a tight loop still
      // yields a frame to the browser (keeping the tab responsive) and
      // gets a chance to notice `running` flipping to false.
      await sleep(16, isRunning);
    },
    async nextCostume() {
      await extras.nextCostume();
    },
    async playSound(name?: string) {
      await extras.playSound(name);
    },
    // Sensing getters -- synchronous, read live state, used inside
    // conditions (if/boolean expressions), not statements.
    isKeyPressed(key: string) {
      return heldKeys.has(key);
    },
    isMouseDown() {
      return stage.getMouseState().down;
    },
    getMouseX() {
      return stage.getMouseState().x;
    },
    getMouseY() {
      return stage.getMouseState().y;
    },
    isTouchingEdge() {
      return stage.isTouchingEdge();
    },
  };

  // One shared Function scope so flag scripts, key scripts, and any
  // functions defined via the Functions category can all call each other
  // and share the same async function declarations, without duplicating
  // that code per-script.
  let body = scriptSet.definitions + '\n';
  const flagFnNames = scriptSet.flagScripts.map((code, i) => {
    const name = `__flag_${i}__`;
    body += `async function ${name}() {\n${code}}\n`;
    return name;
  });
  const keyFnNamesByKey: Record<string, string[]> = {};
  Object.entries(scriptSet.keyScripts).forEach(([key, scripts]) => {
    keyFnNamesByKey[key] = scripts.map((code, i) => {
      const name = `__key_${key}_${i}__`;
      body += `async function ${name}() {\n${code}}\n`;
      return name;
    });
  });
  body += `return { flags: [${flagFnNames.join(', ')}], keys: { ${Object.entries(keyFnNamesByKey)
    .map(([key, names]) => `${JSON.stringify(key)}: [${names.join(', ')}]`)
    .join(', ')} } };`;

  const factory = new Function('api', body);
  const { flags, keys } = factory(api) as {
    flags: Array<() => Promise<void>>;
    keys: Record<string, Array<() => Promise<void>>>;
  };

  const hasKeyScripts = Object.keys(keys).length > 0;
  if (flags.length === 0 && !hasKeyScripts) {
    // Nothing to run at all (e.g. an empty workspace, or only stray
    // blocks with no hat) -- finish immediately rather than leaving the
    // UI stuck showing Stop with nothing actually happening.
    onFinished?.();
    return { stop() {} };
  }
  const activeKeyRuns = new Set<string>();
  let outstandingFlagRuns = flags.length;

  const runOne = (fn: () => Promise<void>) =>
    Promise.resolve(fn()).catch((err: unknown) => {
      console.error('PixelCode: error while running project', err);
    });

  flags.forEach((fn) => {
    runOne(fn).finally(() => {
      outstandingFlagRuns -= 1;
      // If there are no key scripts waiting for input, the "session" is
      // over once every flag script has finished -- flip back to Run
      // automatically. If key scripts exist, stay in "running" mode
      // indefinitely (like Scratch) since the student might still be
      // about to press something.
      if (!hasKeyScripts && outstandingFlagRuns <= 0 && running) {
        running = false;
        onFinished?.();
      }
    });
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    const mapped = normalizeKeyEvent(e);
    if (mapped) heldKeys.add(mapped);
    if (!running || !mapped) return;
    const triggered = [...(keys[mapped] ?? []), ...(keys['any'] ?? [])];
    triggered.forEach((fn, idx) => {
      const runId = `${mapped}:${idx}`;
      if (activeKeyRuns.has(runId)) return; // still running from a previous press -- don't stack up
      activeKeyRuns.add(runId);
      runOne(fn).finally(() => activeKeyRuns.delete(runId));
    });
  };
  const handleKeyUp = (e: KeyboardEvent) => {
    const mapped = normalizeKeyEvent(e);
    if (mapped) heldKeys.delete(mapped);
  };

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  return {
    stop() {
      running = false;
      heldKeys.clear();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      onFinished?.();
    },
  };
}
