import type { FormEvent } from "react";

type Props = {
  email: string;
  error: string;
  isConfigured: boolean;
  isSignedIn: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSignIn: () => void;
  onSignOut: () => void;
  password: string;
  statusMessage: string;
};

export function PortalAuthPanel({
  email,
  error,
  isConfigured,
  isSignedIn,
  onEmailChange,
  onPasswordChange,
  onSignIn,
  onSignOut,
  password,
  statusMessage,
}: Props) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSignIn();
  }

  return (
    <div className="portal-plan-card">
      <span>{isConfigured ? "Portal access" : "Demo mode"}</span>
      <strong>{isSignedIn ? "Signed in" : "Operator sign in"}</strong>
      {isSignedIn ? (
        <button className="portal-signout" type="button" onClick={onSignOut}>Sign out</button>
      ) : (
        <form className="portal-auth-form" onSubmit={handleSubmit}>
          <input
            autoComplete="email"
            disabled={!isConfigured}
            onChange={event => onEmailChange(event.target.value)}
            placeholder="Email"
            type="email"
            value={email}
          />
          <input
            autoComplete="current-password"
            disabled={!isConfigured}
            onChange={event => onPasswordChange(event.target.value)}
            placeholder="Password"
            type="password"
            value={password}
          />
          <button disabled={!isConfigured} type="submit">Sign in</button>
        </form>
      )}
      <small>{error || statusMessage}</small>
    </div>
  );
}
