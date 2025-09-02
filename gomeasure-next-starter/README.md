# GoMeasure Next.js Order Flow — Starter

This zip contains a minimal **App Router** scaffold with your **Schedule** step converted to React,
plus placeholders for the other steps. Use it either by (A) dropping the `app/` folder into an existing
Next.js 14/15 project, or (B) creating a fresh Next.js app and copying these files over it.

## Option A: Drop-in
1) Copy the `app/` folder into your Next.js project (replace existing `app/` files if prompted).
2) Ensure you have `app/globals.css` imported by `app/layout.tsx` (already set).
3) Run: `npm run dev` and open `http://localhost:3000/order/schedule`.

## Option B: Fresh project
```bash
npx create-next-app@latest gomeasure-next --ts
cd gomeasure-next
# remove generated app folder and replace with this one
rm -rf app
# copy the 'app' folder from this zip into the project
npm run dev
```

## Pages included
- /order/property (placeholder)
- /order/schedule (your converted UI + logic)
- /order/contact (placeholder)
- /order/review  (placeholder)
- /order/payment (placeholder)
- /order/success (placeholder)

## Notes
- State is handled via a lightweight React Context (`OrderContext.tsx`) and persisted to `sessionStorage`.
- Sensitive logic (pricing, Stripe session creation) should be implemented in **server routes/actions** later.
- Styling tokens live in `app/globals.css`; order-specific styles in `app/order/order.css`.

