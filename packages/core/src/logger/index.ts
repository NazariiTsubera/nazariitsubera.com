type Fields = Record<string, unknown>;
type Level = "info" | "warn" | "error";

function serialize(fields: Fields): Fields {
  const out: Fields = {};
  for (const [k, v] of Object.entries(fields)) {
    out[k] = v instanceof Error ? { message: v.message, stack: v.stack } : v;
  }
  return out;
}

function write(level: Level, base: Fields, fields: Fields, msg: string): void {
  const line = JSON.stringify({ level, time: new Date().toISOString(), msg, ...base, ...serialize(fields) });
  (level === "error" ? console.error : level === "warn" ? console.warn : console.log)(line);
}

export type Logger = {
  info: (fields: Fields, msg: string) => void;
  warn: (fields: Fields, msg: string) => void;
  error: (fields: Fields, msg: string) => void;
  child: (extra: Fields) => Logger;
};

/** One JSON object per line on stdout or stderr. No dependencies. */
export function createLogger(base: Fields = {}): Logger {
  return {
    info: (fields, msg) => write("info", base, fields, msg),
    warn: (fields, msg) => write("warn", base, fields, msg),
    error: (fields, msg) => write("error", base, fields, msg),
    child: (extra) => createLogger({ ...base, ...extra }),
  };
}

export const log = createLogger();
