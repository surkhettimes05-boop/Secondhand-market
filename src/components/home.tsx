"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, Search, House, Trees, Armchair, MapPin, Check, MoveUpRight } from "lucide-react";
import { useMarket } from "./market-provider";
import { listings } from "@/lib/listings";
import { ListingCard } from "./listing-card";
export function Home() {
 const {t,inventory,mode}=useMarket();
 const [query,setQuery]=useState("");
 const [category,setCategory]=useState("all");
 const router=useRouter();
 return <main id="main">
   <section className="hero container">
    <div className="hero-copy"><div className="eyebrow"><span className="status-dot"/>{t("YOUR NEIGHBOURHOOD, CONNECTED","तपाईंको समुदाय, जोडिएको")}</div>
     <h1>{t("A little closer","आफ्नो घरको")}<br/><span>{t("to home.","अलि नजिक।")}</span></h1>
     <p className="hero-description">{t("Find your next place. Give useful things a new home. A local marketplace for the life you're building in Birendranagar.","अर्को घर खोज्नुहोस्। उपयोगी सामानलाई नयाँ घर दिनुहोस्। वीरेन्द्रनगरमा तपाईंको जीवनका लागि स्थानीय बजार।")}</p>
     <form className="hero-search" action="/search" onSubmit={event=>{event.preventDefault();const params=new URLSearchParams();if(query.trim())params.set("q",query.trim());if(category!=="all")params.set("category",category);router.push("/search?"+params.toString());}}>
      <div className="search-field"><Search size={19}/><label className="sr-only" htmlFor="home-search">{t("Search listings","सूची खोज्नुहोस्")}</label><input id="home-search" name="q" placeholder={t("What are you looking for?","के खोज्दै हुनुहुन्छ?")} value={query} onChange={e=>setQuery(e.target.value)} maxLength={200}/></div>
      <label className="sr-only" htmlFor="home-category">{t("Category","वर्ग")}</label><select id="home-category" name="category" value={category} onChange={e=>setCategory(e.target.value)}><option value="all">{t("All categories","सबै वर्ग")}</option><option value="rent">{t("Rentals","भाडा")}</option><option value="land">{t("Land","जग्गा")}</option><option value="items">{t("Secondhand","पुराना सामान")}</option></select>
      <button className="search-submit" aria-label={t("Search listings","सूची खोज्नुहोस्")}><ArrowRight size={22}/></button>
     </form>
     <div className="hero-location"><MapPin size={15}/>{t("Made for Birendranagar, Surkhet","वीरेन्द्रनगर, सुर्खेतका लागि")}<span>·</span>{t("Browse without signing in","खाता बिना हेर्नुहोस्")}</div>
    </div>
    <div className="hero-art">
      <div className="hero-image"><Image src={listings[0].image} alt={t("Illustrative comfortable living room","आरामदायी बैठक कोठाको उदाहरण")} fill sizes="(max-width: 760px) 92vw, 50vw" preload style={{objectFit:"cover"}}/><div className="image-caption"><span>{t("ROOM FOR YOUR NEXT CHAPTER","नयाँ सुरुवातका लागि ठाउँ")}</span><p>{t("Somewhere to call your own.","आफ्नो भन्न मिल्ने ठाउँ।")}</p></div></div>
      <div className="floating-label"><span className="floating-icon"><House size={20}/></span><div><strong>{t("A place. A possibility.","एउटा ठाउँ। एउटा सम्भावना।")}</strong><span>{t("Start exploring nearby","नजिकै खोज्न सुरु गर्नुहोस्")}</span></div><ArrowUpRight size={19}/></div>
      <span className="art-caption">{t("Illustrative photography · Design preview","उदाहरण तस्बिर · डिजाइन पूर्वावलोकन")}</span>
    </div>
   </section>
   <section className="category-strip container" aria-label={t("Browse categories","वर्ग हेर्नुहोस्")}>
     {[{category:"rent",Icon:House,title:t("Find a home","घर खोज्नुहोस्"),description:t("Rooms, flats & houses for rent","कोठा, फ्ल्याट र घर भाडामा"),className:"lavender"},{category:"land",Icon:Trees,title:t("Make room for a future","भविष्यका लागि ठाउँ"),description:t("Land & plots for sale","जग्गा र घडेरी बिक्री"),className:"sage"},{category:"items",Icon:Armchair,title:t("Good things, another life","सामानलाई नयाँ जीवन"),description:t("Secondhand finds, close by","नजिकैका पुराना सामान"),className:"sand"}].map(({category,Icon,title,description,className})=><Link className="category-entry" href={"/search?category="+category} key={category}><span className={"category-icon "+className}><Icon size={24}/></span><span><strong>{title}</strong><small>{description}</small></span><ArrowUpRight size={20}/></Link>)}
   </section>
   <section className="inventory-section container"><div className="section-heading"><div><div className="eyebrow">{t("EXPLORE THE POSSIBILITIES","सम्भावनाहरू खोज्नुहोस्")}</div><h2>{t("Your next find starts here.","अर्को खोज यहीँबाट सुरु हुन्छ।")}</h2><p>{mode==="live"?t("Explore available local homes, land and everyday finds.","उपलब्ध स्थानीय घर, जग्गा र सामान खोज्नुहोस्।"):t("A preview of how local homes, land and everyday finds come together.","स्थानीय घर, जग्गा र सामान एकै ठाउँमा आउने अनुभवको पूर्वावलोकन।")}</p></div><Link className="text-link" href="/search">{t("Explore all listings","सबै सूची हेर्नुहोस्")}<ArrowRight size={17}/></Link></div><div className="listing-grid">{inventory.slice(0,6).map(listing=><ListingCard key={listing.id} listing={listing}/>)}</div>{mode==="live"&&inventory.length===0&&<div className="empty"><h3>{t("The first local listings are on their way.","पहिलो स्थानीय सूची आउँदैछन्।")}</h3><p>{t("Be one of the first to submit a listing for review.","समीक्षाका लागि पहिलो सूची राख्नुहोस्।")}</p><Link className="button primary" href="/post">{t("Post a listing","सूची राख्नुहोस्")}</Link></div>}</section>
   <section className="seller-section container"><div className="seller-copy"><div className="eyebrow">{t("SOMETHING TO OFFER?","केही दिन चाहनुहुन्छ?")}</div><h2>{t("Someone nearby is","नजिकै कसैले")}<br/>{t("looking for it.","त्यही खोज्दैछ।")}</h2><p>{t("An empty room. A piece of land. A sofa with stories. Make a clear listing and help the right person find it.","खाली कोठा। जग्गाको टुक्रा। सम्झना बोकेको सोफा। स्पष्ट सूची बनाएर सही व्यक्तिसम्म पुर्‍याउनुहोस्।")}</p><Link className="button primary" href="/post">{mode==="live"?t("Post a listing","सूची राख्नुहोस्"):t("Try creating a listing","सूची बनाउन प्रयास गर्नुहोस्")}<ArrowRight size={17}/></Link><span className="seller-disclaimer">{mode==="live"?t("Phone-verified sellers · Reviewed before publication","फोन प्रमाणित विक्रेता · प्रकाशनअघि समीक्षा"):t("Local draft preview · Publishing comes in the next phase","स्थानीय मस्यौदा पूर्वावलोकन · प्रकाशन अर्को चरणमा")}</span></div><div className="seller-steps">{[{n:"01",title:t("Tell the useful details","उपयोगी विवरण दिनुहोस्"),body:t("Price, location, condition and any extra costs.","मूल्य, ठाउँ, अवस्था र थप खर्च।")},{n:"02",title:t("Show it as it is","जस्तो छ त्यस्तै देखाउनुहोस्"),body:t("Clear photos and honest descriptions help people decide.","स्पष्ट तस्बिर र सही विवरणले निर्णय सजिलो बनाउँछ।")},{n:"03",title:t("Keep availability current","उपलब्धता अद्यावधिक राख्नुहोस्"),body:t("Real listings will need regular confirmation.","वास्तविक सूची नियमित रूपमा पुष्टि गर्नुपर्नेछ।")}].map(step=><div className="seller-step" key={step.n}><span>{step.n}</span><div><h3>{step.title}</h3><p>{step.body}</p></div><Check size={18}/></div>)}</div></section>
   <section className="closing-line container"><span className="closing-mark"><MoveUpRight size={26}/></span><p>{t("Local possibilities. Clear details. A better way to find each other.","स्थानीय सम्भावना। स्पष्ट विवरण। एकअर्कासँग जोडिने राम्रो तरिका।")}</p></section>
 </main>;
}
