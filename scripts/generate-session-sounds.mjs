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
    buffer.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample)) * 32_767), 44 + index * 2);
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

function tone(duration, frequencies, decay = 6, gain = 0.62) {
  return render(duration, (time) => {
    const body = frequencies.reduce(
      (sum, frequency, index) => sum + Math.sin(2 * Math.PI * frequency * time) / (index + 1),
      0,
    );
    return body * Math.exp(-time * decay) * gain;
  });
}

const sounds = {
  'taboo-warning.wav': render(0.48, (time) => {
    const pulse = time < 0.16 || (time > 0.24 && time < 0.4) ? 1 : 0;
    return Math.sin(2 * Math.PI * 360 * time) * Math.exp(-(time % 0.24) * 18) * pulse * 0.58;
  }),
  'taboo-time-up.wav': render(0.78, (time) => {
    const frequency = 185 - time * 42;
    return Math.sin(2 * Math.PI * frequency * time) * Math.exp(-time * 2.8) * 0.72;
  }),
  'taboo-correct.wav': tone(0.3, [720, 1_080], 8, 0.58),
  'taboo-violation.wav': render(0.34, (time) => {
    const frequency = 330 - time * 230;
    return Math.sin(2 * Math.PI * frequency * time) * Math.exp(-time * 7) * 0.62;
  }),
  'secret-reveal.wav': tone(0.38, [640, 960], 7, 0.48),
  'verdict-sting.wav': render(0.64, (time) => {
    const rise = 220 + time * 420;
    const tension = Math.sin(2 * Math.PI * rise * time) * (1 - Math.exp(-time * 14));
    return tension * Math.exp(-time * 2.6) * 0.56;
  }),
  'result-win.wav': render(0.82, (time) => {
    const notes = [523.25, 659.25, 783.99];
    const step = Math.min(notes.length - 1, Math.floor(time / 0.2));
    const local = time - step * 0.2;
    return Math.sin(2 * Math.PI * notes[step] * time) * Math.exp(-local * 4.2) * 0.52;
  }),
  'result-loss.wav': render(0.72, (time) => {
    const frequency = time < 0.3 ? 392 : 311;
    return Math.sin(2 * Math.PI * frequency * time) * Math.exp(-time * 3.8) * 0.46;
  }),
};

mkdirSync(outputDirectory, { recursive: true });
for (const [filename, samples] of Object.entries(sounds)) {
  writeFileSync(resolve(outputDirectory, filename), wavBuffer(samples));
}
