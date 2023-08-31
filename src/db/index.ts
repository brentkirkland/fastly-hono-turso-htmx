import { createClient } from "@libsql/client/web";

const config = {
  fetch: async (req: Request) => {
    const newReq = new Request(req, { backend: "db" });
    const res = await fetch(newReq);
    return res;
  },
};

export const createDb = ({
  url,
  authToken,
}: {
  url: string;
  authToken: string;
}) =>
  createClient({
    ...config,
    url,
    authToken,
  });
