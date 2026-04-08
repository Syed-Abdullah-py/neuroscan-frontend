import { redirect } from "next/navigation";

// Middleware handles all routing from "/" before this runs.
// This is a safety net only.
export default function RootPage() {
  redirect("/about-product");
}