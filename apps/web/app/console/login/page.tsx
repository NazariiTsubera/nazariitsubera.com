import { redirect } from "next/navigation";

import { getOperator } from "@/lib/operator";
import { LoginForm } from "@/components/console/LoginForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "Console sign in", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await getOperator()) redirect("/console");
  return <LoginForm />;
}
