"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getOrCreateDeviceId } from "@/lib/device";
import {
  playErrorSound,
  playPressSound,
  playSuccessSound,
  playSurgeSound,
} from "@/lib/sounds";

type GateState = {
  progress: number;
  target: number;
  gate_open: boolean;
  next_press_at: string | null;
  can_press: boolean;
  surge_active: boolean;
  surge_multiplier: number;
  surge_ends_at: string | null;
};

type PressResult = {
  accepted: boolean;
  progress: number;
  target: number;
  gate_open: boolean;
  next_press_at: string | null;
  signal_value: number;
  surge_active: boolean;
  surge_multiplier: number;
  surge_ends_at: string | null;
};

const ARCHIVE_URL =
  "https://archivalterminal.github.io/archival-terminal/enter.html";

const NORMAL_MESSAGES = [
  "Signal accepted.",
  "Pulse confirmed.",
  "The Gate is listening.",
  "Wind speed corrected.",
  "Coffee level critical.",
  "Satellite #14 replied.",
  "One bird redirected.",
  "Nobody noticed.",
  "Unknown frequency detected.",
  "Signal smells acceptable.",
  "Gravity approved.",
  "Door refused.",
  "Banana signal confirmed.",
  "Duck acknowledged.",
  "Cat declined.",
  "Wrong universe selected.",
  "The moon blinked.",
  "Please don't press again.",
  "Too late.",
  "Too early.",
  "Excellent timing.",
  "Somebody sneezed in Brazil.",
  "Signal tastes blue.",
  "Everything is normal.",
  "Nothing is normal.",
  "Background humming increased.",
  "The Gate yawned.",
  "Listening...",
  "Echo received.",
  "No echo found.",
  "Satellite laughed.",
  "Protocol forgotten.",
  "Invisible approval granted.",
  "Tree synchronization complete.",
  "Signal escaped.",
  "Quantum pigeon detected.",
  "The janitor approved.",
  "Unauthorized optimism detected.",
  "Coffee restored.",
  "Banana calibrated.",
  "Bird #843 redirected.",
  "Your signal looked suspicious.",
  "Reality updated.",
  "Please ignore previous message.",
  "Transmission almost meaningful.",
  "One pixel moved.",
  "Silence confirmed.",
  "The Gate blinked.",
  "Somebody is watching.",
  "Nobody is watching.",
  "Everything depends on this.",
  "Actually... probably not.",
  "Tiny success recorded.",
  "Signal folded neatly.",
  "Rubber duck verified.",
  "Invisible applause.",
  "Cosmic paperwork completed.",
  "The signal felt lucky.",
  "A distant microwave beeped.",
  "Do not feed the Gate.",
  "Signal archived forever."
];

const FUNNY_MESSAGES = [
  "One goose promoted.",
  "Banana verified.",
  "Coffee level critical.",
  "Chair synchronized.",
  "One pigeon resigned.",
  "Tree #482 approved.",
  "Gravity looks tired today.",
  "Air refreshed.",
  "Your keyboard is proud.",
  "Local ghost satisfied.",
  "One bird redirected.",
  "A potato has connected.",
  "No dragons detected.",
  "Sand updated.",
  "One fish applauded.",
  "Nobody noticed.",
  "The moon blinked.",
  "One pixel repaired.",
  "Somebody in Brazil sneezed.",
  "Cat rejected your request.",
  "Coffee machine rebooted.",
  "One cloud moved slightly left.",
  "A spoon has been authorized.",
  "Goose protocol enabled.",
  "The floor remains operational.",
  "Pigeon council informed.",
  "Banana signal confirmed.",
  "One chair feels important now.",
  "A fish has read your message.",
  "Reality patched successfully.",
];

const STRANGE_MESSAGES = [
  "Do not press again.",
  "The Gate remembers.",
  "Someone noticed.",
  "Background activity detected.",
  "Unknown response received.",
  "The signal echoed.",
  "Please remain calm.",
  "The Gate blinked.",
  "Something moved.",
  "You were counted.",
  "An observer has joined.",
  "The system hesitated.",
  "Signal arrived before request.",
  "Someone else is pressing.",
  "The Gate is thinking.",
  "Transmission incomplete.",
  "Unknown user connected.",
  "The signal was weaker than expected.",
  "The Gate smiled.",
  "Do not refresh.",
];

const RARE_MESSAGES = [
  "████ SIGNAL ANOMALY ████",
  "Administrator connected.",
  "Unknown protocol detected.",
  "Impossible.",
  "Connection established with Sector 9.",
  "Signal accepted twice.",
  "Press confirmed before request.",
  "Observer status: UNKNOWN.",
];

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

function getRandomMessage(previous: string): string {
  const roll = Math.random();
  let pool: string[];

  if (roll < 0.02) {
    pool = RARE_MESSAGES;
  } else if (roll < 0.22) {
    pool = STRANGE_MESSAGES;
  } else if (roll < 0.58) {
    pool = FUNNY_MESSAGES;
  } else {
    pool = NORMAL_MESSAGES;
  }

  const available = pool.filter((message) => message !== previous);
  return available[Math.floor(Math.random() * available.length)] ?? pool[0];
}

export default function Home() {
  const [deviceId, setDeviceId] = useState("");
  const [state, setState] = useState<GateState>({
    progress: 0,
    target: 1_000_000,
    gate_open: false,
    next_press_at: null,
    can_press: false,
    surge_active: false,
    surge_multiplier: 1,
    surge_ends_at: null,
  });

  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pressing, setPressing] = useState(false);
  const [message, setMessage] = useState("KEEP THE SIGNAL ALIVE");
  const [error, setError] = useState("");
  const sequenceTimerRef = useRef<number[]>([]);
  const previousFinalMessageRef = useRef("");

  const progressPercent = useMemo(() => {
    if (state.target <= 0) return 0;
    return Math.min((state.progress / state.target) * 100, 100);
  }, [state.progress, state.target]);

  useEffect(() => {
    setDeviceId(getOrCreateDeviceId());

    return () => {
      sequenceTimerRef.current.forEach(window.clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (!deviceId) return;
    let cancelled = false;

    async function loadState() {
      const { data, error: loadError } = await supabase.rpc(
        "get_gate_state",
        { p_device_id: deviceId },
      );

      if (cancelled) return;

      if (loadError) {
        console.error(loadError);
        setError("CONNECTION FAILED");
        setLoading(false);
        return;
      }

      const row = Array.isArray(data)
        ? (data[0] as GateState | undefined)
        : undefined;

      if (row) {
        if (row.surge_active && !state.surge_active) {
  playSurgeSound();
}
        setState({
          ...row,
          progress: Number(row.progress),
          target: Number(row.target),
        });
        setError("");
      }

      setLoading(false);
    }

    loadState();
    const timer = window.setInterval(loadState, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [deviceId]);

  useEffect(() => {
    function updateCountdown() {
      if (!state.next_press_at) {
        setSecondsLeft(0);
        return;
      }

      const remaining = Math.max(
        0,
        Math.ceil(
          (new Date(state.next_press_at).getTime() - Date.now()) / 1000,
        ),
      );

      setSecondsLeft(remaining);

      if (remaining === 0 && !state.gate_open) {
        setState((current) => ({ ...current, can_press: true }));
      }
    }

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 250);
    return () => window.clearInterval(timer);
  }, [state.next_press_at, state.gate_open]);

  function runMessageSequence() {
    sequenceTimerRef.current.forEach(window.clearTimeout);
    sequenceTimerRef.current = [];

    setMessage("RECEIVING SIGNAL...");

    sequenceTimerRef.current.push(
      window.setTimeout(() => {
        setMessage("DECRYPTING...");
      }, 450),
    );

    sequenceTimerRef.current.push(
      window.setTimeout(() => {
        const finalMessage = getRandomMessage(
          previousFinalMessageRef.current,
        );
        previousFinalMessageRef.current = finalMessage;
        setMessage(finalMessage.toUpperCase());
      }, 1050),
    );
  }

  async function press() {
    if (!deviceId || loading || pressing || !state.can_press || state.gate_open) {
      return;
    }
    playPressSound();

    setPressing(true);
    setError("");

    const { data, error: pressError } = await supabase.rpc(
      "press_gate",
      { p_device_id: deviceId },
    );

    if (pressError) {
      playErrorSound();
      console.error(pressError);
      setError("SIGNAL REJECTED");
      setPressing(false);
      return;
    }

    const row = Array.isArray(data)
      ? (data[0] as PressResult | undefined)
      : undefined;

    if (!row) {
      setError("INVALID RESPONSE");
      setPressing(false);
      return;
    }

setState({
  progress: Number(row.progress),
  target: Number(row.target),
  gate_open: row.gate_open,
  next_press_at: row.next_press_at,
  can_press: false,
  surge_active: row.surge_active,
  surge_multiplier: Number(row.surge_multiplier),
  surge_ends_at: row.surge_ends_at,
});

    if (row.accepted) {
      playSuccessSound();
      runMessageSequence();
    } else {
      setMessage("SIGNAL RECHARGING");
    }

    window.setTimeout(() => {
      setPressing(false);
    }, 900);
  }

  if (state.gate_open) {
    return (
      <main className="gate-page gate-open-page">
        <p className="gate-kicker">PROJECT GATE</p>
        <h1>THE GATE IS OPEN</h1>
        <p className="gate-final-count">
          {formatNumber(state.progress)} SIGNALS RECEIVED
        </p>
        <a className="archive-link" href={ARCHIVE_URL}>
          ENTER THE ARCHIVE
        </a>
      </main>
    );
  }

  const buttonLabel = loading
    ? "SYNC"
    : state.can_press
      ? "PRESS"
      : `${secondsLeft}s`;

  return (
    <main className="gate-page">
      <div className="gate-noise" />

      <header className="gate-header">
        <div>
          <p className="gate-kicker">PROJECT GATE</p>
          <p className="gate-status">{error || "STATUS: ACTIVE"}</p>
        </div>
        <div className="decay-label">-5 EVERY 10 MIN</div>
      </header>

      {state.surge_active && (
  <div className="surge-banner">
    <div className="surge-title">
      GLOBAL SIGNAL SURGE
    </div>

    <div className="surge-value">
      ×5 SIGNALS ACTIVE
    </div>
  </div>
)}

      <section className="gate-center">
        <div
          className="gate-progress"
          style={
            {
              "--progress": `${progressPercent * 3.6}deg`,
            } as React.CSSProperties
          }
        >
          <div className="gate-progress-inner">
            <strong>{progressPercent.toFixed(3)}%</strong>
            <span>{formatNumber(state.progress)}</span>
            <small>/ {formatNumber(state.target)}</small>
          </div>
        </div>

        <button
          className={`single-press-button ${pressing ? "is-pressing" : ""}`}
          onClick={press}
          disabled={loading || pressing || !state.can_press || state.gate_open}
        >
          {buttonLabel}
        </button>

        <p key={message} className="gate-message gate-message-appear">
  {message}
</p>

        <p className="gate-rule">ONE SIGNAL PER MINUTE</p>
      </section>

<footer className="gate-footer">
  <div className="gate-goal">
    AFTER 1,000,000 SIGNALS
    <br />
    THE GATE WILL OPEN
  </div>
</footer>
    </main>
  );
}
