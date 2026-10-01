"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Phone, ShieldCheck } from "lucide-react";
import { useMarket } from "./market-provider";
import { api } from "@/lib/api-client";
import { normalizeNepalPhone, safeReturnPath } from "@/lib/listing-input";
import { CaptchaWidget } from "./captcha-widget";
export function LoginScreen() {
  const { t, mode } = useMarket();
  const router = useRouter();
  const params = useSearchParams();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaRevision, setCaptchaRevision] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(value => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  async function send() {
    if (!normalizeNepalPhone(phone)) { setNotice(t("Enter a valid Nepal mobile number.","सही नेपाली मोबाइल नम्बर दिनुहोस्।")); return; }
    if(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY&&!captchaToken){setNotice(t("Complete the verification check first.","पहिले प्रमाणीकरण जाँच पूरा गर्नुहोस्।"));return;}
    setBusy(true); setNotice("");
    try { await api("/api/auth", { action: "send", phone, captchaToken }); setSent(true); setCooldown(60); setNotice(t("Code sent. Check your phone.","कोड पठाइयो। फोन हेर्नुहोस्।")); }
    catch (error) { setNotice(error instanceof Error ? error.message : t("Please try again.","फेरि प्रयास गर्नुहोस्।")); }
    finally { setBusy(false);setCaptchaToken("");setCaptchaRevision(value=>value+1); }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!sent) { await send(); return; }
    setBusy(true); setNotice("");
    try { await api("/api/auth", { action: "verify", phone, code, captchaToken }); router.replace(safeReturnPath(params.get("next"))); router.refresh(); }
    catch (error) { setNotice(error instanceof Error ? error.message : t("Please try again.","फेरि प्रयास गर्नुहोस्।")); }
    finally { setBusy(false); }
  }
  if (mode === "loading") return <main id="main" className="container section"><p>{t("Loading…","खुल्दैछ…")}</p></main>;
  if (mode !== "live") return <main id="main" className="container section empty"><h1>{t("Accounts are not available yet.","खाता अझै उपलब्ध छैन।")}</h1><p>{t("You can explore the preview and create a local draft.","पूर्वावलोकन हेर्न र स्थानीय मस्यौदा बनाउन सकिन्छ।")}</p><Link className="button primary" href="/post">{t("Create a draft","मस्यौदा बनाउनुहोस्")}</Link></main>;
  return <main id="main" className="container section auth-page"><div className="auth-card"><div className="category-icon lavender"><Phone size={25}/></div><div className="eyebrow">{t("A LOCAL CONNECTION","स्थानीय सम्बन्ध")}</div><h1>{t("Welcome to your marketplace.","तपाईंको बजारमा स्वागत छ।")}</h1><p>{t("Sign in with your Nepal mobile number to list, save and contact sellers.","सूची राख्न, सुरक्षित गर्न र विक्रेतासँग सम्पर्क गर्न नेपाली मोबाइलबाट प्रवेश गर्नुहोस्।")}</p><form onSubmit={submit}>
    <div className="form-field"><label htmlFor="phone">{t("Mobile number","मोबाइल नम्बर")}</label><input id="phone" type="tel" autoComplete="tel" placeholder="+977 98XXXXXXXX" value={phone} onChange={event => setPhone(event.target.value)} disabled={sent} maxLength={25} required/></div>
    {sent && <div className="form-field"><label htmlFor="otp">{t("6-digit code","६ अङ्कको कोड")}</label><input id="otp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/\D/g,""))} required/></div>}
    <CaptchaWidget key={captchaRevision} onToken={setCaptchaToken}/>
    {notice && <p className="draft-notice" role="status">{notice}</p>}
    <button className="button primary" disabled={busy}>{busy ? t("Please wait…","पर्खनुहोस्…") : sent ? t("Verify and sign in","प्रमाणित गरी प्रवेश") : t("Send code","कोड पठाउनुहोस्")}<ArrowRight size={16}/></button>
    {sent && <div className="auth-secondary"><button type="button" className="reset-button" onClick={send} disabled={busy || cooldown > 0}>{cooldown ? t("Resend in " + cooldown + "s","पुनः पठाउन " + cooldown + " सेकेन्ड") : t("Resend code","कोड पुनः पठाउनुहोस्")}</button><button type="button" className="reset-button" onClick={() => { setSent(false); setCode(""); }} disabled={busy}>{t("Change number","नम्बर बदल्नुहोस्")}</button></div>}
  </form><div className="contact-guidance"><ShieldCheck size={17}/><p>{t("Phone verification confirms control of a number. It does not verify property ownership or an item's authenticity.","फोन प्रमाणीकरणले नम्बर नियन्त्रण मात्र पुष्टि गर्छ। सम्पत्तिको स्वामित्व वा सामानको वास्तविकता प्रमाणित गर्दैन।")}</p></div></div></main>;
}
