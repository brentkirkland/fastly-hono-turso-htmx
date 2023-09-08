import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import { todos } from "../drizzle/schema";

const config = {
  fetch: async (req: Request) => {
    const newReq = new Request(req, { backend: "db" });
    const res = await fetch(newReq);
    return res;
  },
};

export function getClient({
  authToken,
  url,
}: {
  authToken: string;
  url: string;
}) {
  return createClient({
    authToken,
    url,
    ...config,
  });
}

export const createDb = ({
  url,
  authToken,
}: {
  url: string;
  authToken: string;
}) =>
  drizzle(getClient({ url, authToken }), {
    schema: {
      todos,
    },
  });

export type DbClient = ReturnType<typeof createDb>;
