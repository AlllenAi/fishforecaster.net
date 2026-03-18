import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { AccountPageClient } from "./AccountPageClient";

export default async function AccountPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <AccountPageClient
      name={session.user.name || "User"}
      email={session.user.email || ""}
    />
  );
}
