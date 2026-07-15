import type { Faction } from "@/lib/types";

type Props = {
  faction: Faction;
  pressed: boolean;
  hasVoted: boolean;
  loading: boolean;
  gateOpen: boolean;
  onVote: () => void;
};

export function VoteButton({
  faction,
  pressed,
  hasVoted,
  loading,
  gateOpen,
  onVote,
}: Props) {
  const disabled = hasVoted || pressed || loading || gateOpen;

let buttonText = "PRESS";

if (loading) buttonText = "SYNC";
if (gateOpen) buttonText = "OPEN";
if (hasVoted) buttonText = "LOCKED";

  return (
    <div
      className={[
        "vote-control",
        `vote-control-${faction}`,
        pressed ? "is-pressed" : "",
        hasVoted ? "is-recorded" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="vote-orbit vote-orbit-one" />
      <span className="vote-orbit vote-orbit-two" />

      <button
        type="button"
        className="press-button"
        onClick={onVote}
        disabled={disabled}
      >
        {buttonText}
      </button>

      <span className="vote-pulse vote-pulse-one" />
      <span className="vote-pulse vote-pulse-two" />
    </div>
  );
}