import type { ReactNode } from "react";

export type PortalTab = "start" | "account";

type Props = {
  activeTab: PortalTab;
  authSlot?: ReactNode;
  liveCount: number;
  onTabChange: (tab: PortalTab) => void;
  onSignOut: () => void;
  totalCount: number;
};

export function PortalSidebar({ activeTab, authSlot, liveCount, onSignOut, onTabChange, totalCount }: Props) {
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
        <button
          className={`portal-nav-item ${activeTab === "start" ? "active" : ""}`}
          onClick={() => onTabChange("start")}
          type="button"
        >
          <span>Start</span>
          <small>Market controls</small>
        </button>
        <button
          className={`portal-nav-item ${activeTab === "account" ? "active" : ""}`}
          onClick={() => onTabChange("account")}
          type="button"
        >
          <span>Account</span>
          <small>Venue settings</small>
        </button>
      </nav>
      {authSlot}
      <div className="portal-sidebar-foot">
        <button className="portal-signout" type="button" onClick={onSignOut}>Sign out</button>
      </div>
    </aside>
  );
}
