/**
 * Chereka Chewata sound kit.
 *
 * 1. Synthesizes the per-game signature motifs, Gimbar's pass whoosh, Mizan's
 *    reveal and the Bomb fuse loop. Instruments are modelled on Ethiopian
 *    ones (krar, kebero, washint, tsenatsel, masinko) and melodies use the
 *    qenet scales (Tizita, Bati, Ambassel, Anchihoye). Everything is
 *    generated here, so there is nothing to license.
 * 2. Normalizes every WAV in assets/sounds to one loudness per role, so no
 *    game is louder than another. Run it after any other sound script.
 *
 *    node scripts/generate-sound-kit.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = resolve(root, 'assets/sounds');
/** Rendered at 44.1 kHz for accurate string tuning, written at 22.05 kHz. */
const RENDER_RATE = 44_100;
const OUTPUT_RATE = 22_050;

/* ------------------------------------------------------------------ *
 * WAV I/O
 * ------------------------------------------------------------------ */

function wavBuffer(samples, sampleRate) {
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

/** Reads 16-bit mono or stereo PCM WAV (stereo is mixed down). */
function readWav(path) {
  const buffer = readFileSync(path);
  let offset = 12;
  let channels = 1;
  let sampleRate = OUTPUT_RATE;
  let data = null;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString('ascii', offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (id === 'fmt ') {
      channels = buffer.readUInt16LE(offset + 10);
      sampleRate = buffer.readUInt32LE(offset + 12);
    } else if (id === 'data') {
      data = buffer.subarray(offset + 8, offset + 8 + size);
    }
    offset += 8 + size + (size % 2);
  }
  if (!data) throw new Error(`${path}: no data chunk`);
  const frames = data.length / 2 / channels;
  const samples = new Float32Array(frames);
  for (let frame = 0; frame < frames; frame += 1) {
    let sum = 0;
    for (let channel = 0; channel < channels; channel += 1) {
      sum += data.readInt16LE((frame * channels + channel) * 2) / 32_768;
    }
    samples[frame] = sum / channels;
  }
  return { samples, sampleRate };
}

/** 2:1 decimation with a short low-pass, 44.1 kHz render to 22.05 kHz file. */
function downsample(samples) {
  const out = new Float32Array(Math.floor(samples.length / 2));
  for (let index = 0; index < out.length; index += 1) {
    const i = index * 2;
    const a = samples[i - 1] ?? 0;
    const b = samples[i];
    const c = samples[i + 1] ?? 0;
    const d = samples[i + 2] ?? 0;
    out[index] = 0.15 * a + 0.35 * b + 0.35 * c + 0.15 * d;
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Building blocks
 * ------------------------------------------------------------------ */

function seededNoise(seed = 0x5f3759df) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return (state / 0xffff_ffff) * 2 - 1;
  };
}

function buffer(seconds) {
  return new Float32Array(Math.ceil(seconds * RENDER_RATE));
}

function at(seconds) {
  return Math.round(seconds * RENDER_RATE);
}

/** Note frequency from a root and a semitone offset. */
function note(root, semitones) {
  return root * 2 ** (semitones / 12);
}

/** Qenet scales as semitone offsets from the root. */
const QENET = {
  tizita: [0, 2, 4, 7, 9],
  tizitaMinor: [0, 2, 3, 7, 8],
  bati: [0, 4, 5, 7, 11],
  ambassel: [0, 1, 5, 7, 8],
  anchihoye: [0, 1, 5, 6, 9],
};

const D4 = 293.66;

/**
 * Krar (plucked lyre): Karplus–Strong string with a bright attack and a
 * short wooden body resonance.
 */
function krar(out, start, frequency, duration = 1.1, gain = 0.5, seed = 7) {
  const noise = seededNoise(seed + Math.round(frequency));
  const period = RENDER_RATE / frequency;
  const length = Math.floor(period);
  const fraction = period - length;
  const line = new Float32Array(length + 2);
  for (let i = 0; i < line.length; i += 1) line[i] = noise() * 0.9;
  let index = 0;
  let previous = 0;
  const first = at(start);
  const count = at(duration);
  let body = 0;
  for (let n = 0; n < count && first + n < out.length; n += 1) {
    const a = line[index];
    const b = line[(index + 1) % line.length];
    // Fractional delay keeps the string in tune.
    const sample = a + fraction * (b - a);
    const averaged = 0.497 * (sample + previous);
    previous = sample;
    line[index] = averaged;
    index = (index + 1) % length;
    const release = n > count - at(0.08) ? (count - n) / at(0.08) : 1;
    body = body * 0.6 + sample * 0.4;
    out[first + n] += (sample * 0.75 + body * 0.25) * gain * release;
  }
}

/**
 * Kebero (barrel drum): a membrane tone that drops in pitch, plus a short
 * low-passed slap for the hand strike.
 */
function kebero(out, start, frequency = 110, gain = 0.8, decay = 9, seed = 11) {
  const noise = seededNoise(seed);
  const first = at(start);
  const count = at(0.6);
  let phase = 0;
  let slap = 0;
  for (let n = 0; n < count && first + n < out.length; n += 1) {
    const time = n / RENDER_RATE;
    const pitch = frequency * (1 + 0.55 * Math.exp(-time * 38));
    phase += (2 * Math.PI * pitch) / RENDER_RATE;
    const tone = Math.sin(phase) + 0.3 * Math.sin(phase * 1.52) * Math.exp(-time * 22);
    slap = slap * 0.55 + noise() * 0.45;
    const hit = tone * Math.exp(-time * decay) + slap * Math.exp(-time * 70) * 0.55;
    out[first + n] += Math.tanh(hit * 1.2) * gain;
  }
}

/**
 * Washint (bamboo flute): soft attack, gentle vibrato after the onset and a
 * breathy layer.
 */
function washint(out, start, frequency, duration, gain = 0.32, seed = 23) {
  const noise = seededNoise(seed);
  const first = at(start);
  const count = at(duration);
  let phase = 0;
  let breath = 0;
  for (let n = 0; n < count && first + n < out.length; n += 1) {
    const time = n / RENDER_RATE;
    const attack = Math.min(1, time / 0.05);
    const release = Math.min(1, (duration - time) / 0.09);
    const vibrato = 1 + 0.006 * Math.sin(2 * Math.PI * 5.4 * time) * Math.min(1, time / 0.15);
    phase += (2 * Math.PI * frequency * vibrato) / RENDER_RATE;
    const tone = Math.sin(phase) + 0.22 * Math.sin(2 * phase) + 0.07 * Math.sin(3 * phase);
    breath = breath * 0.8 + noise() * 0.2;
    out[first + n] += (tone + breath * 0.35) * attack * Math.max(0, release) * gain;
  }
}

/** Tsenatsel (sistrum): a quick shake of small metal discs. */
function tsenatsel(out, start, shakes = 3, gain = 0.22, seed = 31) {
  const noise = seededNoise(seed);
  const partials = [3_150, 4_330, 5_170, 6_240, 7_480];
  for (let shake = 0; shake < shakes; shake += 1) {
    const first = at(start + shake * 0.075);
    const count = at(0.22);
    let hiss = 0;
    for (let n = 0; n < count && first + n < out.length; n += 1) {
      const time = n / RENDER_RATE;
      let ring = 0;
      for (let p = 0; p < partials.length; p += 1) {
        ring += Math.sin(2 * Math.PI * partials[p] * (1 + shake * 0.01) * time + p) / partials.length;
      }
      const raw = noise();
      hiss = raw - hiss * 0.2;
      const envelope = Math.exp(-time * 26);
      out[first + n] += (ring * 0.8 + hiss * 0.5) * envelope * gain * (shake === shakes - 1 ? 1 : 0.7);
    }
  }
}

/**
 * Masinko (one-string bowed fiddle): band-limited saw with a slow bow
 * attack, vibrato and an optional pitch glide.
 */
function masinko(out, start, from, to, duration, gain = 0.22) {
  const first = at(start);
  const count = at(duration);
  let phase = 0;
  let filtered = 0;
  for (let n = 0; n < count && first + n < out.length; n += 1) {
    const time = n / RENDER_RATE;
    const progress = time / duration;
    const glide = progress < 0.75 ? 0.5 - 0.5 * Math.cos((Math.PI * progress) / 0.75) : 1;
    const vibrato = 1 + 0.008 * Math.sin(2 * Math.PI * 6 * time);
    const frequency = (from + (to - from) * glide) * vibrato;
    phase += (2 * Math.PI * frequency) / RENDER_RATE;
    let saw = 0;
    for (let k = 1; k <= 9; k += 1) saw += Math.sin(k * phase) / k;
    filtered = filtered * 0.55 + saw * 0.45;
    const attack = Math.min(1, time / 0.07);
    const release = Math.min(1, (duration - time) / 0.12);
    out[first + n] += filtered * attack * Math.max(0, release) * gain;
  }
}

/** Filtered-noise whoosh that sweeps upward, like a card flicked away. */
function whoosh(out, start, duration = 0.32, gain = 0.6, seed = 41) {
  const noise = seededNoise(seed);
  const first = at(start);
  const count = at(duration);
  let low = 0;
  let band = 0;
  for (let n = 0; n < count && first + n < out.length; n += 1) {
    const progress = n / count;
    const cutoff = 450 + 2_600 * progress * progress;
    const f = 2 * Math.sin((Math.PI * cutoff) / RENDER_RATE);
    const input = noise();
    low += f * band;
    const high = input - low - 0.9 * band;
    band += f * high;
    const envelope = Math.sin(Math.PI * Math.min(1, progress * 1.1)) ** 1.6;
    out[first + n] += band * envelope * gain;
  }
}

/** Small-room reverb (three combs and an all-pass) for a warmer, finished sound. */
function room(samples, mix = 0.16) {
  const combs = [0.0297, 0.0371, 0.0411].map((seconds) => ({
    line: new Float32Array(Math.round(seconds * RENDER_RATE)),
    index: 0,
  }));
  const allpass = { line: new Float32Array(Math.round(0.005 * RENDER_RATE)), index: 0 };
  const out = new Float32Array(samples.length + at(0.35));
  for (let n = 0; n < out.length; n += 1) {
    const dry = samples[n] ?? 0;
    let wet = 0;
    for (const comb of combs) {
      const delayed = comb.line[comb.index];
      comb.line[comb.index] = dry + delayed * 0.62;
      comb.index = (comb.index + 1) % comb.line.length;
      wet += delayed;
    }
    wet /= combs.length;
    const delayed = allpass.line[allpass.index];
    const next = wet + delayed * 0.5;
    allpass.line[allpass.index] = next;
    allpass.index = (allpass.index + 1) % allpass.line.length;
    out[n] = dry + (delayed - next * 0.5) * mix;
  }
  return out;
}

/** Trailing silence trimmed, with a short fade so nothing clicks. */
function finish(samples) {
  let end = samples.length;
  while (end > 0 && Math.abs(samples[end - 1]) < 1e-4) end -= 1;
  const out = samples.slice(0, Math.max(end, 1));
  const fade = Math.min(out.length, at(0.03));
  for (let n = 0; n < fade; n += 1) out[out.length - 1 - n] *= n / fade;
  return out;
}

/* ------------------------------------------------------------------ *
 * Sounds
 * ------------------------------------------------------------------ */

function signature(build, seconds = 1.6, mix = 0.16) {
  const out = buffer(seconds);
  build(out);
  return finish(room(out, mix));
}

const SIGNATURES = {
  // Sly descending Ambassel on the krar.
  whos_the_liar: (out) => {
    [8, 7, 5, 1].forEach((step, i) => krar(out, i * 0.13, note(D4, step), 0.9, 0.45));
  },
  // Kebero double hit, then a bright washint call.
  taboo: (out) => {
    kebero(out, 0, 105, 0.85);
    kebero(out, 0.14, 190, 0.6, 14);
    washint(out, 0.3, note(D4 * 2, 7), 0.18);
    washint(out, 0.46, note(D4 * 2, 9), 0.34);
  },
  // A sistrum shake and a rising Tizita.
  most_likely: (out) => {
    tsenatsel(out, 0, 3, 0.22);
    [0, 4, 7].forEach((step, i) => krar(out, 0.22 + i * 0.11, note(D4, step), 0.9, 0.45));
  },
  // Two low heartbeat thumps and a tense Ambassel pluck.
  bomb: (out) => {
    kebero(out, 0, 72, 0.95, 7);
    kebero(out, 0.2, 72, 0.75, 8);
    krar(out, 0.46, note(D4, 1), 0.9, 0.42);
  },
  // A question asked twice: two choices, left then right.
  would_you_rather: (out) => {
    krar(out, 0, note(D4, 4), 0.6, 0.45);
    krar(out, 0.24, note(D4, 7), 0.6, 0.45);
    krar(out, 0.58, note(D4, 9), 0.9, 0.45);
  },
  // Rising Bati arpeggio on the washint.
  quiz: (out) => {
    [0, 4, 7].forEach((step, i) => washint(out, i * 0.12, note(D4 * 2, step), 0.14));
    washint(out, 0.36, note(D4 * 2, 11), 0.36);
  },
  // Quick kebero roll into a krar flourish: party energy.
  gimbar: (out) => {
    [0, 0.07, 0.14].forEach((t, i) => kebero(out, t, 150 + i * 20, 0.5, 16));
    [0, 2, 4, 7, 9].forEach((step, i) => krar(out, 0.24 + i * 0.07, note(D4, step), 0.8, 0.38));
  },
  // A shake of the basket and a warm Tizita minor.
  mesob: (out) => {
    tsenatsel(out, 0, 2, 0.2);
    [0, 3, 7].forEach((step, i) => krar(out, 0.18 + i * 0.13, note(D4, step), 1, 0.45));
  },
  // A masinko glide, like a needle swinging across the dial.
  mizan: (out) => {
    masinko(out, 0, note(D4, 0), note(D4, 7), 0.75, 0.22);
    krar(out, 0.68, note(D4, 7), 0.9, 0.35);
  },
  // Low Ambassel step and a tiny high "wink".
  wink_killer: (out) => {
    krar(out, 0, note(D4 / 2, 0), 0.9, 0.5);
    krar(out, 0.18, note(D4 / 2, 1), 0.9, 0.5);
    krar(out, 0.5, note(D4 * 4, 7), 0.4, 0.22);
  },
  // Mysterious Anchihoye on the washint over a soft drum.
  insider: (out) => {
    kebero(out, 0, 90, 0.5, 8);
    washint(out, 0.08, note(D4 * 2, 9), 0.18);
    washint(out, 0.28, note(D4 * 2, 6), 0.18);
    washint(out, 0.48, note(D4 * 2, 5), 0.42);
  },
};

function gimbarPass() {
  const out = buffer(0.45);
  whoosh(out, 0, 0.32, 0.9);
  return finish(out);
}

function mizanReveal() {
  const out = buffer(1.4);
  masinko(out, 0, note(D4, -5), note(D4, 7), 0.5, 0.2);
  krar(out, 0.42, note(D4, 7), 1, 0.4);
  krar(out, 0.42, note(D4 * 2, 7), 1, 0.2);
  return finish(room(out, 0.2));
}

/**
 * Bomb fuse: 4 seconds, a tick every half second plus crackle. The loop point
 * sits exactly on a tick, so any restart gap is masked by the click.
 */
function fuseLoop() {
  const duration = 4;
  const count = RENDER_RATE * duration;
  const samples = new Float32Array(count);
  const noise = seededNoise();
  let ember = 0;
  for (let index = 0; index < count; index += 1) {
    const time = index / RENDER_RATE;
    const tickPosition = (time % 0.5) / 0.5;
    const click = Math.sin(2 * Math.PI * 1_450 * time) * Math.exp(-tickPosition * 34) * 0.22;
    const crackle = Math.max(0, noise() - 0.78) * noise() * 0.16;
    ember = ember * 0.93 + noise() * 0.07;
    samples[index] = click + crackle + ember * 0.07 + Math.sin(2 * Math.PI * 92 * time) * 0.018;
  }
  return samples;
}

/* ------------------------------------------------------------------ *
 * Loudness
 * ------------------------------------------------------------------ */

/** RMS of the audible part only, so short and long sounds compare fairly. */
function activeRms(samples, sampleRate) {
  const window = Math.max(1, Math.round(sampleRate * 0.03));
  let sum = 0;
  let count = 0;
  for (let start = 0; start < samples.length; start += window) {
    let energy = 0;
    const end = Math.min(samples.length, start + window);
    for (let n = start; n < end; n += 1) energy += samples[n] * samples[n];
    const rms = Math.sqrt(energy / (end - start));
    if (rms > 0.006) {
      sum += energy;
      count += end - start;
    }
  }
  return count ? Math.sqrt(sum / count) : 0;
}

/** Target active loudness per role, in dBFS. */
function targetFor(name) {
  if (name === 'bomb-fuse.wav') return -24;
  if (name.startsWith('signature-')) return -18;
  if (name === 'taboo-last-three.wav' || name === 'gimbar-pass.wav') return -19;
  return -17;
}

function normalize(samples, sampleRate, targetDb) {
  const rms = activeRms(samples, sampleRate);
  if (!rms) return samples;
  const gain = 10 ** (targetDb / 20) / rms;
  const ceiling = 10 ** (-1 / 20);
  const knee = 0.7;
  return samples.map((value) => {
    const scaled = value * gain;
    const magnitude = Math.abs(scaled);
    if (magnitude <= knee) return scaled;
    // Soft limit above the knee so loud transients never clip.
    const over = (magnitude - knee) / (ceiling - knee);
    return Math.sign(scaled) * (knee + (ceiling - knee) * Math.tanh(over));
  });
}

/* ------------------------------------------------------------------ *
 * Write
 * ------------------------------------------------------------------ */

const generated = {
  'bomb-fuse.wav': fuseLoop(),
  'gimbar-pass.wav': gimbarPass(),
  'mizan-reveal.wav': mizanReveal(),
  ...Object.fromEntries(
    Object.entries(SIGNATURES).map(([game, build]) => [
      `signature-${game.replace(/_/g, '-')}.wav`,
      signature(build),
    ]),
  ),
};

for (const [name, samples] of Object.entries(generated)) {
  writeFileSync(resolve(outputDirectory, name), wavBuffer(downsample(samples), OUTPUT_RATE));
}

for (const name of readdirSync(outputDirectory).filter((file) => file.endsWith('.wav')).sort()) {
  const path = resolve(outputDirectory, name);
  const { samples, sampleRate } = readWav(path);
  const before = 20 * Math.log10(activeRms(samples, sampleRate) || 1e-9);
  const out = normalize(samples, sampleRate, targetFor(name));
  writeFileSync(path, wavBuffer(out, sampleRate));
  const after = 20 * Math.log10(activeRms(out, sampleRate) || 1e-9);
  console.log(`${name.padEnd(30)} ${before.toFixed(1).padStart(6)} → ${after.toFixed(1).padStart(6)} dBFS`);
}
