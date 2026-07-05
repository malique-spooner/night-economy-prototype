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
  return (
    <>
      <PageSwitcher active="site" />
      <section id="siteView" className="alt-view site-view active">
        <div className="site-shell">
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
