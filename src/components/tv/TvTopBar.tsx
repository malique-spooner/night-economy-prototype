type Props = {
  clock: string;
  sourceLabel: string;
};

export function TvTopBar({ clock, sourceLabel }: Props) {
  return (
    <div className="topbar">
      <div className="brand">Night Economy</div>
      <div className="live-pill">
        <div className="live-dot"></div>
        <span>Market open</span>
      </div>
      <div className="top-right">
        <div className="trade-count">{sourceLabel}</div>
        <div className="clk">{clock}</div>
      </div>
    </div>
  );
}
