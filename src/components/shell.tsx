"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mountain, MapPin, ArrowUpRight, Heart, Plus, Search, House } from "lucide-react";
import { useMarket } from "./market-provider";
export function Brand() { return <span className="brand"><span className="brand-mark"><Mountain size={23} strokeWidth={2}/></span><span>surkhet<span className="brand-light">market</span><span className="brand-dot">.</span></span></span>; }
export function SiteHeader() {
  const {language,setLanguage,t,saved,mode,catalogError,reloadCatalog}=useMarket();
  const pathname=usePathname();
  return <>
    <div className="preview-banner">{mode==="preview"?t("Design preview · Sample listings and illustrative photography. Nothing here is for sale.","डिजाइन पूर्वावलोकन · नमुना सूची र उदाहरण तस्बिरहरू। यहाँ वास्तविक बिक्री छैन।"):mode==="live"?t("Local listings · Clear details · Keep availability current","स्थानीय सूची · स्पष्ट विवरण · उपलब्धता अद्यावधिक राख्नुहोस्"):t("A local marketplace for Birendranagar, Surkhet.","वीरेन्द्रनगर, सुर्खेतको स्थानीय बजार।")}{catalogError&&<span role="status"> {t("Listings are unavailable. ","सूची उपलब्ध छैनन्। ")}<button className="reset-button" onClick={reloadCatalog}>{t("Try again","फेरि प्रयास")}</button></span>}</div>
    <header className="site-header"><div className="container header-inner">
      <Link href="/" aria-label={t("Surkhet Market home","सुर्खेत मार्केट गृहपृष्ठ")}><Brand/></Link>
      <nav className="desktop-nav" aria-label={t("Main navigation","मुख्य नेभिगेसन")}>
        <Link href="/search" className={pathname==="/search"?"active":""}>{t("Explore","खोज्नुहोस्")}</Link>
        <Link href="/search?category=rent">{t("Rent a home","भाडाको घर")}</Link>
        <Link href="/search?category=items">{t("Secondhand","पुराना सामान")}</Link>
      </nav>
      <div className="header-actions">{mode==="live"&&<Link className="account-link" href="/account">{t("Account","खाता")}</Link>}<span className="location"><MapPin size={14}/> {t("Birendranagar","वीरेन्द्रनगर")}</span>
        <button className="language-button" onClick={()=>setLanguage(language==="en"?"ne":"en")} aria-label={t("Switch to Nepali","अङ्ग्रेजीमा बदल्नुहोस्")}>{language==="en"?"नेपाली":"English"}</button>
        <Link className="icon-button desktop-save" href="/saved" aria-label={t("Saved listings","सुरक्षित सूची")}><Heart size={19}/>{saved.length>0&&<span className="saved-count">{saved.length}</span>}</Link>
        <Link className="button primary header-post" href="/post">{t("Post a listing","सूची राख्नुहोस्")}<Plus size={16}/></Link>
      </div>
    </div></header>
    <nav className="mobile-nav" aria-label={t("Mobile navigation","मोबाइल नेभिगेसन")}>
      {[{href:"/",label:t("Home","गृह"),Icon:House},{href:"/search",label:t("Explore","खोज"),Icon:Search},{href:"/post",label:t("Post","राख्नुहोस्"),Icon:Plus},{href:"/saved",label:t("Saved","सुरक्षित"),Icon:Heart}].map(({href,label,Icon})=><Link key={href} href={href} aria-current={pathname===href?"page":undefined}><Icon size={19}/><span>{label}</span></Link>)}
    </nav>
  </>;
}
export function SiteFooter() {
 const {t,storageWarning,mode}=useMarket();
 return <footer className="site-footer"><div className="container footer-inner"><div><Link href="/"><Brand/></Link><p>{t("A little closer to home.","आफ्नो घरको अलि नजिक।")}</p></div><div className="footer-links"><Link href="/search">{t("Browse listings","सूची हेर्नुहोस्")}</Link><Link href="/post">{mode==="live"?t("Post a listing","सूची राख्नुहोस्"):t("Create a local draft","स्थानीय मस्यौदा बनाउनुहोस्")}</Link><Link href="/about">{mode==="live"?t("About the marketplace","बजारबारे"):t("About this preview","पूर्वावलोकनबारे")}</Link></div><p className="footer-note">{mode==="live"?t("Built for Birendranagar, Surkhet. Inspect listings and confirm terms directly with sellers.","वीरेन्द्रनगर, सुर्खेतका लागि। विक्रेतासँग विवरण र सर्त पुष्टि गरी जाँच गर्नुहोस्।"):t("Built for Birendranagar, Surkhet. Preview only; accounts and publishing are not connected yet.","वीरेन्द्रनगर, सुर्खेतका लागि। पूर्वावलोकन मात्र; खाता र प्रकाशन जोडिएका छैनन्।")}</p>{storageWarning&&<p role="status">{t("Device storage is unavailable. Saved listings may not persist.","उपकरण भण्डारण उपलब्ध छैन। सुरक्षित सूची रहिरहन नसक्छ।")}</p>}</div></footer>;
}
