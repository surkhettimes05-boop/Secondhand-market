"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X, ArrowRight, Heart } from "lucide-react";
import { useMarket } from "./market-provider";
import { ListingCard } from "./listing-card";
import { defaultFilters, filterListings, filtersFromParams, filtersToParams, toPaisa } from "@/lib/market";
export function SearchScreen() {
 const params=useSearchParams();
 const router=useRouter();
 const {t,inventory,mode}=useMarket();
 const [filters,setFilters]=useState(()=>filtersFromParams(new URLSearchParams(params.toString())));
 const [feedback,setFeedback]=useState("");
 useEffect(()=>{setFilters(filtersFromParams(new URLSearchParams(params.toString())));setFeedback("");},[params]);
 const committed=filtersFromParams(new URLSearchParams(params.toString()));
 const results=filterListings(inventory,committed);
 function apply(event:React.FormEvent) {
  event.preventDefault();
  if((filters.min&&toPaisa(filters.min)===null)||(filters.max&&toPaisa(filters.max)===null)||(filters.min&&filters.max&&toPaisa(filters.min)!>toPaisa(filters.max)!)){
   setFeedback(t("Enter valid prices, with minimum no greater than maximum.","सही मूल्य दिनुहोस्; न्यूनतम अधिकतमभन्दा ठूलो हुनु हुँदैन।"));return;
  }
  setFeedback("");router.push("/search?"+filtersToParams(filters));
 }
 function clear() {setFilters(defaultFilters);setFeedback("");router.push("/search");}
 return <main id="main" className="container search-page">
  <div className="eyebrow">{t("A LOCAL PLACE TO LOOK","स्थानीय खोज्ने ठाउँ")}</div><div className="search-heading"><h1>{t("Find something","केही राम्रो")} <span>{t("closer.","नजिकै खोज्नुहोस्।")}</span></h1><p>{t("Homes, land and everyday things — in one place.","घर, जग्गा र दैनिक सामान — एकै ठाउँमा।")}</p></div>
  <div className="search-layout">
   <form className="filter-panel" onSubmit={apply}>
    <div className="filter-title"><SlidersHorizontal size={17}/><h2>{t("Refine your search","खोज मिलाउनुहोस्")}</h2><button className="reset-button" type="button" onClick={clear}>{t("Reset","रिसेट")}</button></div>
    <label htmlFor="query">{t("Search","खोज")}</label><div className="filter-input-icon"><Search size={16}/><input id="query" value={filters.query} onChange={e=>setFilters({...filters,query:e.target.value})} placeholder={t("Try sofa or flat","सोफा वा फ्ल्याट")} maxLength={200}/></div>
    <label htmlFor="category">{t("Category","वर्ग")}</label><select id="category" value={filters.category} onChange={e=>setFilters({...filters,category:e.target.value})}><option value="all">{t("All categories","सबै वर्ग")}</option><option value="rent">{t("Homes for rent","भाडाका घर")}</option><option value="land">{t("Land for sale","जग्गा बिक्री")}</option><option value="items">{t("Secondhand goods","पुराना सामान")}</option></select>
    <label htmlFor="locality">{mode==="live"?t("Location","ठाउँ"):t("Sample locality","नमुना ठाउँ")}</label><select id="locality" value={filters.locality} onChange={e=>setFilters({...filters,locality:e.target.value})}><option value="">{t("All areas","सबै ठाउँ")}</option><option value="Birendranagar">{t("Birendranagar","वीरेन्द्रनगर")}</option>{mode==="preview"&&<option value="Surkhet">{t("Surkhet","सुर्खेत")}</option>}</select>
    <fieldset><legend>{t("Price in NPR","नेपाली रुपैयाँमा मूल्य")}</legend><div className="price-fields"><div><label className="sr-only" htmlFor="min-price">{t("Minimum price","न्यूनतम मूल्य")}</label><input id="min-price" inputMode="decimal" value={filters.min} onChange={e=>setFilters({...filters,min:e.target.value})} placeholder={t("Min","न्यूनतम")}/></div><span>–</span><div><label className="sr-only" htmlFor="max-price">{t("Maximum price","अधिकतम मूल्य")}</label><input id="max-price" inputMode="decimal" value={filters.max} onChange={e=>setFilters({...filters,max:e.target.value})} placeholder={t("Max","अधिकतम")}/></div></div></fieldset>
    <label htmlFor="sort">{t("Sort by","क्रम")}</label><select id="sort" value={filters.sort} onChange={e=>setFilters({...filters,sort:e.target.value})}><option value="recommended">{mode==="live"?t("Newest","नयाँ"):t("Preview order","पूर्वावलोकन क्रम")}</option><option value="price-asc">{t("Price: low to high","मूल्य: कमदेखि बढी")}</option><option value="price-desc">{t("Price: high to low","मूल्य: बढीदेखि कम")}</option></select>
    {feedback&&<p className="form-error" role="alert">{feedback}</p>}<button className="button primary">{t("Show results","नतिजा देखाउनुहोस्")}<ArrowRight size={16}/></button>
    <p className="filter-note">{mode==="live"?t("Rental prices are monthly. Land and item prices are total asking prices.","भाडा मासिक हो। जग्गा र सामानको मूल्य कुल हो।"):t("All content is illustrative. Rental prices are per month; land and item prices are total asking prices.","सबै सामग्री उदाहरण हुन्। भाडा मासिक हो; जग्गा र सामानको मूल्य कुल हो।")}</p>
   </form>
   <section className="search-results" aria-label={t("Results","नतिजा")}><div className="results-top"><p aria-live="polite"><strong>{results.length}</strong> {mode==="live"?t("listings","सूची"):t("sample listings","नमुना सूची")}</p>{committed.category!=="all"&&<button className="filter-chip" onClick={()=>router.push("/search?"+filtersToParams({...committed,category:"all"}))}>{committed.category==="rent"?t("Rentals","भाडा"):committed.category==="land"?t("Land","जग्गा"):t("Secondhand","पुराना सामान")}<X size={13}/><span className="sr-only">{t("Remove category filter","वर्ग फिल्टर हटाउनुहोस्")}</span></button>}</div>
    {results.length?<div className="listing-grid search-grid">{results.map(listing=><ListingCard listing={listing} key={listing.id}/>)}</div>:<div className="empty"><Search size={32}/><h2>{t("A little too specific?","खोज अलि धेरै सीमित भयो?")}</h2><p>{t("Try another word or clear your filters.","अर्को शब्द प्रयोग गर्नुहोस् वा फिल्टर हटाउनुहोस्।")}</p><button className="button primary" onClick={clear}>{t("Clear filters","फिल्टर हटाउनुहोस्")}</button></div>}
   </section>
  </div>
 </main>;
}
export function SavedScreen() {
 const {saved,ready,t,inventory,mode}=useMarket();
 const selected=inventory.filter(item=>saved.includes(item.id));
 return <main id="main" className="container section"><div className="eyebrow">{t("A PLACE FOR YOUR FAVOURITES","मनपर्ने सूचीको ठाउँ")}</div><div className="section-heading"><div><h1>{t("Worth another look.","फेरि हेर्नलायक।")}</h1><p>{mode==="live"?t("Saved to your account. Unavailable listings are excluded below.","खातामा सुरक्षित। अनुपलब्ध सूची तल देखाइएका छैनन्।"):t("Saved on this device only. No account is connected.","यस उपकरणमा मात्र सुरक्षित। खाता जोडिएको छैन।")}</p></div></div>{!ready?<p>{t("Loading saved listings…","सुरक्षित सूची खोलिँदैछ…")}</p>:selected.length?<div className="listing-grid">{selected.map(listing=><ListingCard key={listing.id} listing={listing}/>)}</div>:<div className="empty"><Heart size={32}/><h2>{t("Keep your possibilities together.","मनपर्ने सम्भावना एकै ठाउँमा राख्नुहोस्।")}</h2><p>{t("Tap the heart on a listing to save it here.","सूचीको मुटु चिन्ह थिचेर यहाँ राख्नुहोस्।")}</p><Link className="button primary" href="/search">{t("Start exploring","खोज्न सुरु गर्नुहोस्")}<ArrowRight size={16}/></Link></div>}</main>;
}
