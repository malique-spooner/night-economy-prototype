import { siteProductSlides } from "../../content/siteContent";

export function SiteProductFlow() {
  return (
    <section id="site-decks" className="site-section site-decks">
      <div className="site-section-intro">
        <div className="site-kicker">Product flow</div>
        <h2>Drag through the venue stack.</h2>
        <p>Shuffle through the live room display, guest menu, operator portal, and market event view.</p>
      </div>
      <div className="site-deck-track" data-drag-scroll aria-label="Venue stack carousel">
        {siteProductSlides.map(slide => (
          <DeckSlide tone={slide.tone} src={slide.src} title={slide.title} phone={slide.phone} key={slide.tone} />
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
