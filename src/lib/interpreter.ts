import type { StageHandle } from '@/components/Stage';

// ---------------------------------------------------------------------------
// Executes the JavaScript that Blockly's generator produced (see
// blocklyBlocks.ts) against a small `api` object that maps onto the
// Stage's imperative handle. Every block generates an `await api.*(...)`
// call, so Stop works by flipping a shared `running` flag that every
// await point (wait/tick/sayFor, and the top of every loop iteration)
// checks before continuing -- this is what makes a `forever` loop or a
// long `repeat` actually interruptible instead of freezing the tab.
// ---------------------------------------------------------------------------

export interface RunHandle {
  stop(): void;
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

function playBeep() {
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

export function runProgram(code: string, stage: StageHandle, onFinished?: () => void): RunHandle {
  let running = true;
  const isRunning = () => running;

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
    async playSound() {
      playBeep();
    },
  };

  const fn = new Function('api', `return (async () => {\n${code}\n})();`);
  Promise.resolve(fn(api))
    .catch((err: unknown) => {
      console.error('PixelCode: error while running project', err);
    })
    .finally(() => {
      running = false;
      onFinished?.();
    });

  return {
    stop() {
      running = false;
    },
  };
}
