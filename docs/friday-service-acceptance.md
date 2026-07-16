# Friday Service Acceptance Run

Use this run after applying migrations through `009` and configuring a real Supabase project. It proves the POS boundary and the market loop across one accelerated service.

The deterministic simulator/runner integration suite can run without Supabase credentials:

```bash
npm run simulator:verify
```

## Start the three local processes

```bash
npm run dev
npm run simulator:dev
npm run simulator:market
```

Open:

```text
Night Economy Portal: http://127.0.0.1:5173/app/demo-venue
Night Economy TV:     http://127.0.0.1:5173/tv/demo-venue
POS Simulator:        http://127.0.0.1:3002
```

Set `SUPABASE_SERVICE_ROLE_KEY` only in the terminal that runs `npm run simulator:market`; never expose it to the browser.

## Run the service

1. In the POS Simulator, choose `Normal` and `32x`, then start service.
2. At 20:00 simulated time, trigger a rush. At 00:30, trigger a slowdown. Mark one drink sold out during peak service.
3. Let the simulator reach 02:00. At 32x the full 8-hour service takes 15 real minutes.

## Pass criteria

- The POS Simulator owns every product and records all sales.
- The Portal shows POS name, SKU, and POS price as source data, and only permits market configuration fields to be edited.
- Imported rows appear in `pos_sales_events` without duplicate sale IDs.
- Price publications appear in `price_publications` and `price_publication_lines`.
- Every published market price matches the simulator's current POS price.
- No price crosses its configured floor or ceiling.
- TV and Menu reflect the published Supabase market price after each local market cycle.
