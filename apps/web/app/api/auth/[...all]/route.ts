import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@nazariitsubera/core/auth";

export const { GET, POST } = toNextJsHandler(auth);
