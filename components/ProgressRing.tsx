import { useMemo } from "react";
import { formatNumber } from "@/lib/messages";

type Props = {
  progress: number;
  total: number;
  target: number;
};

export function ProgressRing({ progress, total, target }: Props) {
  const ringStyle = useMemo(
    () => ({
      background: `conic-gradient(var(--faction-color) ${
        progress * 3.6
      }deg, rgba(255,255,255,.08) 0deg)`,
    }),
    [progress],
  );

  return (
    <div className="progress-ring" style={ringStyle}>
      <div className="progress-ring-inner">
        <span className="progress-percent">{progress.toFixed(2)}%</span>
        <span className="progress-label">GATE PROGRESS</span>
        <strong>{formatNumber(total)}</strong>
        <small>/ {formatNumber(target)}</small>
      </div>
    </div>
  );
}
