# Betterbuy PRD

## Goal

Help a mobile shopper decide which of two manually entered, comparable offers has the lower cost per size.

## Audience

People comparing two package prices while shopping, without an account or network connection.

## Product flow

On one page, enter Cost and Size for A and B. Betterbuy instantly calculates each cost per size and says which is cheaper. The user may explicitly save a snapshot to local History, restore it, or delete it.

## Calculation contract

All four inputs must be finite numbers greater than zero. Cost per size equals `cost / size`. The saving percentage is `(higher - lower) / higher × 100`. Equal unit costs produce a tie. Users must enter comparable real-world sizes; the product does not store units or convert them.

## Data and privacy

History is stored only in browser `localStorage`, is manually saved, and is limited to 100 newest entries. No account, analytics, tracking, network request, retailer data, or currency data is used.

## Non-goals

Unit conversion, favourites, sharing, barcode scanning, notes, price history, alerts, retailer/delivery data, cloud sync, social features, AI, AR, voice, recommendations, APIs, and vertical-specific features are excluded.

## Acceptance criteria

The app is mobile usable, installable as a PWA, reloads offline after initial visit, correctly calculates wins/ties, and maintains a manually controlled, deletable, capped History.
