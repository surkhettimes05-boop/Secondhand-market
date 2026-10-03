"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { useMarket } from "./market-provider";
import { useAccount } from "./use-account";
type QueueListing = { id: string; category: string; status: string; draft_content: { title: string; description: string; photos: string[]; details: Record<string, unknown>; phonePublic: boolean; role: string } };
type Report = { id: string; listing_id: string; reason: string; detail: string };
type Appeal = { id: string; listing_id: string; body: string };
export function AdminScreen() {
  const { t } = useMarket();
  const { account, loading, error } = useAccount();
  const [listings, setListings] = useState<QueueListing[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    if (!account?.moderator) return;
    try {
      const result = await api<{ listings: QueueListing[]; reports: Report[]; appeals: Appeal[] }>("/api/moderation");
      setListings(result.listings); setReports(result.reports); setAppeals(result.appeals);
    } catch (problem) { setNotice(problem instanceof Error ? problem.message : "Queue unavailable."); }
  }, [account]);
  useEffect(() => { void load(); }, [load]);
  async function decision(id: string, action: string, reason: string) {
    await api("/api/moderation", { id, action, reason });
    await load(); setNotice(t("Decision saved.", "निर्णय सुरक्षित भयो।"));
  }
  if (loading) return <main id="main" className="container section"><p>{t("Loading moderation…", "समीक्षा खुल्दैछ…")}</p></main>;
  if (!account?.moderator) return <main id="main" className="container section empty"><h1>{t("Protected moderator workspace.", "सुरक्षित समीक्षक कार्यक्षेत्र।")}</h1><p>{error || t("An assigned moderator account and authenticator verification are required.", "नियुक्त समीक्षक खाता र प्रमाणीकरण एपको पुष्टि चाहिन्छ।")}</p><Link className="button primary" href="/account">{t("Open account", "खाता खोल्नुहोस्")}</Link></main>;
  return <main id="main" className="container section admin-page"><div className="eyebrow">{t("KEEP THE MARKETPLACE USEFUL", "बजार उपयोगी राख्नुहोस्")}</div><h1>{t("Review with care.", "ध्यानपूर्वक समीक्षा।")}</h1><p>{t("Check accuracy, photos, disclosures and consent. Moderation does not certify legal title.", "शुद्धता, तस्बिर, खुलासा र सहमति जाँच्नुहोस्। समीक्षाले कानुनी स्वामित्व प्रमाणित गर्दैन।")}</p>{notice && <p className="draft-notice" role="status">{notice}</p>}
    <section className="account-panel"><h2>{t("Pending listings", "समीक्षा बाँकी सूची")} ({listings.length})</h2>{listings.map(item => <article className="moderation-card" key={item.id}><h3>{item.draft_content.title}</h3><p>{item.category} · {item.status} · {item.draft_content.role}</p><p>{item.draft_content.description}</p><dl className="cost-list">{Object.entries(item.draft_content.details).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{String(value)}</dd></div>)}</dl><p>{t("Phone publication consent: ", "फोन सार्वजनिक सहमति: ")}{item.draft_content.phonePublic ? t("Yes", "हो") : t("No", "होइन")}</p><div className="draft-photos">{item.draft_content.photos.map(path => <div key={path}><Image src={"/api/media?key=" + encodeURIComponent(path)} alt={t("Submitted listing photo", "पठाइएको सूची तस्बिर")} fill unoptimized sizes="200px" style={{ objectFit: "cover" }}/></div>)}</div><DecisionForm id={item.id} actions={[{ value: "approve", label: t("Approve", "स्वीकृत") }, { value: "changes_requested", label: t("Request changes", "सुधार माग") }, { value: "reject", label: t("Reject", "अस्वीकृत") }]} onDecision={decision}/></article>)}{!listings.length && <p>{t("The review queue is clear.", "समीक्षा सूची खाली छ।")}</p>}</section>
    <section className="account-panel"><h2>{t("Open reports", "खुला उजुरी")} ({reports.length})</h2>{reports.map(item => <article className="moderation-card" key={item.id}><h3>{item.reason}</h3><p>{item.detail}</p><p>{t("Listing: ", "सूची: ")}{item.listing_id}</p><DecisionForm id={item.listing_id} actions={[{ value: "hide", label: t("Hide listing", "सूची लुकाउनुहोस्") }]} onDecision={decision}/><DecisionForm id={item.id} actions={[{ value: "resolved", label: t("Resolve report", "उजुरी समाधान") }, { value: "dismissed", label: t("Dismiss report", "उजुरी खारेज") }]} onDecision={decision}/></article>)}</section>
    <section className="account-panel"><h2>{t("Open appeals", "खुला पुनरावलोकन")} ({appeals.length})</h2>{appeals.map(item => <article className="moderation-card" key={item.id}><p>{item.body}</p><p>{item.listing_id}</p><DecisionForm id={item.listing_id} actions={[{ value: "reinstate", label: t("Reinstate removed listing", "हटाइएको सूची फर्काउनुहोस्") }]} onDecision={decision}/><DecisionForm id={item.id} actions={[{ value: "appeal_resolve", label: t("Record appeal outcome", "पुनरावलोकन नतिजा लेख्नुहोस्") }]} onDecision={decision}/></article>)}</section>
  </main>;
}
function DecisionForm({ id, actions, onDecision }: { id: string; actions: { value: string; label: string }[]; onDecision: (id: string, action: string, reason: string) => Promise<void> }) {
  const { t } = useMarket();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(action: string) {
    setBusy(true); setError("");
    try { await onDecision(id, action, reason); setReason(""); }
    catch (problem) { setError(problem instanceof Error ? problem.message : "Try again."); }
    finally { setBusy(false); }
  }
  return <div className="decision-form"><label>{t("Decision reason", "निर्णयको कारण")}<textarea value={reason} onChange={event => setReason(event.target.value)} minLength={3} maxLength={1000} rows={2}/></label><div className="listing-actions">{actions.map((action, index) => <button className={"button " + (index === 0 ? "primary" : "secondary")} key={action.value} onClick={() => submit(action.value)} disabled={busy || reason.trim().length < 3}>{action.label}</button>)}</div>{error && <p className="form-error" role="alert">{error}</p>}</div>;
}
