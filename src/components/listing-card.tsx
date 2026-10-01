"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Heart, MapPin } from "lucide-react";
import type { Listing } from "@/lib/market";
import { formatPrice } from "@/lib/market";
import { useMarket } from "./market-provider";
export function ListingCard({ listing, priority = false }: { listing: Listing; priority?: boolean }) {
 const {language,t,saved,toggleSaved,ready}=useMarket();
 const isSaved=saved.includes(listing.id);
 const label=listing.category==="rent"?t("For rent","भाडामा"):listing.category==="land"?t("Land for sale","जग्गा बिक्री"):t("Secondhand","पुराना सामान");
 return <article className="listing-card">
   <div className="card-photo"><Link href={"/listings/"+listing.id} tabIndex={-1} aria-hidden="true"><Image src={listing.image} alt={listing.imageAlt[language]} fill unoptimized={listing.isSample===false} sizes="(max-width: 560px) 92vw, (max-width: 900px) 45vw, 30vw" preload={priority} style={{objectFit:"cover"}}/><span className="category-badge">{label}</span></Link><button className={"save-button "+(isSaved?"is-saved":"")} disabled={!ready} onClick={()=>toggleSaved(listing.id)} aria-pressed={isSaved} aria-label={isSaved?t("Remove saved listing","सुरक्षित सूची हटाउनुहोस्"):t("Save listing","सूची सुरक्षित गर्नुहोस्")}><Heart size={17} fill={isSaved?"currentColor":"none"}/></button></div>
   <div className="card-body"><div className="card-price">{formatPrice(listing.pricePaisa,language)}{listing.category==="rent"&&<span>{t(" / month"," / महिना")}</span>}</div><h3><Link href={"/listings/"+listing.id}>{listing.title[language]}<ArrowUpRight size={16}/></Link></h3><p className="card-location"><MapPin size={13}/>{listing.locality[language]}</p><div className="card-facts">{listing.facts[language].map(fact=><span key={fact}>{fact}</span>)}</div><span className="sample-note">{listing.isSample===false?t("Availability confirmed ","उपलब्धता पुष्टि ")+new Intl.DateTimeFormat(language==="ne"?"ne-NP":"en-GB",{timeZone:"Asia/Kathmandu",dateStyle:"medium"}).format(new Date(listing.confirmedAt!)):t("Sample listing","नमुना सूची")}</span></div>
 </article>;
}
