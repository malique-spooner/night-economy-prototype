const testimonials = [
  ["The menu became something guests actually watched.", "Venue founder, premium cocktail concept", "tone-cream"],
  ["The crash moment is memorable. The controls make it usable.", "Operator, launch partner", "tone-white"],
  ["Spotlights helped us guide demand without scripting the floor.", "Bar manager, hotel group", "tone-green"],
  ["Guests started following the market between rounds.", "Creative director, launch venue", "tone-dark"],
  ["The team understood it in one service.", "General manager, late-night venue", "tone-cream"],
  ["Premium ordering finally felt playful, not gimmicky.", "Hospitality consultant", "tone-white"],
  ["It created a rhythm we usually need staff to manufacture.", "Events lead, members club", "tone-green"],
] as const;

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
            testimonials.map(([quote, author, tone]) => (
              <article className={`site-testimonial-card ${tone}`} key={`${run}-${quote}`}>
                <p>{quote}</p>
                <span>{author}</span>
              </article>
            )),
          )}
        </div>
      </div>
    </section>
  );
}
