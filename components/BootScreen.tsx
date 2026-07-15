type Props = { bootLine: string };

export function BootScreen({ bootLine }: Props) {
  return (
    <main className="boot-screen">
      <div className="scanlines" />
      <p className="eyebrow">PROJECT GATE // ACTIVE</p>
      <h1>PROJECT GATE</h1>
      <p className="boot-line">
        <span className="status-dot" />
        {bootLine}
      </p>
    </main>
  );
}
