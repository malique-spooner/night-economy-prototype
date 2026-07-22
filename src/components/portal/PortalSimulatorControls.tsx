import type { SimulatorCrowd, SimulatorState } from "../../api/simulator";
import { formatMoney } from "../format";

type Props = {
  error: string;
  onControl: (action: "start" | "pause" | "reset") => void;
  onServiceChange: (options: { crowd?: SimulatorCrowd; speed?: number }) => void;
  ready: boolean;
  state: SimulatorState | null;
};

export function PortalSimulatorControls({ error, onControl, onServiceChange, ready, state }: Props) {
  if (!ready) return null;

  const service = state?.service;
  return (
    <section className="portal-simulator-controls">
      <div className="portal-simulator-heading">
        <div>
          <span>Local test service</span>
          <strong>{service?.isComplete ? "Service complete" : service?.running ? "Service running" : "Service paused"}</strong>
        </div>
        <small>{service ? formatTime(service.simulatedTime) : "Connecting…"}</small>
      </div>
      <div className="portal-simulator-metrics">
        <span><b>{state?.totals.salesCount ?? 0}</b> sale lines</span>
        <span><b>{state?.totals.unitsSold ?? 0}</b> drinks sold</span>
        <span><b>{formatMoney(state?.totals.revenueMinor ?? 0)}</b> takings</span>
        <span><b>{state?.recentPublications.length ?? 0}</b> recent price publications</span>
      </div>
      <div className="portal-simulator-actions">
        <button onClick={() => onControl(service?.running ? "pause" : "start")} type="button">
          {service?.running ? "Pause service" : "Start service"}
        </button>
        <label>
          <span>Speed</span>
          <select disabled={!service} onChange={event => onServiceChange({ speed: Number(event.target.value) })} value={String(service?.speed ?? 32)}>
            {[1, 8, 16, 32, 64].map(speed => <option key={speed} value={speed}>{speed}×</option>)}
          </select>
        </label>
        <label>
          <span>Service level</span>
          <select disabled={!service} onChange={event => onServiceChange({ crowd: event.target.value as SimulatorCrowd })} value={service?.crowd ?? "normal"}>
            <option value="quiet">Quiet</option>
            <option value="normal">Normal</option>
            <option value="busy">Busy</option>
          </select>
        </label>
        <button className="portal-simulator-reset" onClick={() => onControl("reset")} type="button">Reset test service</button>
      </div>
      {error && <p className="portal-simulator-error">{error}</p>}
    </section>
  );
}

function formatTime(isoTime: string) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(isoTime));
}
