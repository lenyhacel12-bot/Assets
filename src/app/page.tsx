import { redirect } from "next/navigation";

/** Landing route → send users into the app shell. Middleware enforces auth. */
export default function RootPage() {
  redirect("/dashboard");
}
