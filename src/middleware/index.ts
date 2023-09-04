import { MiddlewareHandler } from "hono";

import { init } from "@paralleldrive/cuid2";

import { ConfigStore } from "fastly:config-store";
import { env } from "fastly:env";

import { createDb } from "../db";
import { Logger } from "fastly:logger";
import { logger } from "hono/logger";

export const dbMiddleware: MiddlewareHandler = async (c, next) => {
  const configStore = new ConfigStore("fhth_config");
  const authToken = await configStore.get("DB_AUTH_TOKEN");
  const url = await configStore.get("DB_URL");

  if (!authToken || !url) {
    return c.text("Missing env", 500);
  }

  c.set(
    "db",
    createDb({
      url,
      authToken,
    })
  );

  return next();
};

export const cuidMiddleware: MiddlewareHandler = async (c, next) => {
  const createdId = init({
    length: 10,
    fingerprint: env("FASTLY_POP"),
  });
  c.set("cuid2", createdId);
  return next();
};

export const loggerMiddleware: MiddlewareHandler = async (c, next) => {
  const l = new Logger("fhth_logger");
  return logger((msg, rest) => l.log(JSON.stringify({ msg, rest })))(c, next);
};
