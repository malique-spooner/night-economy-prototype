import { useEffect, useState } from "react";
import { getCurrentSession, onAuthStateChange } from "../api/auth";
import { SiteFooter } from "../components/site/SiteFooter";
import { SiteHero } from "../components/site/SiteHero";
import { SiteMetrics } from "../components/site/SiteMetrics";
import { SiteProductFlow } from "../components/site/SiteProductFlow";
import { SiteSignup } from "../components/site/SiteSignup";
import { SiteTestimonials } from "../components/site/SiteTestimonials";
import { SiteWhy } from "../components/site/SiteWhy";
import { PageSwitcher } from "./PageSwitcher";

type Props = {
  venueSlug: string;
};

export function Site({ venueSlug }: Props) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const portalHref = `/app/${encodeURIComponent(venueSlug)}`;
  const signInHref = `/sign-in/${encodeURIComponent(venueSlug)}`;

  useEffect(() => {
    async function refreshSession() {
      setIsSignedIn(Boolean(await getCurrentSession()));
    }

    void refreshSession();
    return onAuthStateChange(() => { void refreshSession(); });
  }, []);

  return (
    <>
      <PageSwitcher active="site" venueSlug={venueSlug} />
      <section id="siteView" className="alt-view site-view active">
        <div className="site-shell">
          <a className="site-portal-link" href={isSignedIn ? portalHref : signInHref}>Portal</a>
          <SiteHero />
          <SiteWhy />
          <SiteMetrics />
          <SiteProductFlow />
          <SiteTestimonials />
          <SiteSignup />
          <SiteFooter venueSlug={venueSlug} />
        </div>
      </section>
    </>
  );
}
