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

function render(duration, sampleAtTime) {
  const samples = new Float32Array(Math.floor(sampleRate * duration));
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = sampleAtTime(index / sampleRate);
  }
  return samples;
}

function countdownBeat() {
  return render(0.22, (time) => {
    const envelope = Math.exp(-time * 22);
    const body = Math.sin(2 * Math.PI * 430 * time) * 0.62;
    const click = Math.sin(2 * Math.PI * 1_180 * time) * 0.18;
    return (body + click) * envelope;
  });
}

function pointCue() {
  return render(0.52, (time) => {
    const envelope = Math.exp(-time * 5.4);
    const rise = 610 + time * 360;
    const lead = Math.sin(2 * Math.PI * rise * time) * 0.56;
    const shine = Math.sin(2 * Math.PI * rise * 1.5 * time) * 0.2;
    return (lead + shine) * envelope;
  });
}

mkdirSync(outputDirectory, { recursive: true });
writeFileSync(resolve(outputDirectory, 'most-likely-count.wav'), wavBuffer(countdownBeat()));
writeFileSync(resolve(outputDirectory, 'most-likely-point.wav'), wavBuffer(pointCue()));
