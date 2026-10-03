import { Suspense } from "react";
import { PostScreen } from "@/components/post-screen";
export default function Page(){return <Suspense fallback={<main id="main" className="container section"><p>Loading…</p></main>}><PostScreen/></Suspense>;}
