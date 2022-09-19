// src/utils/trpc.ts
import { createTRPCNext } from "@trpc/next";
import type { AppRouter } from "@sampleforge/api";
import superjson from "superjson";

const getBaseUrl = () => {
  // browser should use relative path
  if (typeof window !== "undefined") {
    return "";
  }

  // reference for vercel.com
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // reference for render.com
  if (process.env.RENDER_INTERNAL_HOSTNAME) {
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;
  }

  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
};

const getUrl = () => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/api/trpc`;
};

export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    const url = getUrl();

    if (typeof window !== "undefined") {
      // during client requests
      return {
        url,
        transformer: superjson,
      };
    }

    // during SSR below
    // optional: use SSG-caching for each rendered page (see caching section for more details)
    const ONE_DAY_SECONDS = 60 * 60 * 24;

    ctx?.res?.setHeader(
      "Cache-Control",
      `s-maxage=1, stale-while-revalidate=${ONE_DAY_SECONDS}`
    );

    return {
      /**
       * If you want to use SSR, you need to use the server's full URL
       * @link https://trpc.io/docs/ssr
       **/
      url,
      transformer: superjson,
      /**
       * @link https://react-query-v3.tanstack.com/reference/QueryClient
       **/
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   **/
  ssr: true,
});
