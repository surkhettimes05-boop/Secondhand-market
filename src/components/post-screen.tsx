"use client";
import { useMarket } from "./market-provider";
import { PreviewPostScreen } from "./preview-post-screen";
import { LivePostScreen } from "./live-post-screen";
export function PostScreen(){
 const {mode,t}=useMarket();
 if(mode==="loading")return <main id="main" className="container section"><p>{t("Loading…","खुल्दैछ…")}</p></main>;
 if(mode==="error")return <main id="main" className="container section empty"><h1>{t("Listings are temporarily unavailable.","सूची अस्थायी रूपमा उपलब्ध छैनन्।")}</h1><p>{t("Please try again shortly.","केही समयपछि प्रयास गर्नुहोस्।")}</p></main>;
 return mode==="live"?<LivePostScreen/>:<PreviewPostScreen/>;
}
