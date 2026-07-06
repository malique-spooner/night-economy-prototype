export const siteHero = {
  kicker: "Night Economy",
  title: "Turn your menu into a live market.",
  copy: "Live pricing for bars and venues: a room display, guest menu, and operator portal that move together.",
  stats: ["Live index +12.4%", "Volume 1,840 orders", "Volatility controlled"],
  footnote: "Built for bars, hotels, members clubs, and hospitality groups",
} as const;

export const siteReasons = [
  {
    number: "01",
    title: "Instantly legible",
    copy: "Big prices and clear movement make the board readable from across the bar.",
  },
  {
    number: "02",
    title: "Calm under pressure",
    copy: "Guardrails keep the game lively without letting prices run away.",
  },
  {
    number: "03",
    title: "Guides demand, not just price",
    copy: "Spotlights and events help move guests toward the right drinks at the right time.",
  },
] as const;

export const siteMetrics = [
  {
    tone: "room",
    value: "3",
    label: "Connected surfaces",
    copy: "The board, menu, and portal share one live market state.",
  },
  {
    tone: "guest",
    value: "1,840+",
    label: "Orders shaped by demand",
    copy: "Guests react to movement, not a static list.",
  },
  {
    tone: "ops",
    value: "+12%",
    label: "Market lift without chaos",
    copy: "Pricing rules and event controls keep the floor safe.",
  },
] as const;

export const siteProductSlides = [
  { tone: "display", src: "./?view=tv", title: "Night Economy TV view preview", phone: false },
  { tone: "mobile", src: "./?view=mobile", title: "Night Economy mobile view preview", phone: true },
  { tone: "portal", src: "./?view=portal", title: "Night Economy portal preview", phone: false },
  { tone: "event", src: "./?view=tv&mode=crash", title: "Night Economy crash preview", phone: false },
] as const;

export const sitePlans = [
  { id: "starter", name: "Starter", copy: "Pilot venue" },
  { id: "growth", name: "Growth", copy: "Live venue" },
  { id: "premium", name: "Premium", copy: "Group rollout" },
] as const;

export const defaultSitePlanId = "growth";

export const siteTestimonials = [
  {
    quote: "The menu became something guests actually watched.",
    author: "Venue founder, premium cocktail concept",
    tone: "tone-cream",
  },
  {
    quote: "The crash moment is memorable. The controls make it usable.",
    author: "Operator, launch partner",
    tone: "tone-white",
  },
  {
    quote: "Spotlights helped us guide demand without scripting the floor.",
    author: "Bar manager, hotel group",
    tone: "tone-green",
  },
  {
    quote: "Guests started following the market between rounds.",
    author: "Creative director, launch venue",
    tone: "tone-dark",
  },
  {
    quote: "The team understood it in one service.",
    author: "General manager, late-night venue",
    tone: "tone-cream",
  },
  {
    quote: "Premium ordering finally felt playful, not gimmicky.",
    author: "Hospitality consultant",
    tone: "tone-white",
  },
  {
    quote: "It created a rhythm we usually need staff to manufacture.",
    author: "Events lead, members club",
    tone: "tone-green",
  },
] as const;
