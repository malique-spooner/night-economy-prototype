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
      lines: [{ productId: "pos_tlj_cocktails_classic_espresso", newPriceMinor: 1150 }],
    });

    expect(result).toMatchObject({ publicationId: "publication_test", status: "published" });
    expect(simulation.getProducts().find(product => product.id === "pos_tlj_cocktails_classic_espresso")).toMatchObject({ currentPriceMinor: 1150 });
  });

  it("stops creating sales for a product marked sold out", () => {
    const simulation = createFridayNightSimulation({ seed: 7 });
    simulation.injectEvent({ type: "sold_out", productId: "pos_tlj_cocktails_classic_espresso" });
    simulation.advance(480);

    expect(simulation.getProducts().find(product => product.id === "pos_tlj_cocktails_classic_espresso")).toMatchObject({ isAvailable: false });
    expect(simulation.getSales().some(sale => sale.productId === "pos_tlj_cocktails_classic_espresso")).toBe(false);
  });

  it("completes the full eight-hour service in fifteen real minutes at 32x", () => {
    const simulation = createFridayNightSimulation({ seed: 9 });
    simulation.control({ action: "start", speed: 32 });
    simulation.tick(15 * 60_000);

    expect(simulation.getState().service).toMatchObject({ isComplete: true, minute: 480, running: false });
    expect(simulation.getSales().length).toBeGreaterThan(0);
  });

  it("identifies a fresh reset so the market runner can clear the previous demo service", () => {
    const simulation = createFridayNightSimulation({ seed: 11 });
    simulation.control({ action: "start", speed: 32 });
    simulation.advance(30);
    simulation.control({ action: "reset" });

    expect(simulation.getState().service).toMatchObject({ minute: 0, resetId: 1, running: false });
    expect(simulation.getSales()).toEqual([]);
  });

  it("models a £10k Friday evening with beer as the largest order category", () => {
    const simulation = createFridayNightSimulation({ seed: 20260717 });
    simulation.advance(360);

    const products = simulation.getProducts();
    const sales = simulation.getSales();
    const unitsFor = category => {
      const productIds = new Set(products.filter(product => product.category === category).map(product => product.id));
      return sales.filter(sale => productIds.has(sale.productId)).reduce((total, sale) => total + sale.quantity, 0);
    };

    expect(simulation.getState().totals.revenueMinor).toBeGreaterThanOrEqual(990_000);
    expect(simulation.getState().totals.revenueMinor).toBeLessThanOrEqual(1_010_000);
    expect(unitsFor("Beer")).toBeGreaterThan(unitsFor("Cocktails"));
  });
});
