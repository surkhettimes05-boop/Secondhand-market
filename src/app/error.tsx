"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main id="main" className="container section empty"><h1>Something went wrong.</h1><p>Your saved preferences stay on this device. Try loading the page again.</p><button className="button primary" onClick={reset}>Try again</button></main>; }
