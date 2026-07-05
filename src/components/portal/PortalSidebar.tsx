type Props = {
  liveCount: number;
  totalCount: number;
};

export function PortalSidebar({ liveCount, totalCount }: Props) {
  return (
    <aside className="portal-sidebar">
      <div className="portal-sidebar-brand">
        <div className="portal-sidebar-kicker">Night Economy</div>
        <strong>Night Economy</strong>
      </div>
      <div className="portal-sidebar-stat">
        <span>Products live</span>
        <strong>{liveCount}/{totalCount}</strong>
      </div>
      <nav className="portal-nav" aria-label="Portal sections">
        <button className="portal-nav-item active" type="button">
          <span>Start</span>
          <small>Market controls</small>
        </button>
        <button className="portal-nav-item" type="button">
          <span>Account</span>
          <small>Venue settings</small>
        </button>
      </nav>
      <div className="portal-sidebar-foot">
        <button className="portal-signout" type="button">Sign out</button>
      </div>
    </aside>
  );
}
