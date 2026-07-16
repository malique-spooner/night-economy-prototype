import { describe, expect, it } from "vitest";
import { createFridayNightSimulation } from "../../pos-simulator/src/fridayNight.mjs";

describe("Friday-night POS simulation", () => {
  it("replays the same service deterministically from the same seed", () => {
    const first = createFridayNightSimulation({ seed: 42 });
    const second = createFridayNightSimulation({ seed: 42 });

    first.advance(300);
    second.advance(300);

    expect(first.getSales()).toEqual(second.getSales());
    expect(first.getSales().length).toBeGreaterThan(0);
  });

  it("accepts a price publication and exposes the new POS price", () => {
    const simulation = createFridayNightSimulation();
    const result = simulation.publishPrices({
      publicationId: "publication_test",
      lines: [{ productId: "pos_cem", newPriceMinor: 1250 }],
    });

    expect(result).toMatchObject({ publicationId: "publication_test", status: "published" });
    expect(simulation.getProducts().find(product => product.id === "pos_cem")).toMatchObject({ currentPriceMinor: 1250 });
  });

  it("stops creating sales for a product marked sold out", () => {
    const simulation = createFridayNightSimulation({ seed: 7 });
    simulation.injectEvent({ type: "sold_out", productId: "pos_cem" });
    simulation.advance(480);

    expect(simulation.getProducts().find(product => product.id === "pos_cem")).toMatchObject({ isAvailable: false });
    expect(simulation.getSales().some(sale => sale.productId === "pos_cem")).toBe(false);
  });

  it("completes the full eight-hour service in fifteen real minutes at 32x", () => {
    const simulation = createFridayNightSimulation({ seed: 9 });
    simulation.control({ action: "start", speed: 32 });
    simulation.tick(15 * 60_000);

    expect(simulation.getState().service).toMatchObject({ isComplete: true, minute: 480, running: false });
    expect(simulation.getSales().length).toBeGreaterThan(0);
  });
});
