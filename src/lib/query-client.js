import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
			// 5 min — prevent redundant refetches on tab switches
			staleTime: 5 * 60 * 1000,
			// 30 min — keep cached results in memory well past staleness so
			// navigating between Home/Settings/Guide doesn't trigger refetches
			// for up to half an hour. Default is 5 min (same as staleTime),
			// which drops cache shortly after it goes stale.
			gcTime: 30 * 60 * 1000,
		},
	},
});
