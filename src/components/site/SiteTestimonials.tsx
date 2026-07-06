import { siteTestimonials } from "../../content/siteContent";

export function SiteTestimonials() {
  return (
    <section id="site-testimonials" className="site-section site-testimonials">
      <div className="site-section-intro">
        <div className="site-kicker">What people say</div>
        <h2>The value is obvious fast.</h2>
      </div>
      <div className="site-testimonial-marquee" aria-label="Testimonial carousel">
        <div className="site-testimonial-track">
          {[0, 1].flatMap(run =>
            siteTestimonials.map(testimonial => (
              <article className={`site-testimonial-card ${testimonial.tone}`} key={`${run}-${testimonial.quote}`}>
                <p>{testimonial.quote}</p>
                <span>{testimonial.author}</span>
              </article>
            )),
          )}
        </div>
      </div>
    </section>
  );
}
