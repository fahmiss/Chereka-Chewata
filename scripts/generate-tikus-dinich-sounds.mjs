/** Original, license-free Tikus Dinich sounds. Run with `node scripts/generate-tikus-dinich-sounds.mjs`. */
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RATE = 22_050;
const output = resolve(dirname(fileURLToPath(import.meta.url)), '../assets/sounds');

function wav(samples) {
  const buffer = Buffer.alloc(44 + samples.length * 2);
  buffer.write('RIFF', 0); buffer.writeUInt32LE(36 + samples.length * 2, 4);
  buffer.write('WAVEfmt ', 8); buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22); buffer.writeUInt32LE(RATE, 24); buffer.writeUInt32LE(RATE * 2, 28);
  buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34); buffer.write('data', 36);
  buffer.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((sample, index) => buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample)) * 32767), 44 + index * 2));
  return buffer;
}

function noise(seed = 481516) {
  let state = seed >>> 0;
  return () => { state = (1664525 * state + 1013904223) >>> 0; return state / 0xffffffff * 2 - 1; };
}

// A seamless, constant cooking sizzle. No ticks, tempo changes, or clues about the hidden deadline.
function sizzle() {
  const duration = 4;
  const samples = new Float32Array(RATE * duration);
  const random = noise();
  let previous = 0;
  let body = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const raw = random();
    const bright = raw - previous;
    previous = raw;
    body = body * 0.94 + raw * 0.06;
    samples[i] = bright * 0.035 + body * 0.045;
  }
  const edge = Math.round(RATE * 0.12);
  for (let i = 0; i < edge; i += 1) {
    const mix = i / edge;
    const a = samples[i];
    const b = samples[samples.length - edge + i];
    const blended = a * mix + b * (1 - mix);
    samples[i] = blended;
    samples[samples.length - edge + i] = blended;
  }
  return samples;
}

// Sudden pressure release followed by a short playful wooden-pot tap.
function steamBurst() {
  const duration = 1.25;
  const samples = new Float32Array(Math.round(RATE * duration));
  const random = noise(8675309);
  let air = 0;
  for (let i = 0; i < samples.length; i += 1) {
    const t = i / RATE;
    air = air * 0.82 + random() * 0.18;
    const steam = (random() * 0.65 + air * 0.35) * Math.exp(-t * 3.2) * 0.5;
    const tap = Math.sin(2 * Math.PI * 185 * t) * Math.exp(-Math.max(0, t - 0.08) * 12) * (t >= 0.08 ? 0.22 : 0);
    samples[i] = steam + tap;
  }
  return samples;
}

writeFileSync(resolve(output, 'bomb-fuse.wav'), wav(sizzle()));
writeFileSync(resolve(output, 'bomb-explosion.wav'), wav(steamBurst()));
