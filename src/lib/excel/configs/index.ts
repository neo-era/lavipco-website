/**
 * Registry cấu hình import theo entity.
 * Giai đoạn 9.1: rỗng — các prompt 9.2–9.4 đăng ký config từng entity tại đây.
 */
import type { EntityImportConfig } from "../types";
import { blogImportConfig } from "./blog";
import { serviceImportConfig } from "./service";
import { projectImportConfig } from "./project";
import { productImportConfig } from "./product";

export type EntityKey = "products" | "projects" | "services" | "blog";

export const IMPORT_CONFIGS: Partial<Record<EntityKey, EntityImportConfig>> = {
  blog: blogImportConfig,
  services: serviceImportConfig,
  projects: projectImportConfig,
  products: productImportConfig,
};

export function getImportConfig(entity: string): EntityImportConfig | null {
  return IMPORT_CONFIGS[entity as EntityKey] ?? null;
}
