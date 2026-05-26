/**
 * Barrel export cho các Zod schema dùng chung & schema theo domain.
 *
 * Quy ước:
 *  - Helper schema dùng chung (email, phone, slug…) ở `./shared.ts`.
 *  - Mỗi domain một file: `auth.ts`, `quote.ts`, `contact.ts`...
 *  - Domain file import helper từ `./shared` (KHÔNG import từ `./index`)
 *    để tránh circular dependency khi bundling.
 */
export * from "./shared";
export * from "./auth";
export * from "./quote";
// export * from "./contact";
// export * from "./product";
