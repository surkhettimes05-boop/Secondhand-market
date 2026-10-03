import Link from "next/link";
export default function NotFound() { return <main id="main" className="container section empty"><h1>This listing is unavailable.</h1><p>Explore the current sample inventory instead.</p><Link className="button primary" href="/search">Browse listings</Link></main>; }
