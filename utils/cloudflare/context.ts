import { getCloudflareContext } from "@opennextjs/cloudflare";

export type CloudflareBindings = CloudflareEnv;

export function getCloudflareEnv(): CloudflareBindings {
  return getCloudflareContext().env as CloudflareBindings;
}

export function getOptionalCloudflareEnv(): CloudflareBindings | null {
  try {
    return getCloudflareEnv();
  } catch {
    return null;
  }
}

export function hasCloudflareBinding(name: keyof CloudflareBindings) {
  const env = getOptionalCloudflareEnv();
  return Boolean(env && env[name]);
}

export function getRuntimeEnvValue(name: string) {
  const env = getOptionalCloudflareEnv() as Record<string, unknown> | null;
  const fromCloudflareEnv = env?.[name];
  if (typeof fromCloudflareEnv === "string" && fromCloudflareEnv.trim().length > 0) {
    return fromCloudflareEnv.trim();
  }

  const fromProcessEnv = process.env[name];
  if (typeof fromProcessEnv === "string" && fromProcessEnv.trim().length > 0) {
    return fromProcessEnv.trim();
  }

  return "";
}
