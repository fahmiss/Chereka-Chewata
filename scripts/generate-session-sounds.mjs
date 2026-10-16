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

function seededNoise(seed) {
  let state = seed;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return (state / 0xffff_ffff) * 2 - 1;
  };
}

/** A tiny filtered-noise attack gives the cues a tactile edge without a harsh click. */
function texture(noise, state, time, strength = 0.18) {
  state.value = state.value * 0.76 + noise() * 0.24;
  return state.value * Math.exp(-time * 35) * strength;
}

function tap(time, frequency, noise, state, gain = 0.55) {
  if (time < 0) return 0;
  const attack = Math.min(1, time / 0.003);
  const body = Math.sin(2 * Math.PI * frequency * time) * Math.exp(-time * 18);
  const overtone = Math.sin(2 * Math.PI * frequency * 1.82 * time) * Math.exp(-time * 28) * 0.24;
  return attack * gain * (body + overtone + texture(noise, state, time));
}

const warningNoise = seededNoise(0x710b0);
const warningTexture = { value: 0 };
const tickNoise = seededNoise(0x710b1);
const tickTexture = { value: 0 };
const correctNoise = seededNoise(0x710b2);
const correctTexture = { value: 0 };
const violationNoise = seededNoise(0x710b3);
const violationTexture = { value: 0 };
const timeUpNoise = seededNoise(0x710b4);
const timeUpTexture = { value: 0 };
const quizCorrectNoise = seededNoise(0x710b5);
const quizCorrectTexture = { value: 0 };
const quizIncorrectNoise = seededNoise(0x710b6);
const quizIncorrectTexture = { value: 0 };

const sounds = {
  'taboo-warning.wav': render(0.48, (time) =>
    tap(time, 310, warningNoise, warningTexture, 0.5) +
    tap(time - 0.22, 310, warningNoise, warningTexture, 0.5),
  ),
  'taboo-last-three.wav': render(0.16, (time) =>
    tap(time, 510, tickNoise, tickTexture, 0.45),
  ),
  'taboo-time-up.wav': render(0.72, (time) => {
    const fall = Math.sin(2 * Math.PI * (250 - time * 95) * time) * Math.exp(-time * 5.5) * 0.47;
    return fall + tap(time, 230, timeUpNoise, timeUpTexture, 0.35);
  }),
  'taboo-correct.wav': render(0.28, (time) =>
    tap(time, 680, correctNoise, correctTexture, 0.58),
  ),
  'taboo-violation.wav': render(0.3, (time) => {
    const low = Math.sin(2 * Math.PI * (270 - time * 90) * time) * Math.exp(-time * 17) * 0.42;
    return low + tap(time, 230, violationNoise, violationTexture, 0.34);
  }),
  'quiz-correct.wav': render(0.42, (time) =>
    tap(time, 590, quizCorrectNoise, quizCorrectTexture, 0.43) +
    tap(time - 0.12, 790, quizCorrectNoise, quizCorrectTexture, 0.48),
  ),
  'quiz-incorrect.wav': render(0.38, (time) => {
    const low = Math.sin(2 * Math.PI * (430 - time * 140) * time) * Math.exp(-time * 12) * 0.22;
    return low + tap(time, 350, quizIncorrectNoise, quizIncorrectTexture, 0.3);
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
