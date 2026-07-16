import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			refetchOnMount: false,
			retry: 0,
			staleTime: 60 * 1000, // 1 minute — pas de re-fetch si données récentes
			gcTime: 5 * 60 * 1000, // 5 minutes en cache
		},
	},
});