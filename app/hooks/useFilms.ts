import { useQueries } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { StarWarsFilm } from "../data/StarWarsFilm";
import { httpGet } from "../services/https-service";

export function useFilms(filmUrls: string[]) {
  const results = useQueries({
    queries: filmUrls.map((url) => ({
      queryKey: ["film", url],
      queryFn: () => httpGet<StarWarsFilm>(url),
      staleTime: 1000 * 60 * 5, // 5 minutes
    })),
  });

  const films = useMemo(() => {
    return results.filter((r) => r.data != null).map((r) => r.data as StarWarsFilm);
  }, [results]);

  const isLoading = results.some((r) => r.isLoading);
  const error = results.find((r) => r.error)?.error;

  const refetchAll = useCallback(() => {
    return Promise.all(results.map((r) => r.refetch()));
  }, [results]);

  return { films, isLoading, error, refetchAll };
}
