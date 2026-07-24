import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AuthRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const session = await getSession();

  let destination = callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
    ? callbackUrl
    : "/refurbished/account";

  // Prevent redirect loops
  if (destination.startsWith("/login") || destination.startsWith("/auth")) {
    destination = "/refurbished/account";
  }

  if (session) {
    redirect(destination);
  } else {
    redirect(`/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`);
  }
}
