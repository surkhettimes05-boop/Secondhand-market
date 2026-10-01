import { Suspense } from "react";
import { LoginScreen } from "@/components/login-screen";
export default function Page() {
  return <Suspense fallback={<main id="main" className="container section"><p>Loading…</p></main>}><LoginScreen/></Suspense>;
}
