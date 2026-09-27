import type { MovieCatalogItem } from "./movieCatalogItem";

export interface MovieCatalogResponse {
  items: MovieCatalogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}