import type { VenueMarketSettings } from "../../engine/types";
import { crashIntervalOptions } from "../../engine/venueSettings";

type Props = {
  onSettingsChange: (patch: Partial<VenueMarketSettings>) => void;
  settings: VenueMarketSettings;
};

export function PortalLaunchStrip({ onSettingsChange, settings }: Props) {
  return (
    <section className="portal-start-strip">
      <div className="portal-start-head">
        <div>
          <div className="portal-start-kicker">Start</div>
          <h2>Launch window</h2>
        </div>
        <div className={`portal-start-status ${settings.marketLive ? "live" : "paused"}`}>
          {settings.marketLive ? "Live" : "Paused"}
        </div>
      </div>
      <div className="portal-start-controls">
        <button
          className={`portal-start-btn ${settings.marketLive ? "live" : "paused"}`}
          onClick={() => onSettingsChange({ marketLive: !settings.marketLive })}
          type="button"
        >
          {settings.marketLive ? "Pause" : "Start"}
        </button>
        <label className="portal-launch-control">
          <span>Crash interval</span>
          <select
            onChange={event => onSettingsChange({ crashIntervalMinutes: Number(event.target.value) as VenueMarketSettings["crashIntervalMinutes"] })}
            value={String(settings.crashIntervalMinutes)}
          >
            {crashIntervalOptions.map(interval => (
              <option key={interval} value={interval}>
                {interval === 120 ? "2 hours" : `${interval} min`}
              </option>
            ))}
          </select>
        </label>
        <label className="portal-launch-control">
          <span>Date</span>
          <input
            onChange={event => onSettingsChange({ launchDate: event.target.value })}
            type="date"
            value={settings.launchDate}
          />
        </label>
        <label className="portal-launch-control">
          <span>Start time</span>
          <input
            onChange={event => onSettingsChange({ launchStartTime: event.target.value })}
            type="time"
            value={settings.launchStartTime}
          />
        </label>
        <label className="portal-launch-control">
          <span>End time</span>
          <input
            onChange={event => onSettingsChange({ launchEndTime: event.target.value })}
            type="time"
            value={settings.launchEndTime}
          />
        </label>
      </div>
    </section>
  );
}
