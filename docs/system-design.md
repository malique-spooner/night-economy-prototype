# Night Economy System Design

Last updated: 2026-06-21

## Purpose

Night Economy runs one market across two surfaces:

- the live board / mobile view
- the till system

The product goal is simple:

- read sales
- decide prices
- publish the same prices to the board and Lightspeed together

## Main Parts

- **Engine**: explains how prices are scored and moved.
- **Lightspeed integration**: explains how Night Economy reads and writes till data.
- **Presentation layer**: handles TV cards, mobile cards, breaking news, and product assets.
- **Portal**: operator controls for floors, ceilings, images, and priority display items.

## Operating Loop

Night Economy uses one shared 2-minute market tick.

Each tick:

1. Pulls the latest sales.
2. Recalculates prices.
3. Clamps prices to guardrails.
4. Saves a snapshot.
5. Publishes the batch to Lightspeed.
6. Updates the board from the same batch.

## Core Data

The product state is built around:

- `venues`
- `pos_connections`
- `pos_products`
- `market_products`
- `market_product_assets`
- `market_price_rules`
- `pos_sales_events`
- `price_publication_jobs`
- `price_publication_lines`
- `market_price_snapshots`
- `market_article_templates`
- `market_article_instances`
- `audit_log`

## Rules

- Every new price must stay between floor and ceiling.
- Priority items are display-only in v1.
- The engine should stay explainable.
- The system should not rely on per-second repricing.
- The board and Lightspeed should always stay in sync.

## Detailed Docs

- Engine v1: [engine-v1.md](./engine-v1.md)
- Lightspeed K-Series: [lightspeed-integration-schema.md](./lightspeed-integration-schema.md)
- POS contract: [pos-integration-contract.md](./pos-integration-contract.md)

## Out of Scope for V1

- self-learning pricing
- stock control
- availability sync
- black-box model behavior
- multiple POS providers at once
