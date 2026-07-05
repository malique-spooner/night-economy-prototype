import { formatInputMoney } from "./portalHelpers";

type Props = {
  label: string;
  valueMinor: number;
};

export function PortalMoneyField({ label, valueMinor }: Props) {
  return (
    <label className="portal-money-field">
      <span>{label}</span>
      <div>
        <button type="button">−</button>
        <input type="number" step="0.01" value={formatInputMoney(valueMinor)} readOnly />
        <button type="button">+</button>
      </div>
    </label>
  );
}
