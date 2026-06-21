# Lightspeed K-Series Integration

Last updated: 2026-06-21

Night Economy connects to Lightspeed K-Series through three simple data flows:

1. Read the menu items from Lightspeed.
2. Read sales from Lightspeed.
3. Write updated prices back to Lightspeed.

## Operating cycle

Use one shared 2-minute market tick.

- read new sales from Lightspeed
- recalculate Night Economy prices
- update the board
- push the same prices back to Lightspeed

This keeps the board and till in sync without changing prices every few seconds.

## How the data relates

Night Economy owns the market logic.
Lightspeed owns the till.

- Lightspeed item data becomes Night Economy products.
- Night Economy sales rules use Lightspeed sales as input.
- Night Economy price changes get pushed back to Lightspeed.

## Lightspeed endpoints

### Businesses and locations

`GET /o/op/data/businesses`

Gets the businesses and locations available to the access token.

### Menus

`GET /o/op/1/menu/list`

Gets the menus for a business location.

`GET /o/op/2/menu/load/{menuId}`

Gets a single menu with its items and modifiers.

### Items

`GET /items/v1/items`

Gets the items for a business location.

`GET /items/v1/items/{id}`

Gets one item.

`POST /items/v1/items`

Creates an item.

`PUT /items/v1/items/{id}`

Updates an item.

### Sales

`GET /f/v2/business-location/{businessLocationId}/sales`

Gets sales for a date range.

`GET /f/v2/business-location/{businessLocationId}/sales-daily`

Gets sales for one business day.

## What Night Economy needs

- a location ID
- a product list
- item IDs or SKU mappings
- sales data
- price write access

## Working assumption

Assume Lightspeed K-Series for now.
Use a mock connector until the real venue confirms the exact tenant and credentials.

## Simple rule

If Lightspeed can read it, Night Economy can use it.
If Lightspeed can write it, Night Economy can push it.
