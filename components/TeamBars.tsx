import { formatNumber } from "@/lib/messages";

type Props = {
  red: number;
  blue: number;
};

export function TeamBars({ red, blue }: Props) {
  const total = red + blue;
  const redShare = total > 0 ? (red / total) * 100 : 50;
  const blueShare = 100 - redShare;

  return (
    <div className="balance-card">
      <div className="team-row">
        <div className="team-label">
          <span>RED</span>
          <strong>{formatNumber(red)}</strong>
        </div>
        <div className="team-track">
          <span className="team-fill red-fill" style={{ width: `${redShare}%` }} />
        </div>
      </div>

      <div className="team-row">
        <div className="team-label">
          <span>BLUE</span>
          <strong>{formatNumber(blue)}</strong>
        </div>
        <div className="team-track">
          <span className="team-fill blue-fill" style={{ width: `${blueShare}%` }} />
        </div>
      </div>
    </div>
  );
}
