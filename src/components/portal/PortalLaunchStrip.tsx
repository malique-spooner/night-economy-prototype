export function PortalLaunchStrip() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="portal-start-strip">
      <div className="portal-start-head">
        <div>
          <div className="portal-start-kicker">Start</div>
          <h2>Launch window</h2>
        </div>
        <div className="portal-start-status paused">Paused</div>
      </div>
      <div className="portal-start-controls">
        <button className="portal-start-btn paused" type="button">Start</button>
        <label className="portal-launch-control">
          <span>Crash interval</span>
          <select defaultValue="30">
            <option value="15">15 min</option>
            <option value="30">30 min</option>
            <option value="60">60 min</option>
            <option value="120">2 hours</option>
          </select>
        </label>
        <label className="portal-launch-control">
          <span>Date</span>
          <input type="date" defaultValue={today} />
        </label>
        <label className="portal-launch-control">
          <span>Start time</span>
          <input type="time" defaultValue="20:00" />
        </label>
        <label className="portal-launch-control">
          <span>End time</span>
          <input type="time" defaultValue="01:00" />
        </label>
      </div>
    </section>
  );
}
