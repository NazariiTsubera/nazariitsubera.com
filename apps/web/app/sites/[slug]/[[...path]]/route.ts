import { env } from "@nazariitsubera/core/env";
import { routeHost } from "@nazariitsubera/core/hosting";
import { prismaSiteStore, serveSite } from "@nazariitsubera/core/sites";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string; path?: string[] }> };

export async function GET(request: Request, { params }: Params) {
  const { slug, path = [] } = await params;
  const e = env();

  // Reachable only through the proxy rewrite of a vendor hostname. A direct hit on the apex,
  // /sites/<slug>, is not a vendor site and must not serve one.
  const host = request.headers.get("host");
  if (slug === "_domain" || routeHost(host, [e.SITE_ROOT_DOMAIN, "localhost"]).kind === "app") {
    return new Response("Not found", { status: 404 });
  }

  const result = await serveSite({
    slug,
    path: `/${path.join("/")}`,
    search: new URL(request.url).searchParams,
    store: prismaSiteStore,
    ctx: {
      operatorName: e.OPERATOR_NAME,
      operatorPhone: e.OPERATOR_PHONE,
      claimBaseUrl: `${e.NEXT_PUBLIC_APP_URL}/claim`,
    },
  });
  return new Response(result.body, { status: result.status, headers: result.headers });
}
