const slides = [
  ["display", "./?view=tv", "Night Economy TV view preview", false],
  ["mobile", "./?view=mobile", "Night Economy mobile view preview", true],
  ["portal", "./?view=portal", "Night Economy portal preview", false],
  ["event", "./?view=tv&mode=crash", "Night Economy crash preview", false],
] as const;

export function SiteProductFlow() {
  return (
    <section id="site-decks" className="site-section site-decks">
      <div className="site-section-intro">
        <div className="site-kicker">Product flow</div>
        <h2>Drag through the venue stack.</h2>
        <p>Shuffle through the live room display, guest menu, operator portal, and market event view.</p>
      </div>
      <div className="site-deck-track" data-drag-scroll aria-label="Venue stack carousel">
        {slides.map(([tone, src, title, phone]) => (
          <DeckSlide tone={tone} src={src} title={title} phone={phone} key={tone} />
        ))}
      </div>
    </section>
  );
}

function DeckSlide({ tone, src, title, phone = false }: { tone: string; src: string; title: string; phone?: boolean }) {
  return (
    <article className={`site-deck-slide tone-${tone}`}>
      <div className={`site-deck-screen site-deck-preview ${phone ? "phone" : ""}`}>
        <iframe src={src} title={title} loading="lazy"></iframe>
      </div>
    </article>
  );
}
