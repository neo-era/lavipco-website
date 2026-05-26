/**
 * Auth.js v5 route handler.
 * Tất cả endpoint /api/auth/* (callback, csrf, session, providers...)
 * được Auth.js xử lý tự động qua catch-all này.
 */
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
