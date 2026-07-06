import { Menu } from "./pages/Menu";
import { Portal } from "./pages/Portal";
import { Site } from "./pages/Site";
import { Tv } from "./pages/Tv";
import { resolveAppRoute } from "./routes";

export function App() {
  const route = resolveAppRoute(window.location.pathname, window.location.search);

  if (route.surface === "tv") return <Tv venueSlug={route.slug ?? "demo-venue"} />;
  if (route.surface === "menu") return <Menu venueSlug={route.slug ?? "demo-venue"} />;
  if (route.surface === "app") return <Portal venueSlug={route.slug ?? "demo-venue"} />;

  return <Site venueSlug={route.slug ?? "demo-venue"} />;
}
