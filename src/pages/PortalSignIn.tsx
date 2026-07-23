import { type FormEvent, useEffect, useState } from "react";
import { getCurrentSession, onAuthStateChange, signInWithEmail } from "../api/auth";
import { supabaseStatus } from "../api/client";

type Props = {
  venueSlug: string;
};

export function PortalSignIn({ venueSlug }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const portalHref = `/app/${encodeURIComponent(venueSlug)}`;

  useEffect(() => {
    async function continueIfSignedIn() {
      if (await getCurrentSession()) window.location.replace(portalHref);
    }

    void continueIfSignedIn();
    return onAuthStateChange(() => { void continueIfSignedIn(); });
  }, [portalHref]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      setError("");
      await signInWithEmail(email, password);
      window.location.assign(portalHref);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not sign in. Please try again.");
    }
  }

  return (
    <main className="portal-signin-page">
      <section className="portal-signin-card" aria-labelledby="portal-signin-title">
        <a className="portal-signin-back" href={`/venue/${encodeURIComponent(venueSlug)}`}>← Back to site</a>
        <p className="portal-signin-kicker">Night Economy</p>
        <h1 id="portal-signin-title">Portal sign in</h1>
        <p>Sign in to manage this venue’s menu, live drinks, and pricing limits.</p>
        <form className="portal-signin-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input autoComplete="email" disabled={!supabaseStatus.ready} onChange={event => setEmail(event.target.value)} required type="email" value={email} />
          </label>
          <label>
            <span>Password</span>
            <input autoComplete="current-password" disabled={!supabaseStatus.ready} onChange={event => setPassword(event.target.value)} required type="password" value={password} />
          </label>
          <button disabled={!supabaseStatus.ready} type="submit">Sign in to Portal</button>
        </form>
        <small>{error || (supabaseStatus.ready ? "Use the venue’s shared operator account." : "Portal sign-in is not configured yet.")}</small>
      </section>
    </main>
  );
}
