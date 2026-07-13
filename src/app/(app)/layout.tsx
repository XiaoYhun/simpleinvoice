import { redirect } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { getSession } from "@/lib/server/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader username={session.username} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
