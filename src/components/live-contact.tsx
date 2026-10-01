"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, MessageCircle, ShieldCheck, Flag } from "lucide-react";
import type { Listing } from "@/lib/market";
import { formatPrice } from "@/lib/market";
import { api } from "@/lib/api-client";
import { useMarket } from "./market-provider";
import { useAccount } from "./use-account";
export function LiveContact({ listing }: { listing: Listing }) {
  const { language, t } = useMarket();
  const { account, loading } = useAccount();
  const router = useRouter();
  const [contact, setContact] = useState<{ phone: string; whatsapp: boolean } | null>(null);
  const [body, setBody] = useState("");
  const [sharePhone, setSharePhone] = useState(false);
  const [reason, setReason] = useState("unavailable");
  const [reportDetail, setReportDetail] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  function signedIn() {
    if (loading) return false;
    if (account) return true;
    router.push("/login?next=" + encodeURIComponent("/listings/" + listing.id));
    return false;
  }
  async function act(operation: () => Promise<void>) {
    if (!signedIn()) return;
    setBusy(true); setNotice("");
    try { await operation(); }
    catch (error) { setNotice(error instanceof Error ? error.message : t("Please try again.","फेरि प्रयास गर्नुहोस्।")); }
    finally { setBusy(false); }
  }
  const phone = contact ? "+" + contact.phone.replace(/\D/g,"") : "";
  return <aside className="contact-panel"><div className="eyebrow">{t("ASKING PRICE","माग गरिएको मूल्य")}</div><div className="detail-price">{formatPrice(listing.pricePaisa,language)}{listing.category==="rent"&&<span>{t("/ month","/ महिना")}</span>}</div>
    <div className="seller-row"><span className="seller-avatar">S</span><div><strong>{listing.sellerRole[language]}</strong><span>{t("Phone verified · Phone control only","फोन प्रमाणित · नम्बर नियन्त्रण मात्र")}</span></div></div>
    {!contact ? <button className="button primary contact-action" disabled={busy || loading} onClick={() => act(async () => { setContact(await api("/api/contact",{id:listing.id})); })}><Phone size={16}/>{t("Show seller contact","विक्रेता सम्पर्क देखाउनुहोस्")}</button> : <div className="contact-options"><a className="button primary" href={"tel:"+phone}><Phone size={16}/>{phone}</a>{contact.whatsapp&&<a className="button secondary" href={"https://wa.me/"+contact.phone.replace(/\D/g,"")+"?text="+encodeURIComponent("Hello, I am interested in "+listing.title[language]+": "+window.location.href)} target="_blank" rel="noopener noreferrer"><MessageCircle size={16}/>WhatsApp</a>}</div>}
    <form className="inquiry-form" onSubmit={event => {event.preventDefault();void act(async () => {await api("/api/inquiries",{id:listing.id,body,sharePhone});setBody("");setNotice(t("Inquiry sent to the seller.","विक्रेतालाई जिज्ञासा पठाइयो।"));});}}>
      <label htmlFor="inquiry">{t("Ask about this listing","सूचीबारे सोध्नुहोस्")}</label><textarea id="inquiry" value={body} onChange={event=>setBody(event.target.value)} minLength={20} maxLength={1000} rows={4} placeholder={t("Ask about availability or arrange an inspection…","उपलब्धता सोध्नुहोस् वा हेर्ने समय मिलाउनुहोस्…")} required/>
      <label className="check-label"><input type="checkbox" checked={sharePhone} onChange={event=>setSharePhone(event.target.checked)}/>{t("Share my verified phone with this seller","यस विक्रेतालाई मेरो प्रमाणित फोन दिनुहोस्")}</label>
      <button className="button secondary" disabled={busy || loading}>{t("Send inquiry","जिज्ञासा पठाउनुहोस्")}</button>
    </form>
    {notice&&<p className="contact-message" role="status">{notice}</p>}
    <div className="contact-guidance"><ShieldCheck size={17}/><p>{t("Phone verification is not an ownership or authenticity guarantee. Inspect and check documents before paying.","फोन प्रमाणीकरण स्वामित्व वा वास्तविकताको ग्यारेन्टी होइन। भुक्तानीअघि जाँच र कागजात हेर्नुहोस्।")}</p></div>
    <details className="report-form"><summary><Flag size={14}/>{t("Report this listing","सूचीको उजुरी गर्नुहोस्")}</summary><form onSubmit={event=>{event.preventDefault();void act(async()=>{await api("/api/reports",{id:listing.id,reason,detail:reportDetail});setReportDetail("");setNotice(t("Report received for review.","उजुरी समीक्षाका लागि प्राप्त भयो।"));});}}><label htmlFor="report-reason">{t("Reason","कारण")}</label><select id="report-reason" value={reason} onChange={event=>setReason(event.target.value)}>{[{value:"unavailable",en:"Unavailable",ne:"अनुपलब्ध"},{value:"misleading",en:"Misleading",ne:"भ्रामक"},{value:"duplicate",en:"Duplicate",ne:"दोहोरो"},{value:"scam",en:"Suspected scam",ne:"ठगीको शङ्का"},{value:"prohibited",en:"Prohibited content",ne:"निषेधित सामग्री"},{value:"privacy",en:"Privacy issue",ne:"गोपनीयता समस्या"}].map(item=><option key={item.value} value={item.value}>{t(item.en,item.ne)}</option>)}</select><label htmlFor="report-detail">{t("Details (optional)","विवरण (ऐच्छिक)")}</label><textarea id="report-detail" value={reportDetail} onChange={event=>setReportDetail(event.target.value)} maxLength={1000} rows={3}/><button className="button secondary" disabled={busy || loading}>{t("Submit report","उजुरी पठाउनुहोस्")}</button></form></details>
  </aside>;
}
