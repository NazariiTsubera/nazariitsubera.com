import { NextResponse, type NextRequest } from "next/server";

import { routeHost } from "@nazariitsubera/core/hosting";

const ROOTS = [process.env.SITE_ROOT_DOMAIN ?? "nazariitsubera.com", "localhost"];

/** Hostname routing. Vendor hosts are rewritten to the internal /sites route; app hosts pass through. */
export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  // One canonical host for the marketing site. Only the real root domain redirects; on
  // localhost, www is a convenient way to reach the app on the wildcard.
  if (host === `www.${ROOTS[0]}` && ROOTS[0] !== "localhost") {
    const url = request.nextUrl.clone();
    url.host = ROOTS[0];
    return NextResponse.redirect(url, 308);
  }
  const route = routeHost(host, ROOTS);
  if (route.kind === "app") return NextResponse.next();

  const url = request.nextUrl.clone();
  const path = url.pathname === "/" ? "" : url.pathname;
  url.pathname = route.kind === "site" ? `/sites/${route.slug}${path}` : `/sites/_domain/${route.host}${path}`;
  return NextResponse.rewrite(url);
}

// /api/health is exempt: the platform probes it with its own Host header, which must not be
// routed as a vendor site.
export const config = {
  matcher: ["/((?!_next/|fonts/|media/|sites/|api/health|icon\\.svg|favicon\\.ico).*)"],
};
