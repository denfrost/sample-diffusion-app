import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { Session } from "next-auth";
import { prisma } from "@sampleforge/db";
import { TRPCError } from "@trpc/server";

/**
 * Replace this with an object if you want to pass things to createContextInner
 */
type CreateContextOptions = {
  session: Session | null;
};

export type ContextUser = {
  id: string;
  email: string;
  name: string;
  role?: string;
};

export type ContextSession = {
  user?: ContextUser;
};

function getContextUser(user: any): ContextUser {
  const { id, email, name, role } = user;

  if (
    typeof id === "string" &&
    typeof email === "string" &&
    typeof name === "string"
  ) {
    return { id, email, name, role };
  }

  // We have a session and session user, but we don't have all
  // three required string fields.
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
  });
}

/**
 * Turns a Session object from NextAuth into a session object to store in our trpc context.
 */
function getContextSession(session: Session | null): ContextSession {
  if (!session || !session.user) {
    // No session or user, so our session is an empty object.
    return {};
  }

  return {
    user: getContextUser(session.user),
  };
}

/** Use this helper for:
 *  - testing, where we dont have to Mock Next.js' req/res
 *  - trpc's `createSSGHelpers` where we don't have req/res
 */
export const createContextInner = async (opts: CreateContextOptions) => {
  return {
    session: getContextSession(opts.session),
    prisma,
  };
};

/**
 * This is the actual context you'll use in your router
 * @link https://trpc.io/docs/context
 **/
export const createContext = async (
  opts: trpcNext.CreateNextContextOptions
) => {
  const { req, res } = opts;

  // const session = await getServerAuthSession({ req, res });
  //
  // return await createContextInner({
  //   session,
  // });

  return {
    prisma,
  };
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
