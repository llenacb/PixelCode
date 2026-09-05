import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Application, Sprite, Text, Texture, Assets } from 'pixi.js';

// Scratch-style stage: 480x360, origin at CENTER, +x right, +y UP (screen/
// Pixi coordinates are top-left origin, +y DOWN -- toStageCoords below does
// that conversion once, here, so every block ("go to x:0 y:0" means
// "center of stage") behaves the way a kid following Scratch-style
// tutorials would expect.
export const STAGE_WIDTH = 480;
export const STAGE_HEIGHT = 360;

export interface SpriteState {
  x: number;
  y: number;
  rotationDeg: number; // 0 = facing right, matching Scratch's convention
  visible: boolean;
}

export interface StageHandle {
  getState(): SpriteState;
  setPosition(x: number, y: number): void;
  setRotationDeg(deg: number): void;
  setVisible(visible: boolean): void;
  setSpeech(text: string | null): void;
  setCostume(url: string): Promise<void>;
  reset(): void;
}

const toPixiCoords = (x: number, y: number) => ({
  px: STAGE_WIDTH / 2 + x,
  py: STAGE_HEIGHT / 2 - y,
});

export const Stage = forwardRef<StageHandle>((_, ref) => {
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);
  const spriteRef = useRef<Sprite | null>(null);
  const speechRef = useRef<Text | null>(null);
  const stateRef = useRef<SpriteState>({ x: 0, y: 0, rotationDeg: 0, visible: true });

  useEffect(() => {
    let destroyed = false;
    const app = new Application();

    (async () => {
      await app.init({
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
        backgroundColor: 0xffffff,
        antialias: true,
      });
      if (destroyed) {
        app.destroy();
        return;
      }
      appRef.current = app;
      canvasHostRef.current?.appendChild(app.canvas);

      const texture: Texture = await Assets.load('/mascot/robot_3.png');
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5, 0.5);
      sprite.width = 120;
      sprite.height = 120;
      const { px, py } = toPixiCoords(0, 0);
      sprite.x = px;
      sprite.y = py;
      app.stage.addChild(sprite);
      spriteRef.current = sprite;

      const speech = new Text({
        text: '',
        style: { fontFamily: 'Inter, sans-serif', fontSize: 16, fill: 0x221338 },
      });
      speech.visible = false;
      app.stage.addChild(speech);
      speechRef.current = speech;
    })();

    return () => {
      destroyed = true;
      appRef.current?.destroy(true, { children: true });
      appRef.current = null;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    getState: () => ({ ...stateRef.current }),

    setPosition(x, y) {
      stateRef.current.x = x;
      stateRef.current.y = y;
      const sprite = spriteRef.current;
      if (!sprite) return;
      const { px, py } = toPixiCoords(x, y);
      sprite.x = px;
      sprite.y = py;
      const speech = speechRef.current;
      if (speech) {
        speech.x = px + 40;
        speech.y = py - 60;
      }
    },

    setRotationDeg(deg) {
      stateRef.current.rotationDeg = deg;
      if (spriteRef.current) {
        // Pixi rotation is radians, clockwise from +x axis -- matches
        // Scratch's "turn right = positive degrees" convention directly.
        spriteRef.current.rotation = (deg * Math.PI) / 180;
      }
    },

    setVisible(visible) {
      stateRef.current.visible = visible;
      if (spriteRef.current) spriteRef.current.visible = visible;
    },

    setSpeech(text) {
      const speech = speechRef.current;
      if (!speech) return;
      if (text) {
        speech.text = text;
        speech.visible = true;
      } else {
        speech.visible = false;
      }
    },

    async setCostume(url) {
      const sprite = spriteRef.current;
      if (!sprite) return;
      const texture = await Assets.load(url);
      sprite.texture = texture;
      // Costumes can be any aspect ratio -- keep the sprite's longest side
      // at 120px rather than stretching it, so uploaded images don't look
      // distorted next to the built-in square mascot costumes.
      const { width, height } = texture;
      const scale = 120 / Math.max(width, height);
      sprite.width = width * scale;
      sprite.height = height * scale;
    },

    reset() {
      stateRef.current = { x: 0, y: 0, rotationDeg: 0, visible: true };
      const sprite = spriteRef.current;
      if (sprite) {
        const { px, py } = toPixiCoords(0, 0);
        sprite.x = px;
        sprite.y = py;
        sprite.rotation = 0;
        sprite.visible = true;
      }
      if (speechRef.current) speechRef.current.visible = false;
    },
  }));

  return (
    <div
      ref={canvasHostRef}
      style={{
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid var(--border)',
      }}
    />
  );
});

Stage.displayName = 'Stage';
