type AudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  const AudioContextClass =
    window.AudioContext ??
    (window as AudioWindow).webkitAudioContext;

  if (!AudioContextClass) return null;

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }

  return audioContext;
}

function tone(
  frequency: number,
  duration: number,
  volume: number,
  type: OscillatorType = "sine",
  endFrequency?: number,
): void {
  const context = getAudioContext();
  if (!context) return;

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);

  if (endFrequency !== undefined) {
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(endFrequency, 1),
      now + duration,
    );
  }

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}

export function playPressSound(): void {
  tone(150, 0.055, 0.035, "square", 95);
}

export function playSuccessSound(): void {
  tone(520, 0.09, 0.025, "sine", 720);

  window.setTimeout(() => {
    tone(760, 0.11, 0.018, "sine", 900);
  }, 65);
}

export function playErrorSound(): void {
  tone(180, 0.18, 0.025, "sawtooth", 90);
}

export function playSurgeSound(): void {
  tone(90, 0.65, 0.018, "sine", 180);

  window.setTimeout(() => {
    tone(240, 0.42, 0.012, "triangle", 480);
  }, 120);
}
