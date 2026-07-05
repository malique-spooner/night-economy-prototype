import { Menu } from "./pages/Menu";
import { Portal } from "./pages/Portal";
import { Site } from "./pages/Site";
import { Tv } from "./pages/Tv";

function getRoute(pathname: string) {
  const params = new URLSearchParams(window.location.search);
  const requested = params.get("view");
  if (requested === "tv") return { surface: "tv", slug: "demo-venue" };
  if (requested === "mobile") return { surface: "menu", slug: "demo-venue" };
  if (requested === "portal") return { surface: "app", slug: "demo-venue" };
  if (requested === "site") return { surface: "site", slug: undefined };

  const parts = pathname.split("/").filter(Boolean);
  const [surface, slug] = parts;

  if (surface === "tv") return { surface: "tv", slug };
  if (surface === "menu") return { surface: "menu", slug };
  if (surface === "app") return { surface: "app", slug };
  if (surface === "venue") return { surface: "venue", slug };

  return { surface: "site", slug: undefined };
}

export function App() {
  const route = getRoute(window.location.pathname);

  if (route.surface === "tv") return <Tv venueSlug={route.slug ?? "demo-venue"} />;
  if (route.surface === "menu") return <Menu venueSlug={route.slug ?? "demo-venue"} />;
  if (route.surface === "app") return <Portal venueSlug={route.slug ?? "demo-venue"} />;

  return <Site venueSlug={route.slug ?? "demo-venue"} />;
}
