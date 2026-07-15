import type { Faction } from "@/lib/types";

type Props = {
  faction: Faction;
  onContinue: () => void;
};

export function AssignedScreen({ faction, onContinue }: Props) {
  return (
    <main className={`assigned-screen faction-${faction}`}>
      <div className="scanlines" />
      <p className="eyebrow">FACTION ASSIGNMENT COMPLETE</p>
      <h1 className="assigned-title">
        YOU ARE <span>{faction.toUpperCase()}</span>
      </h1>
      <p className="assigned-copy">
        Assignment is permanent on this device.
      </p>
      <button className="continue-button" onClick={onContinue}>
        CONTINUE
      </button>
    </main>
  );
}
