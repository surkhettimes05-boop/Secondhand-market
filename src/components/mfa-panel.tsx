"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { api } from "@/lib/api-client";
import { useMarket } from "./market-provider";
export function MfaPanel({ onVerified }: { onVerified: () => void }) {
  const {t}=useMarket();
  const [factorId,setFactorId]=useState("");
  const [qrCode,setQrCode]=useState("");
  const [setupKey,setSetupKey]=useState("");
  const [code,setCode]=useState("");
  const [notice,setNotice]=useState("");
  const [busy,setBusy]=useState(false);
  useEffect(()=>{api<{factors:{id:string}[]}>("/api/auth/mfa").then(result=>setFactorId(result.factors[0]?.id||"")).catch(error=>setNotice(error.message));},[]);
  async function enroll(){
    setBusy(true);setNotice("");
    try{const result=await api<{factorId:string;qrCode:string;setupKey:string}>("/api/auth/mfa",{action:"enroll"});setFactorId(result.factorId);setQrCode(result.qrCode);setSetupKey(result.setupKey);}
    catch(error){setNotice(error instanceof Error?error.message:"Try again.");}finally{setBusy(false);}
  }
  async function verify(event:React.FormEvent){
    event.preventDefault();setBusy(true);setNotice("");
    try{await api("/api/auth/mfa",{action:"verify",factorId,code});setQrCode("");setSetupKey("");setCode("");onVerified();}
    catch(error){setNotice(error instanceof Error?error.message:"Try again.");}finally{setBusy(false);}
  }
  return <section className="account-panel"><h2>{t("Moderator authenticator","समीक्षक प्रमाणीकरण")}</h2><p>{t("Moderator actions require your authenticator's current code. A phone code alone does not grant moderation access.","समीक्षक कार्यका लागि प्रमाणीकरण एपको कोड चाहिन्छ। फोन कोड मात्र पर्याप्त छैन।")}</p>{!factorId?<button className="button secondary" onClick={enroll} disabled={busy}>{t("Set up authenticator","प्रमाणीकरण एप जोड्नुहोस्")}</button>:<form onSubmit={verify}>{qrCode&&<><p>{t("Scan this code in your authenticator app.","प्रमाणीकरण एपमा यो कोड स्क्यान गर्नुहोस्।")}</p><Image src={qrCode} alt={t("Authenticator setup QR code","प्रमाणीकरण सेटअप QR कोड")} width={200} height={200} unoptimized/><p>{t("Manual setup key (keep private): ","म्यानुअल सेटअप कोड (निजी राख्नुहोस्): ")}<code>{setupKey}</code></p></>}<div className="form-field"><label htmlFor="totp">{t("Authenticator code","प्रमाणीकरण कोड")}</label><input id="totp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" value={code} onChange={event=>setCode(event.target.value.replace(/\D/g,""))} required/></div><button className="button primary" disabled={busy}>{t("Verify authenticator","प्रमाणीकरण पुष्टि")}</button></form>}{notice&&<p className="draft-notice" role="status">{notice}</p>}</section>;
}
