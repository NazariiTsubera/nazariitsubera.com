import { NextResponse, type NextRequest } from "next/server";

import { routeHost } from "@nazariitsubera/core/hosting";

const ROOTS = [process.env.SITE_ROOT_DOMAIN ?? "nazariitsubera.com", "localhost"];

/** Hostname routing. Vendor hosts are rewritten to the internal /sites route; app hosts pass through. */
export function proxy(request: NextRequest) {
  const route = routeHost(request.headers.get("host"), ROOTS);
  if (route.kind === "app") return NextResponse.next();

  const url = request.nextUrl.clone();
  const path = url.pathname === "/" ? "" : url.pathname;
  url.pathname = route.kind === "site" ? `/sites/${route.slug}${path}` : `/sites/_domain/${route.host}${path}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/|fonts/|sites/|icon\\.svg|favicon\\.ico).*)"],
};
