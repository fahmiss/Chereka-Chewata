import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = resolve(root, 'assets/sounds');
const sampleRate = 22_050;

function wavBuffer(samples) {
  const dataBytes = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataBytes);
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataBytes, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataBytes, 40);
  samples.forEach((sample, index) => {
    const clamped = Math.max(-1, Math.min(1, sample));
    buffer.writeInt16LE(Math.round(clamped * 32_767), 44 + index * 2);
  });
  return buffer;
}

function seededNoise() {
  let state = 0x5f3759df;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return (state / 0xffff_ffff) * 2 - 1;
  };
}

function fuseLoop() {
  // Longer than the game's 32-second maximum fuse, so playback never reaches
  // a loop boundary during a round. Native players can add a tiny seam when a
  // WAV restarts even when its waveform is mathematically seamless.
  const duration = 36;
  const count = sampleRate * duration;
  const samples = new Float32Array(count);
  const noise = seededNoise();
  let emberNoise = 0;

  for (let index = 0; index < count; index += 1) {
    const time = index / sampleRate;
    const tickPosition = (time % 0.5) / 0.5;
    const tickEnvelope = Math.exp(-tickPosition * 34);
    const click = Math.sin(2 * Math.PI * 1_450 * time) * tickEnvelope * 0.22;
    const crackleGate = Math.max(0, noise() - 0.78);
    const crackle = crackleGate * noise() * 0.16;
    emberNoise = emberNoise * 0.86 + noise() * 0.14;
    const ember = emberNoise * 0.035 + Math.sin(2 * Math.PI * 92 * time) * 0.018;
    samples[index] = click + crackle + ember;
  }
  return samples;
}

function explosion() {
  const duration = 1.35;
  const count = Math.floor(sampleRate * duration);
  const samples = new Float32Array(count);
  const noise = seededNoise();
  let smoothedNoise = 0;

  for (let index = 0; index < count; index += 1) {
    const time = index / sampleRate;
    const decay = Math.exp(-time * 3.5);
    smoothedNoise = smoothedNoise * 0.92 + noise() * 0.08;
    const impact = noise() * Math.exp(-time * 24) * 0.8;
    const rumble = smoothedNoise * decay * 2.4;
    const bass = Math.sin(2 * Math.PI * (62 - time * 18) * time) * decay * 0.46;
    samples[index] = Math.tanh(impact + rumble + bass) * 0.88;
  }
  return samples;
}

mkdirSync(outputDirectory, { recursive: true });
writeFileSync(resolve(outputDirectory, 'bomb-fuse.wav'), wavBuffer(fuseLoop()));
writeFileSync(resolve(outputDirectory, 'bomb-explosion.wav'), wavBuffer(explosion()));
