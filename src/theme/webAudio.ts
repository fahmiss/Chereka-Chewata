import { Asset } from 'expo-asset';
import type { AudioSource } from 'expo-audio';

/**
 * Web sound engine built on one shared AudioContext.
 *
 * Mobile browsers (Safari above all) only start an <audio> element from
 * inside a tap, so sounds fired by timers (time up, the Bomb explosion,
 * countdown beats) were silently dropped. A Web Audio context unlocked by the
 * first tap can play decoded buffers at any later moment.
 */

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

let context: AudioContext | null = null;
const buffers = new Map<string, Promise<AudioBuffer | null>>();

function audioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (context) return context;
  const Context = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  if (!Context) return null;
  context = new Context();
  const unlock = () => {
    if (!context) return;
    if (context.state !== 'running') void context.resume().catch(() => undefined);
    // iOS also wants a buffer started inside the gesture.
    const silence = context.createBufferSource();
    silence.buffer = context.createBuffer(1, 1, 22_050);
    silence.connect(context.destination);
    silence.start(0);
  };
  for (const event of ['pointerdown', 'touchend', 'keydown']) {
    window.addEventListener(event, unlock, { capture: true, passive: true });
  }
  return context;
}

function sourceUri(source: AudioSource): string | null {
  if (source == null) return null;
  if (typeof source === 'string') return source;
  if (typeof source === 'number') return Asset.fromModule(source).uri;
  if (typeof source === 'object' && 'uri' in source && source.uri) return source.uri;
  return null;
}

/** Fetches and decodes once; later calls share the same promise. */
export function loadSound(source: AudioSource): Promise<AudioBuffer | null> {
  const uri = sourceUri(source);
  const ctx = audioContext();
  if (!uri || !ctx) return Promise.resolve(null);
  let pending = buffers.get(uri);
  if (!pending) {
    pending = fetch(uri)
      .then((response) => response.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .catch(() => null);
    buffers.set(uri, pending);
  }
  return pending;
}

/** Plays a sound and returns a function that stops it. */
export function playSound(
  source: AudioSource,
  volume: number,
  options: { loop?: boolean } = {},
): () => void {
  const ctx = audioContext();
  if (!ctx) return () => undefined;
  let stopped = false;
  let node: AudioBufferSourceNode | null = null;

  void loadSound(source).then((buffer) => {
    if (!buffer || stopped) return;
    if (ctx.state !== 'running') void ctx.resume().catch(() => undefined);
    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.connect(ctx.destination);
    node = ctx.createBufferSource();
    node.buffer = buffer;
    node.loop = !!options.loop;
    node.connect(gain);
    node.start();
  });

  return () => {
    stopped = true;
    try {
      node?.stop();
    } catch {
      // Already finished.
    }
    node = null;
  };
}
