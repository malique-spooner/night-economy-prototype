const SERVICE_MINUTES = 8 * 60;

const defaultProducts = [
  { id: "pos_cem", sku: "COCK-001", name: "Classic Espresso Martini", basePriceMinor: 1200, hourlyDemand: 7.5 },
  { id: "pos_cmar", sku: "COCK-002", name: "Classic Margarita", basePriceMinor: 1200, hourlyDemand: 6.5 },
  { id: "pos_t75", sku: "COCK-003", name: "The 75th Peel", basePriceMinor: 1400, hourlyDemand: 3.2 },
  { id: "pos_wb", sku: "MOCK-001", name: "Woodland Bloom", basePriceMinor: 800, hourlyDemand: 2.2 },
  { id: "pos_negroni", sku: "COCK-004", name: "House Negroni", basePriceMinor: 1250, hourlyDemand: 5.4 },
  { id: "pos_spritz", sku: "COCK-005", name: "Aperitivo Spritz", basePriceMinor: 1050, hourlyDemand: 4.1 },
  { id: "pos_mojito", sku: "COCK-006", name: "Garden Mojito", basePriceMinor: 1100, hourlyDemand: 4.7 },
  { id: "pos_old", sku: "COCK-007", name: "Old Fashioned", basePriceMinor: 1300, hourlyDemand: 3.6 },
  { id: "pos_bloody", sku: "COCK-008", name: "Bloody Mary", basePriceMinor: 1000, hourlyDemand: 1.4 },
];

const demandCurve = [
  [0, 0.22],
  [60, 0.42],
  [120, 0.72],
  [180, 1],
  [240, 1.42],
  [300, 1.62],
  [360, 1.32],
  [420, 0.78],
  [480, 0.18],
];

export function createFridayNightSimulation({ seed = 20260717 } = {}) {
  let random = createRandom(seed);
  let products = cloneProducts();
  let sales = [];
  let publications = [];
  let minute = 0;
  let running = false;
  let speed = 32;
  let crowd = "normal";
  let carryMinutes = 0;
  let rushUntilMinute = 0;
  let slowdownUntilMinute = 0;

  function getState() {
    return {
      service: {
        crowd,
        isComplete: minute >= SERVICE_MINUTES,
        minute,
        running,
        serviceEnd: serviceTime(SERVICE_MINUTES),
        serviceStart: serviceTime(0),
        simulatedTime: serviceTime(minute),
        speed,
      },
      products: products.map(toPublicProduct),
      recentSales: sales.slice(-30).reverse(),
      recentPublications: publications.slice(-10).reverse(),
      totals: {
        salesCount: sales.length,
        unitsSold: sales.reduce((total, sale) => total + sale.quantity, 0),
      },
    };
  }

  function getProducts() {
    return products.map(toPublicProduct);
  }

  function getSales(since) {
    const sinceTime = since ? Date.parse(since) : Number.NEGATIVE_INFINITY;
    return sales.filter(sale => Date.parse(sale.occurredAt) > sinceTime);
  }

  function tick(realElapsedMs) {
    if (!running || minute >= SERVICE_MINUTES) return 0;
    carryMinutes += (realElapsedMs / 60_000) * speed;
    const wholeMinutes = Math.floor(carryMinutes);
    carryMinutes -= wholeMinutes;
    return advance(wholeMinutes);
  }

  function advance(requestedMinutes) {
    const count = Math.max(0, Math.min(requestedMinutes, SERVICE_MINUTES - minute));
    for (let index = 0; index < count; index += 1) generateSalesForMinute(minute++);
    if (minute >= SERVICE_MINUTES) running = false;
    return count;
  }

  function control({ action, crowd: nextCrowd, speed: nextSpeed } = {}) {
    if (action === "start") running = minute < SERVICE_MINUTES;
    if (action === "pause") running = false;
    if (action === "reset") reset();
    if (action === "advance") advance(1);
    if (["quiet", "normal", "busy"].includes(nextCrowd)) crowd = nextCrowd;
    if (Number.isFinite(nextSpeed) && nextSpeed > 0 && nextSpeed <= 240) speed = nextSpeed;
    return getState();
  }

  function injectEvent({ type, productId } = {}) {
    if (type === "rush") rushUntilMinute = Math.max(rushUntilMinute, minute + 30);
    if (type === "slowdown") slowdownUntilMinute = Math.max(slowdownUntilMinute, minute + 30);
    if (type === "sold_out") {
      const product = products.find(item => item.id === productId) ?? products.find(item => item.isAvailable);
      if (!product) throw new Error("No available product to mark sold out");
      product.isAvailable = false;
      product.updatedAt = serviceTime(minute);
    }
    if (!["rush", "slowdown", "sold_out"].includes(type)) throw new Error("Unknown simulator event");
    return getState();
  }

  function publishPrices({ publicationId, lines } = {}) {
    if (!publicationId || !Array.isArray(lines) || !lines.length) throw new Error("publicationId and at least one price line are required");
    const publishedAt = serviceTime(minute);
    const resultLines = lines.map(line => {
      const product = products.find(item => item.id === line.productId);
      if (!product || !Number.isInteger(line.newPriceMinor) || line.newPriceMinor < 0) {
        return { productId: line.productId, status: "failed", message: "Unknown product or invalid price" };
      }

      const oldPriceMinor = product.currentPriceMinor;
      product.currentPriceMinor = line.newPriceMinor;
      product.updatedAt = publishedAt;
      return { productId: product.id, status: "published", oldPriceMinor, newPriceMinor: product.currentPriceMinor };
    });
    const status = resultLines.every(line => line.status === "published")
      ? "published"
      : resultLines.some(line => line.status === "published")
        ? "partial_failure"
        : "failed";
    const publication = { publicationId, status, publishedAt, lines: resultLines };
    publications.push(publication);
    return publication;
  }

  function reset() {
    random = createRandom(seed);
    products = cloneProducts();
    sales = [];
    publications = [];
    minute = 0;
    running = false;
    crowd = "normal";
    speed = 32;
    carryMinutes = 0;
    rushUntilMinute = 0;
    slowdownUntilMinute = 0;
  }

  function generateSalesForMinute(serviceMinute) {
    const level = serviceDemand(serviceMinute) * crowdMultiplier(crowd);
    const eventMultiplier = serviceMinute < rushUntilMinute ? 2.1 : serviceMinute < slowdownUntilMinute ? 0.38 : 1;

    for (const product of products) {
      if (!product.isAvailable) continue;
      const priceRatio = product.currentPriceMinor / product.basePriceMinor;
      const priceMultiplier = Math.max(0.35, 1 - Math.max(0, priceRatio - 1) * 0.65);
      const chance = (product.hourlyDemand * level * eventMultiplier * priceMultiplier) / 60;
      if (random() >= chance) continue;

      const quantity = random() < 0.16 ? 2 : 1;
      sales.push({
        id: `sale_${String(serviceMinute).padStart(3, "0")}_${String(sales.length + 1).padStart(4, "0")}`,
        occurredAt: serviceTime(serviceMinute),
        productId: product.id,
        quantity,
        unitPriceMinor: product.currentPriceMinor,
        currency: "GBP",
      });
    }
  }

  return { advance, control, getProducts, getSales, getState, injectEvent, publishPrices, tick };
}

function cloneProducts() {
  return defaultProducts.map(product => ({
    ...product,
    currentPriceMinor: product.basePriceMinor,
    currency: "GBP",
    isAvailable: true,
    updatedAt: serviceTime(0),
  }));
}

function toPublicProduct(product) {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    basePriceMinor: product.basePriceMinor,
    currentPriceMinor: product.currentPriceMinor,
    currency: product.currency,
    isAvailable: product.isAvailable,
    updatedAt: product.updatedAt,
  };
}

function serviceDemand(minute) {
  for (let index = 1; index < demandCurve.length; index += 1) {
    const [endMinute, endValue] = demandCurve[index];
    const [startMinute, startValue] = demandCurve[index - 1];
    if (minute > endMinute) continue;
    const progress = (minute - startMinute) / (endMinute - startMinute);
    return startValue + (endValue - startValue) * progress;
  }

  return demandCurve.at(-1)[1];
}

function crowdMultiplier(crowd) {
  return { quiet: 0.58, normal: 1, busy: 1.55 }[crowd] ?? 1;
}

function serviceTime(minute) {
  return new Date(Date.UTC(2026, 6, 17, 18, 0) + minute * 60_000).toISOString();
}

function createRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4_294_967_296;
  };
}
