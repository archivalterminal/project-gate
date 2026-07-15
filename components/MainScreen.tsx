import type { Faction, GateRow } from "@/lib/types";
import { formatNumber } from "@/lib/messages";
import { ProgressRing } from "@/components/ProgressRing";
import { TeamBars } from "@/components/TeamBars";
import { VoteButton } from "@/components/VoteButton";

type Props = {
  faction: Faction;
  gate: GateRow;
  message: string;
  pressed: boolean;
  hasVoted: boolean;
  loadingGate: boolean;
  databaseError: string;
  onVote: () => void;
};

export function MainScreen(props: Props) {
  const {
    faction,
    gate,
    message,
    pressed,
    hasVoted,
    loadingGate,
    databaseError,
    onVote,
  } = props;

  const total = gate.red + gate.blue;
  const progress =
    gate.target > 0 ? Math.min((total / gate.target) * 100, 100) : 0;

  return (
    <main className={`main-screen faction-${faction}`}>
      <div className="ambient-glow" />
      <div className="scanlines" />

      <header className="topbar">
        <div>
          <p className="eyebrow">PROJECT GATE</p>
          <p className="status-label">
            {databaseError ||
              (loadingGate ? "CONNECTING..." : "STATUS: ACTIVE")}
          </p>
        </div>

        <div className="faction-badge">
          <span className="faction-dot" />
          {faction.toUpperCase()}
        </div>
      </header>

      <section className="hero">
        <ProgressRing progress={progress} total={total} target={gate.target} />
        <TeamBars red={gate.red} blue={gate.blue} />
        <VoteButton
          faction={faction}
          pressed={pressed}
          hasVoted={hasVoted}
          loading={loadingGate}
          gateOpen={gate.gate_open}
          onVote={onVote}
        />
        <p className="system-message">
          {gate.gate_open
            ? `${(gate.winner || "UNKNOWN").toUpperCase()} HAS WON.`
            : hasVoted
              ? "Contribution recorded."
              : message}
        </p>
      </section>

      <footer>
        <span>ONE DEVICE. ONE FACTION.</span>
        <span>TARGET {formatNumber(gate.target)}</span>
      </footer>
    </main>
  );
}
