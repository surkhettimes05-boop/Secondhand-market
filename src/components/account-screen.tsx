"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { useMarket } from "./market-provider";
import { useAccount } from "./use-account";
import { MfaPanel } from "./mfa-panel";
type MyListing={id:string;category:string;status:string;review_status:string;review_note:string|null;draft_content:{title?:string};expires_at:string|null};
type Inquiry={id:string;title:string;body:string;received:boolean;createdAt:string;senderPhone:string|null};
type Notice={id:string;kind:string;body:string;read_at:string|null};
export function AccountScreen(){
 const {t,mode,reloadCatalog}=useMarket();
 const {account,loading,error,reload}=useAccount();
 const [listings,setListings]=useState<MyListing[]>([]);
 const [inquiries,setInquiries]=useState<Inquiry[]>([]);
 const [notifications,setNotifications]=useState<Notice[]>([]);
 const [notice,setNotice]=useState("");
 const [busy,setBusy]=useState(false);
 const [appealId,setAppealId]=useState("");
 const [appealBody,setAppealBody]=useState("");
 const load=useCallback(async()=>{
  if(!account)return;
  try{const [items,messages,alerts]=await Promise.all([api<{listings:MyListing[]}>("/api/listings"),api<{inquiries:Inquiry[]}>("/api/inquiries"),api<{notifications:Notice[]}>("/api/notifications")]);setListings(items.listings);setInquiries(messages.inquiries);setNotifications(alerts.notifications);}
  catch(problem){setNotice(problem instanceof Error?problem.message:"Account data unavailable.");}
 },[account]);
 useEffect(()=>{void load();},[load]);
 async function action(id:string,action:string){
  setBusy(true);setNotice("");
  try{await api("/api/listings/action",{id,action});await load();reloadCatalog();setNotice(t("Listing updated.","सूची अद्यावधिक भयो।"));}
  catch(problem){setNotice(problem instanceof Error?problem.message:"Try again.");}finally{setBusy(false);}
 }
 if(loading)return <main id="main" className="container section"><p>{t("Loading account…","खाता खुल्दैछ…")}</p></main>;
 if(!account)return <main id="main" className="container section empty"><h1>{t("Your local marketplace account.","तपाईंको स्थानीय बजार खाता।")}</h1><p>{error||t("Sign in to manage listings and inquiries.","सूची र जिज्ञासा व्यवस्थापन गर्न प्रवेश गर्नुहोस्।")}</p><Link className="button primary" href={mode==="live"?"/login?next=%2Faccount":"/post"}>{mode==="live"?t("Sign in","प्रवेश"):t("Try a local draft","स्थानीय मस्यौदा")}</Link></main>;
 const stateLabels:Record<string,string>={draft:t("Draft","मस्यौदा"),pending:t("Pending review","समीक्षा बाँकी"),published:t("Published","प्रकाशित"),paused:t("Paused","रोकिएको"),expired:t("Expired","म्याद सकिएको"),sold:t("Sold","बिक्री भयो"),rented:t("Rented","भाडामा गयो"),withdrawn:t("Withdrawn","फिर्ता"),removed:t("Removed","हटाइएको"),changes_requested:t("Changes requested","सुधार चाहिएको"),rejected:t("Rejected","अस्वीकृत")};
 return <main id="main" className="container section account-page"><div className="section-heading"><div><div className="eyebrow">{t("YOUR MARKETPLACE","तपाईंको बजार")}</div><h1>{t("Make room for what's next.","अर्को सुरुवातका लागि ठाउँ बनाउनुहोस्।")}</h1><p>{account.user.phone}</p></div><div className="detail-actions"><Link className="button primary" href="/post">{t("Post a listing","सूची राख्नुहोस्")}</Link><button className="button secondary" onClick={async()=>{try{await api("/api/auth",{action:"signout"});window.location.assign("/");}catch(problem){setNotice(problem instanceof Error?problem.message:"Sign out failed.");}}}>{t("Sign out","बाहिर")}</button></div></div>
 {account.member&&!account.moderator&&<MfaPanel onVerified={reload}/>}
 {account.moderator&&<p><Link className="button secondary" href="/admin">{t("Open moderation","समीक्षा खोल्नुहोस्")}</Link></p>}
 {notice&&<p className="draft-notice" role="status">{notice}</p>}
 <section className="account-panel"><h2>{t("Your listings","तपाईंका सूची")}</h2>{listings.length===0?<p>{t("Your first listing starts with a few useful details.","पहिलो सूची केही उपयोगी विवरणबाट सुरु हुन्छ।")}</p>:listings.map(item=><article className="account-listing" key={item.id}><div><h3>{item.draft_content.title||t("Untitled draft","शीर्षक नभएको मस्यौदा")}</h3><p>{stateLabels[item.status]||item.status}{item.review_status!=="none"&&" · "+(stateLabels[item.review_status]||item.review_status)}</p>{item.expires_at&&<p>{t("Expires: ","म्याद: ")}{new Date(item.expires_at).toLocaleDateString(languageLocale(t),{timeZone:"Asia/Kathmandu"})}</p>}{item.review_note&&<p className="review-note">{item.review_note}</p>}</div><div className="listing-actions">
 {!["sold","rented","withdrawn","removed"].includes(item.status)&&item.review_status!=="pending"&&<Link className="button secondary" href={"/post?id="+item.id}>{t("Edit draft","मस्यौदा सम्पादन")}</Link>}
 {item.status==="published"&&<><button className="button secondary" disabled={busy} onClick={()=>action(item.id,"revoke_contact")}>{t("Stop phone contact","फोन सम्पर्क रोक्नुहोस्")}</button><button className="button secondary" disabled={busy} onClick={()=>action(item.id,"renew")}>{t("Confirm availability","उपलब्धता पुष्टि")}</button><button className="button secondary" disabled={busy} onClick={()=>action(item.id,"pause")}>{t("Pause","रोक्नुहोस्")}</button></>}
 {item.status==="paused"&&<button className="button secondary" disabled={busy} onClick={()=>action(item.id,"resume")}>{t("Resume","फेरि सुरु")}</button>}
 {["published","paused","expired"].includes(item.status)&&<button className="button secondary" disabled={busy} onClick={()=>action(item.id,item.category==="rent"?"rented":"sold")}>{item.category==="rent"?t("Mark rented","भाडामा गएको चिन्ह"):t("Mark sold","बिक्री भएको चिन्ह")}</button>}
 {!["sold","rented","withdrawn","removed"].includes(item.status)&&<button className="button secondary" disabled={busy} onClick={()=>action(item.id,"withdrawn")}>{t("Withdraw","फिर्ता")}</button>}
 {(item.status==="removed"||["rejected","changes_requested"].includes(item.review_status))&&<button className="button secondary" onClick={()=>setAppealId(item.id)}>{t("Appeal decision","निर्णयको पुनरावलोकन")}</button>}
 </div></article>)}</section>
 {appealId&&<section className="account-panel"><h2>{t("Explain your appeal","पुनरावलोकनको कारण")}</h2><form onSubmit={async event=>{event.preventDefault();setBusy(true);try{await api("/api/appeals",{id:appealId,body:appealBody});setAppealId("");setAppealBody("");setNotice(t("Appeal submitted.","पुनरावलोकन पठाइयो।"));}catch(problem){setNotice(problem instanceof Error?problem.message:"Try again.");}finally{setBusy(false);}}}><div className="form-field"><label htmlFor="appeal">{t("Appeal details","पुनरावलोकन विवरण")}</label><textarea id="appeal" value={appealBody} onChange={event=>setAppealBody(event.target.value)} minLength={20} maxLength={1000} required/></div><button className="button primary" disabled={busy}>{t("Submit appeal","पुनरावलोकन पठाउनुहोस्")}</button></form></section>}
 <div className="account-columns"><section className="account-panel"><h2>{t("Inquiries","जिज्ञासा")}</h2>{inquiries.length?inquiries.map(item=><article className="inbox-message" key={item.id}><span className="sample-note">{item.received?t("Received","प्राप्त"):t("Sent","पठाइएको")}</span><h3>{item.title}</h3><p>{item.body}</p>{item.senderPhone&&<a className="text-link" href={"tel:+"+item.senderPhone.replace(/\D/g,"")}>{t("Sender shared phone: ","पठाउनेले दिएको फोन: ")}{item.senderPhone}</a>}</article>):<p>{t("No inquiries yet.","अझै जिज्ञासा छैन।")}</p>}</section><section className="account-panel"><h2>{t("Updates","अद्यावधिक")}</h2>{notifications.length?notifications.map(item=><article className="inbox-message" key={item.id}><h3>{item.kind.replaceAll("_"," ")}</h3><p>{item.body}</p>{!item.read_at&&<button className="reset-button" onClick={async()=>{try{await api("/api/notifications",{id:item.id});await load();}catch(problem){setNotice(problem instanceof Error?problem.message:"Try again.");}}}>{t("Mark read","पढिएको चिन्ह")}</button>}</article>):<p>{t("No updates yet.","अझै अद्यावधिक छैन।")}</p>}</section></div></main>;
}
function languageLocale(t:(en:string,ne:string)=>string){return t("en-GB","ne-NP");}
