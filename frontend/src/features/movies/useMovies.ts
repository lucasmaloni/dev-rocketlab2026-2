import { useState, useEffect, useRef, useCallback } from "react";
import { getMovies } from "../../api/movies";
import type { MovieCatalogItem } from "../../types/movieCatalogItem";
import axios from "axios";

export function useMovies(initialPage: number = 1) {
  const [movies, setMovies] = useState<MovieCatalogItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalMovies, setTotalMovies] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchMovies = useCallback(async (page: number) => {
    // Cancela requisição anterior em andamento se houver
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const data = await getMovies(page, controller.signal);
      setMovies(data.items);
      setTotalPages(data.totalPages);
      setTotalMovies(data.total);

    } catch (err: unknown) {
      if (axios.isCancel(err)) {
        return;
      }
      setError(err instanceof Error ? err.message : "Falha ao carregar catálogo.");
    } finally {
      setIsLoading(false);
  }
  }, []);

  useEffect(() => {
    fetchMovies(currentPage);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [currentPage, fetchMovies]);

  const nextPage = () => {
    if (isLoading || currentPage >= totalPages) return;
    setCurrentPage((prev) => prev + 1);
  };

  const prevPage = () => {
    if (isLoading || currentPage <= 1) return;
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToPage = (page: number) => {
    if (isLoading) return;
    const target = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(target);
  };

  return {
    movies,
    currentPage,
    totalPages,
    totalMovies,
    isLoading,
    error,
    nextPage,
    prevPage,
    goToPage,
    refetch: () => fetchMovies(currentPage),
  };
}