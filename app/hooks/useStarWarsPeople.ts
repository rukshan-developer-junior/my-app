import NetInfo from "@react-native-community/netinfo";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { StarWarsPerson } from "../data/StarWarsPerson";
import { httpGet } from "../services/https-service";

/** Raw API response: body has `data` as a JSON string */
interface PeopleApiRawResponse {
  data: string;
  status?: number;
  url?: string;
}

/** Parsed payload from the `data` string */
export interface PeoplePage {
  count: number;
  next: string | null;
  previous: string | null;
  results: StarWarsPerson[];
}

function parsePeopleResponse(raw: PeopleApiRawResponse | PeoplePage): PeoplePage {
  // API may return { data: "<json string>", status, url } or direct { count, next, results }
  const parsed =
    typeof (raw as PeopleApiRawResponse).data === "string"
      ? (JSON.parse((raw as PeopleApiRawResponse).data) as PeoplePage)
      : (raw as PeoplePage);
  if (parsed && Array.isArray(parsed.results)) {
    return parsed;
  }
  throw new Error("Invalid people API response");
}

function getPageFromNext(next: string | null): number | undefined {
  if (!next) return undefined;
  const match = next.match(/[?&]page=(\d+)/);
  return match ? parseInt(match[1], 10) : undefined;
}

export function useStarWarsPeople() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const infinite = useInfiniteQuery<PeoplePage, Error>({
    queryKey: ["starwars-people"],
    queryFn: async ({ pageParam }) => {
      try {
        const raw = await httpGet<PeopleApiRawResponse>("people", {
          params: { page: pageParam ?? 1 },
        });
        return parsePeopleResponse(raw);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load characters.";
        throw new Error(message);
      }
    },
    initialPageParam: 1 as number | undefined,
    getNextPageParam: (lastPage) => (lastPage.next ? getPageFromNext(lastPage.next) : undefined),
    enabled: isOnline,
    retry: 2,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const apiPeople = useMemo(
    () => infinite.data?.pages?.flatMap((p) => p.results) ?? [],
    [infinite.data?.pages]
  );

  return {
    data: apiPeople,
    isLoading: infinite.isLoading,
    isFetching: infinite.isFetching,
    isFetchingNextPage: infinite.isFetchingNextPage,
    error: infinite.error,
    refetch: infinite.refetch,
    fetchNextPage: infinite.fetchNextPage,
    hasNextPage: infinite.hasNextPage,
  };
}
