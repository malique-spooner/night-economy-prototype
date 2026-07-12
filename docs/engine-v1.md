# Night Economy Engine V1

Last updated: 2026-06-21

## Goal

V1 should maximize sales with explainable logic.

No self-learning yet.

## Inputs

The engine uses four pricing signals:

- sales velocity
- current price
- floor / ceiling
- time of night

## What the engine does

Every 2 minutes, the engine:

1. Reads the latest sales.
2. Scores each drink.
3. Decides whether the price should move up, down, or hold.
4. Clamps the result to the drink's floor and ceiling.
5. Publishes the new price to Lightspeed and the board together.

## Pricing logic

- Strong sales velocity can push the price up.
- Weak sales velocity can pull the price down or keep it flat.
- Current price acts as the starting point.
- Floor and ceiling protect the business from bad moves.
- Time of night changes how aggressive the move should be.

## Priority items

Priority items are drinks we want to feature more prominently.

The portal allows up to 10 priority items.

Those items also power the presentation layer:

- the top 10 priority items appear in the breaking news section
- the top 3 priority items appear as TV priority cards
- priority does not change the price in V1

## What we do not need in V1

- self-learning
- black-box model behavior
- per-second repricing
- margin-based optimization as the main objective

## Short version

Night Economy V1 is a rule-based sales engine:

- use demand to steer price
- keep every move explainable
- keep the board and Lightspeed in sync

## Verification

```bash
npm run test -- src/engine/pricing.test.ts
npm run pricing:sync
```

`npm run pricing:sync` checks that the Supabase `market-cycle` Edge Function still matches the frontend pricing thresholds and reason text while the function remains self-contained for Deno.
