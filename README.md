## Ecommerce UI

Next.js 15 storefront and admin dashboard for the e-commerce API. Includes themed storefront, shop filters + search, order tracking, admin product/order/category/content management, featured collection control, and direct-to-Cloudinary uploads.

### Stack
- Next.js 15, React 18, TypeScript
- Tailwind CSS + Radix UI + Framer Motion
- React Query for data fetching

### Setup
1) Install deps  
   ```bash
   pnpm install
   ```
2) Copy `env.template` to `.env.local` and fill values.
3) Run the app  
   ```bash
   pnpm dev
   ```

### Scripts
- `pnpm dev` – start Next.js dev server
- `pnpm build` – production build
- `pnpm start` – run the built app
- `pnpm lint` – Next.js lint rules

### Features
- Storefront with theme loaded server-side to avoid flash
- Product listing with filters and search, product detail with gallery
- Checkout with Kathmandu-only delivery note and order confirmation
- Order tracking page and navbar link
- Admin: products (product-level images), categories, pages, orders (no shipped, delete supported), settings
- Admin: content tab controls hero/featured collection text and collection selection
- Direct Cloudinary uploads for media with signed params from the API

