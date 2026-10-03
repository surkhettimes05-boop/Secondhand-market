"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api-client";
import { useMarket } from "./market-provider";
export function MfaPanel({ onVerified }: { onVerified: () => void }) {
  const { t } = useMarket();
  const [factorId, setFactorId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [setupKey, setSetupKey] = useState("");
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailReady, setEmailReady] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api<{ emailReady: boolean; factors: { id: string }[] }>("/api/auth/mfa")
      .then(result => { setEmailReady(result.emailReady); setFactorId(result.factors[0]?.id || ""); setLoaded(true); })
      .catch(error => setNotice(error.message));
  }, []);
  async function verifyEmail(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setNotice("");
    try {
      await api("/api/auth/mfa", emailSent ? { action: "email_verify", email, code: emailCode } : { action: "email_send", email });
      if (emailSent) { setEmailReady(true); setEmailCode(""); setNotice(t("Moderator email verified.","समीक्षक इमेल प्रमाणित भयो।")); }
      else { setEmailSent(true); setNotice(t("Check your email for the verification code.","प्रमाणीकरण कोडका लागि इमेल हेर्नुहोस्।")); }
    } catch (error) { setNotice(error instanceof Error ? error.message : "Try again."); }
    finally { setBusy(false); }
  }
  async function enroll() {
    setBusy(true); setNotice("");
    try {
      const result = await api<{ factorId: string; qrCode: string; setupKey: string }>("/api/auth/mfa", { action: "enroll" });
      setFactorId(result.factorId); setQrCode(result.qrCode); setSetupKey(result.setupKey);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Try again."); }
    finally { setBusy(false); }
  }
  async function verify(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setNotice("");
    try {
      await api("/api/auth/mfa", { action: "verify", factorId, code });
      setQrCode(""); setSetupKey(""); setCode(""); onVerified();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Try again."); }
    finally { setBusy(false); }
  }
  return <section className="account-panel">
    <h2>{t("Moderator authenticator","समीक्षक प्रमाणीकरण")}</h2>
    <p>{t("Moderator actions require your authenticator's current code. A phone code alone does not grant moderation access.","समीक्षक कार्यका लागि प्रमाणीकरण एपको कोड चाहिन्छ। फोन कोड मात्र पर्याप्त छैन।")}</p>
    {loaded && !emailReady && !factorId ? <form onSubmit={verifyEmail}>
      <p>{t("Add a verified moderator email to set up your authenticator. Buyers and sellers can keep using phone login.","प्रमाणीकरण एप जोड्न समीक्षक इमेल प्रमाणित गर्नुहोस्। खरिदकर्ता र विक्रेतालाई फोन प्रवेश पर्याप्त छ।")}</p>
      <div className="form-field"><label htmlFor="moderator-email">{t("Moderator email","समीक्षक इमेल")}</label><input id="moderator-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} disabled={emailSent} required maxLength={254}/></div>
      {emailSent && <div className="form-field"><label htmlFor="email-code">{t("Email verification code","इमेल प्रमाणीकरण कोड")}</label><input id="email-code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={emailCode} onChange={event => setEmailCode(event.target.value.replace(/\D/g,""))} required/></div>}
      <button className="button secondary" disabled={busy}>{emailSent ? t("Verify moderator email","समीक्षक इमेल पुष्टि") : t("Send email code","इमेल कोड पठाउनुहोस्")}</button>
      {emailSent && <button type="button" className="reset-button" disabled={busy} onClick={() => { setEmailSent(false); setEmailCode(""); }}>{t("Change or resend email","इमेल बदल्नुहोस् वा पुनः पठाउनुहोस्")}</button>}
    </form> : loaded && !factorId ? <button className="button secondary" onClick={enroll} disabled={busy}>{t("Set up authenticator","प्रमाणीकरण एप जोड्नुहोस्")}</button> : factorId ? <form onSubmit={verify}>
      {qrCode && <><p>{t("Scan this code in your authenticator app.","प्रमाणीकरण एपमा यो कोड स्क्यान गर्नुहोस्।")}</p><Image src={qrCode} alt={t("Authenticator setup QR code","प्रमाणीकरण सेटअप QR कोड")} width={200} height={200} unoptimized/><p>{t("Manual setup key (keep private): ","म्यानुअल सेटअप कोड (निजी राख्नुहोस्): ")}<code>{setupKey}</code></p></>}
      <div className="form-field"><label htmlFor="totp">{t("Authenticator code","प्रमाणीकरण कोड")}</label><input id="totp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" value={code} onChange={event => setCode(event.target.value.replace(/\D/g,""))} required/></div>
      <button className="button primary" disabled={busy}>{t("Verify authenticator","प्रमाणीकरण पुष्टि")}</button>
    </form> : null}
    {notice && <p className="draft-notice" role="status">{notice}</p>}
  </section>;
}
