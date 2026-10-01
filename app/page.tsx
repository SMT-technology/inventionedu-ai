import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { stageHref } from "@/lib/stages";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "teacher") {
    redirect("/dashboard");
  }

  redirect(stageHref(1));
}
