export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { assertBootEnv } = await import("@nazariitsubera/core/env");
    assertBootEnv();
  }
}
