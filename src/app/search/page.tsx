import { Suspense } from "react";
import { SearchScreen } from "@/components/search-screen";
export default function Page() { return <Suspense fallback={<main id="main" className="container section"><p>Loading listings…</p></main>}><SearchScreen /></Suspense>; }
