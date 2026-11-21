<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project notes

- Backend: Express + TS + SQLite, cloned at `../qurashi-repo/setup` (GitHub: aliihmal/Qurashi). Run with `npm run dev` there (port 3000); frontend runs on port 3001: `npm run dev -- --port 3001`.
- Backend `.env` lives in `qurashi-repo/setup/.env` (JWT secret, ImageKit keys, PORT/HOST/ORIGIN). CORS origins are hardcoded in `src/index.ts` — must include the frontend origin.
- Auth is cookie-based (`token` + `refreshToken`, httpOnly). Endpoints: `POST /auth/login`, `GET /auth/me` (returns `{authenticated, user:{userId, role}}` only), `POST /auth/logout`, `POST /user/` (signup), `PUT /user/update` (can change role — how admin accounts are made).
- Products: `GET /product/getAllProduct`, `GET /product/get/:id`, `GET /product/GetByCat/:cat`, `GET /product/getProdOnSale`, `POST /product/` (multipart, `image` field REQUIRED), `DELETE /product/deleteProd/:id` (admin). No update endpoint.
- Cart/orders are server-side: `POST /cart/add/:userId {productId, size}` (size must be non-empty; quantity increments per call), `GET /cart/getByUser/:userId`, `POST /order/:userId {ids:[cartIds]}` → returns order id, `GET /cartOrder/getByOrderId/:orderId` for items, `GET /order/getAll` (admin `read:order` perm), `DELETE /order/deleteOrder/:id`.
- Known backend gaps (frontend degrades gracefully): no "my orders" endpoint, no order status/customer fields, no product/category update, no admin stats or customer-list endpoints. `POST /order/:id` has no `authenticate` middleware (security issue to raise with backend owner).
- Verify frontend with `npx tsc --noEmit`, `npm run lint`, `npm run build`.
