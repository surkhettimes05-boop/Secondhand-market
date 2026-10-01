"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { House, Trees, Armchair, Check, Upload } from "lucide-react";
import type { Category } from "@/lib/market";
import { toPaisa, formatPrice } from "@/lib/market";
import { draftContentSchema, listingInputSchema } from "@/lib/listing-input";
import type { DraftContent } from "@/lib/listing-input";
import { api, ApiError } from "@/lib/api-client";
import { useAccount } from "./use-account";
import { useMarket } from "./market-provider";
type OwnRow={id:string;category:Category;status:string;review_status:string;draft_content:DraftContent};
function initialContent():DraftContent{return draftContentSchema.parse({});}
export function LivePostScreen(){
 const {t,language,reloadCatalog}=useMarket();
 const {account,loading,error}=useAccount();
 const router=useRouter();
 const params=useSearchParams();
 const editId=params.get("id");
 const [id,setId]=useState<string|null>(null);
 const [category,setCategory]=useState<Category>("rent");
 const [content,setContent]=useState<DraftContent>(initialContent);
 const [price,setPrice]=useState("");
 const [deposit,setDeposit]=useState("");
 const [step,setStep]=useState(0);
 const [busy,setBusy]=useState(false);
 const [restoring,setRestoring]=useState(!!editId);
 const [notice,setNotice]=useState("");
 const [fieldErrors,setFieldErrors]=useState<Record<string,string>>({});
 const [savedAt,setSavedAt]=useState("");
 useEffect(()=>{
  if(!account||!editId){if(!editId)setRestoring(false);return;}
  let alive=true;
  setRestoring(true);
  api<{listings:OwnRow[]}>("/api/listings").then(result=>{
   if(!alive)return;
   const row=result.listings.find(item=>item.id===editId);
   if(!row)throw new Error("Draft not found.");
   if(row.review_status==="pending"||["sold","rented","withdrawn","removed"].includes(row.status))throw new Error("This listing cannot be edited.");
   setId(row.id);setCategory(row.category);setContent(draftContentSchema.parse(row.draft_content));
   setPrice(row.draft_content.pricePaisa?String(row.draft_content.pricePaisa/100):"");
   setDeposit(typeof row.draft_content.details.depositPaisa==="number"?String(row.draft_content.details.depositPaisa/100):"");
  }).catch(problem=>{if(alive)setNotice(problem.message);}).finally(()=>{if(alive)setRestoring(false);});
  return()=>{alive=false;};
 },[account,editId]);
 function payload():DraftContent{
  return {...content,pricePaisa:toPaisa(price)??0,details:{...content.details,...(category==="rent"?{depositPaisa:toPaisa(deposit)??-1}:{})}};
 }
 async function persist(value=payload()){
  const result=await api<{id:string}>("/api/listings",{id,category,content:value});
  setId(result.id);setSavedAt(new Date().toLocaleTimeString(language==="ne"?"ne-NP":"en-GB"));
  return result.id;
 }
 function problems(problem:unknown){
  if(problem instanceof ApiError&&problem.issues.length)setFieldErrors(Object.fromEntries(problem.issues.map(issue=>[issue.path,issue.message])));
  setNotice(problem instanceof Error?problem.message:t("Please try again.","फेरि प्रयास गर्नुहोस्।"));
 }
 async function save(){
  setBusy(true);setNotice("");setFieldErrors({});
  try{await persist();setNotice(t("Draft saved to your account.","मस्यौदा खातामा सुरक्षित भयो।"));}
  catch(problem){problems(problem);}finally{setBusy(false);}
 }
 async function next(){
  setFieldErrors({});setNotice("");
  if(step===1){
   const parsed=listingInputSchema.safeParse({...payload(),category});
   if(!parsed.success){
    const issues=parsed.error.issues.filter(issue=>!["photos","termsAccepted"].includes(String(issue.path[0])));
    if(issues.length){setFieldErrors(Object.fromEntries(issues.map(issue=>[issue.path.join("."),issue.message])));setNotice(t("Complete the required details before continuing.","अगाडि बढ्न आवश्यक विवरण पूरा गर्नुहोस्।"));return;}
   }
   setBusy(true);
   try{await persist();setStep(2);}catch(problem){problems(problem);}finally{setBusy(false);}
  }else if(step===2){
   if(content.photos.length===0){setNotice(t("Add at least one actual photo.","कम्तीमा एउटा वास्तविक तस्बिर राख्नुहोस्।"));return;}setStep(3);
  }else setStep(current=>current+1);
 }
 async function upload(event:React.ChangeEvent<HTMLInputElement>){
  const photos=Array.from(event.target.files||[]);
  event.target.value="";
  if(content.photos.length+photos.length>10){setNotice(t("Use up to 10 photos.","१० तस्बिरसम्म प्रयोग गर्नुहोस्।"));return;}
  if(photos.some(photo=>!["image/jpeg","image/png","image/webp"].includes(photo.type)||photo.size>10*1024*1024)){setNotice(t("Use JPEG, PNG or WebP photos up to 10 MB each.","JPEG, PNG वा WebP तस्बिर प्रत्येक १० MB सम्म प्रयोग गर्नुहोस्।"));return;}
  setBusy(true);setNotice("");
  try{
   const current=payload();
   const listingId=await persist(current);
   const paths=[...current.photos];
   for(const photo of photos){
    const data=new FormData();data.set("listingId",listingId);data.set("file",photo);
    const response=await fetch("/api/media",{method:"POST",body:data,credentials:"same-origin"});
    const result=await response.json();
    if(!response.ok)throw new Error(result.error||"Photo upload failed.");
    paths.push(result.path);
    const updated={...current,photos:[...paths]};
    setContent(updated);
    await api("/api/listings",{id:listingId,category,content:updated});
   }
   setSavedAt(new Date().toLocaleTimeString());setNotice(t("Photos uploaded privately and draft saved.","तस्बिर निजी रूपमा अपलोड भए र मस्यौदा सुरक्षित भयो।"));
  }catch(problem){problems(problem);}finally{setBusy(false);}
 }
 async function submit(){
  setBusy(true);setNotice("");setFieldErrors({});
  const parsed=listingInputSchema.safeParse({...payload(),category});
  if(!parsed.success){setFieldErrors(Object.fromEntries(parsed.error.issues.map(issue=>[issue.path.join("."),issue.message])));setNotice(t("Check all required fields, photos and consent.","आवश्यक विवरण, तस्बिर र सहमति जाँच गर्नुहोस्।"));setBusy(false);return;}
  try{const listingId=await persist();await api("/api/listings/action",{id:listingId,action:"submit"});reloadCatalog();router.push("/account");}
  catch(problem){problems(problem);}finally{setBusy(false);}
 }
 function detail(key:string,value:string|number|boolean){setContent(current=>({...current,details:{...current.details,[key]:value}}));}
 function input(key:string,label:string,kind:"text"|"number"|"date"|"textarea"="text"){
  const value=String(content.details[key]??"");
  const fieldId="detail-"+key;
  return <div className="form-field" key={key}><label htmlFor={fieldId}>{label}</label>{kind==="textarea"?<textarea id={fieldId} rows={3} value={value} onChange={event=>detail(key,event.target.value)} maxLength={500} aria-invalid={!!fieldErrors["details."+key]}/>:<input id={fieldId} type={kind} value={value} onChange={event=>detail(key,kind==="number"?(event.target.value===""?0:Number(event.target.value)):event.target.value)} step={key==="area"?"any":undefined} aria-invalid={!!fieldErrors["details."+key]}/>}<FieldError message={fieldErrors["details."+key]}/></div>;
 }
 function select(key:string,label:string,options:{id:string;label:string}[]){
  return <div className="form-field"><label htmlFor={"detail-"+key}>{label}</label><select id={"detail-"+key} value={String(content.details[key]??"")} onChange={event=>detail(key,event.target.value)} aria-invalid={!!fieldErrors["details."+key]}><option value="">{t("Choose…","छान्नुहोस्…")}</option>{options.map(option=><option value={option.id} key={option.id}>{option.label}</option>)}</select><FieldError message={fieldErrors["details."+key]}/></div>;
 }
 if(loading||restoring)return <main id="main" className="container section"><p>{t("Loading your draft…","मस्यौदा खुल्दैछ…")}</p></main>;
 if(editId&&!id&&!restoring&&account)return <main id="main" className="container section empty"><h1>{t("Draft unavailable.","मस्यौदा उपलब्ध छैन।")}</h1><p>{notice}</p><Link className="button primary" href="/account">{t("Back to account","खातामा फर्कनुहोस्")}</Link></main>;
 if(!account)return <main id="main" className="container section empty"><h1>{t("Start with your verified phone.","प्रमाणित फोनबाट सुरु गर्नुहोस्।")}</h1><p>{error||t("Sign in to save your listing securely and submit it for review.","सूची सुरक्षित राख्न र समीक्षामा पठाउन प्रवेश गर्नुहोस्।")}</p><Link className="button primary" href="/login?next=%2Fpost">{t("Sign in to post","सूची राख्न प्रवेश")}</Link></main>;
 return <main id="main" className="container post-page"><div className="post-intro"><div className="eyebrow">{t("LET'S MAKE A GOOD LISTING","राम्रो सूची बनाऔँ")}</div><h1>{t("A little detail.","थोरै विवरण।")} <span>{t("A lot of possibility.","धेरै सम्भावना।")}</span></h1><p>{t("Drafts and photos are private until your listing is approved.","स्वीकृत नभएसम्म मस्यौदा र तस्बिर निजी रहन्छन्।")}</p></div><div className="post-layout"><aside className="post-sidebar"><ol className="step-list">{[t("Category","वर्ग"),t("Details","विवरण"),t("Photos","तस्बिर"),t("Review","समीक्षा")].map((label,index)=><li key={index} className={step===index?"current":step>index?"complete":""}><span>{step>index?<Check size={15}/>:index+1}</span>{label}</li>)}</ol><p className="muted">{savedAt&&t("Last saved: ","अन्तिम सुरक्षित: ")+savedAt}</p></aside><section className="post-form"><h2>{step===0?t("What would you like to list?","के सूची राख्न चाहनुहुन्छ?"):step===1?t("The useful details.","उपयोगी विवरण।"):step===2?t("Show it as it is.","जस्तो छ त्यस्तै देखाउनुहोस्।"):t("Review before submitting.","पठाउनुअघि हेर्नुहोस्।")}</h2>
 {step===0&&<fieldset className="category-options"><legend className="sr-only">{t("Category","वर्ग")}</legend>{[{id:"rent",Icon:House,label:t("A home for rent","भाडाको घर")},{id:"land",Icon:Trees,label:t("Land for sale","जग्गा बिक्री")},{id:"items",Icon:Armchair,label:t("A secondhand item","पुरानो सामान")}].map(({id:choice,Icon,label})=><label className={"category-option "+(category===choice?"selected":"")} key={choice}><input type="radio" name="category" checked={category===choice} disabled={!!id||!!editId||busy} onChange={()=>{setCategory(choice as Category);setContent(initialContent());setPrice("");setDeposit("");}}/><Icon size={23}/><strong>{label}</strong><span className="radio-indicator"/></label>)}</fieldset>}
 {step===1&&<>
 <div className="form-field"><label htmlFor="live-title">{t("Listing title","सूचीको शीर्षक")}</label><input id="live-title" value={content.title} onChange={event=>setContent({...content,title:event.target.value})} maxLength={100} aria-invalid={!!fieldErrors.title}/><FieldError message={fieldErrors.title}/></div>
 <div className="form-field"><label htmlFor="live-description">{t("Description","विवरण")}</label><textarea id="live-description" value={content.description} onChange={event=>setContent({...content,description:event.target.value})} maxLength={3000} rows={5} aria-invalid={!!fieldErrors.description}/><FieldError message={fieldErrors.description}/></div>
 <div className="form-columns"><div className="form-field"><label htmlFor="live-price">{category==="rent"?t("Monthly rent (NPR)","मासिक भाडा (रु.)"):t("Total asking price (NPR)","कुल माग मूल्य (रु.)")}</label><input id="live-price" inputMode="decimal" value={price} onChange={event=>setPrice(event.target.value)} aria-invalid={!!fieldErrors.pricePaisa}/><FieldError message={fieldErrors.pricePaisa}/></div><div className="form-field"><label htmlFor="live-locality">{t("Location","ठाउँ")}</label><select id="live-locality" value={content.locality} onChange={event=>setContent({...content,locality:event.target.value})}><option value="Birendranagar">{t("Birendranagar, Surkhet","वीरेन्द्रनगर, सुर्खेत")}</option></select></div></div>
 <div className="form-field"><label htmlFor="live-role">{t("Your role","तपाईंको भूमिका")}</label><select id="live-role" value={content.role} onChange={event=>setContent({...content,role:event.target.value})} aria-invalid={!!fieldErrors.role}><option value="">{t("Choose…","छान्नुहोस्…")}</option>{(category==="items"?[{id:"individual",label:t("Individual","व्यक्ति")},{id:"shop",label:t("Shop","पसल")}]:[{id:"owner",label:t("Owner","धनी")},{id:"broker",label:t("Broker","दलाल")}]).map(option=><option key={option.id} value={option.id}>{option.label}</option>)}</select><FieldError message={fieldErrors.role}/></div>
 {category==="rent"&&<>{select("subtype",t("Rental type","भाडाको प्रकार"),[{id:"room",label:t("Room","कोठा")},{id:"flat",label:t("Flat","फ्ल्याट")},{id:"house",label:t("House","घर")}])}{input("bedrooms",t("Bedrooms","शयनकक्ष"),"number")}{input("availableDate",t("Available from","उपलब्ध मिति"),"date")}<div className="form-field"><label htmlFor="live-deposit">{t("Deposit (NPR; 0 if none)","धरौटी (रु.; नभए ०)")}</label><input id="live-deposit" inputMode="decimal" value={deposit} onChange={event=>setDeposit(event.target.value)}/><FieldError message={fieldErrors["details.depositPaisa"]}/></div>{input("water",t("Water arrangement","पानीको व्यवस्था"))}{input("bathroom",t("Bathroom arrangement","बाथरुमको व्यवस्था"))}{input("parking",t("Parking","पार्किङ"))}{input("charges",t("Additional charges (state none if none)","थप शुल्क (नभए छैन लेख्नुहोस्)"),"textarea")}{input("brokerFee",t("Broker fee (state none if none)","दलाली शुल्क (नभए छैन)"))}</>}
 {category==="land"&&<>{input("area",t("Land area","जग्गाको क्षेत्रफल"),"number")}{select("areaUnit",t("Area unit","क्षेत्रफल एकाइ"),[{id:"sqft",label:t("Square feet","वर्ग फिट")},{id:"sqm",label:t("Square metres","वर्ग मिटर")},{id:"aana",label:t("Aana","आना")},{id:"kattha",label:t("Kattha","कट्ठा")}])}{input("roadAccess",t("Road access","सडक पहुँच"),"textarea")}{input("brokerFee",t("Broker fee (state none if none)","दलाली शुल्क (नभए छैन)"))}<label className="check-label"><input type="checkbox" checked={content.details.ownershipDeclared===true} onChange={event=>detail("ownershipDeclared",event.target.checked)}/>{t("I own this land or am authorized to list it.","म जग्गाधनी हुँ वा सूची राख्न अधिकृत छु।")}</label><FieldError message={fieldErrors["details.ownershipDeclared"]}/></>}
 {category==="items"&&<>{select("subcategory",t("Item type","सामानको प्रकार"),[{id:"furniture",label:t("Furniture","फर्निचर")},{id:"appliances",label:t("Appliances","घरायसी उपकरण")},{id:"electronics",label:t("Electronics","इलेक्ट्रोनिक्स")},{id:"household",label:t("Household","घरायसी सामान")}])}{select("condition",t("Condition","अवस्था"),[{id:"like_new",label:t("Like new","नयाँजस्तै")},{id:"good",label:t("Good","राम्रो")},{id:"fair",label:t("Fair","ठीकठाक")},{id:"needs_repair",label:t("Needs repair","मर्मत चाहिने")}])}{input("defects",t("Known defects (state none known if none)","थाहा भएका कमजोरी (नभए थाहा छैन लेख्नुहोस्)"),"textarea")}{input("pickup",t("Pickup location and arrangements","उठाउने ठाउँ र व्यवस्था"),"textarea")}</>}
 </>}
 {step===2&&<><p className="muted">{t("Upload actual photos. They will be decoded, resized and stripped of location metadata before private storage.","वास्तविक तस्बिर राख्नुहोस्। स्थान मेटाडाटा हटाएर आकार मिलाई निजी रूपमा राखिन्छन्।")}</p><label className="upload-zone"><Upload size={25}/><strong>{busy?t("Uploading…","अपलोड हुँदैछ…"):t("Choose photos","तस्बिर छान्नुहोस्")}</strong><span>{t("Up to 10 · JPEG, PNG or WebP · 10 MB each","१० सम्म · JPEG, PNG वा WebP · प्रत्येक १० MB")}</span><input aria-label={t("Upload listing photos","सूचीका तस्बिर अपलोड")} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={busy}/></label><div className="draft-photos">{content.photos.map((path,index)=><div key={path}><Image src={"/api/media?key="+encodeURIComponent(path)} alt={t("Listing photo ","सूची तस्बिर ")+(index+1)} fill unoptimized sizes="150px" style={{objectFit:"cover"}}/></div>)}</div><FieldError message={fieldErrors.photos}/></>}
 {step===3&&<><div className="draft-review"><h3>{content.title}</h3><p className="review-price">{formatPrice(toPaisa(price)||0,language)}{category==="rent"&&<small>{t(" / month"," / महिना")}</small>}</p><p>{content.description}</p><dl className="cost-list">{Object.entries(payload().details).map(([key,value])=><div key={key}><dt>{key==="depositPaisa"?t("Deposit (NPR)","धरौटी (रु.)"):detailLabel(key,t)}</dt><dd>{key==="depositPaisa"?formatPrice(Number(value),language):typeof value==="boolean"?(value?t("Yes","हो"):t("No","होइन")):String(value)}</dd></div>)}</dl><p>{content.photos.length} {t("photos uploaded privately","तस्बिर निजी रूपमा अपलोड")}</p></div>
 <label className="check-label"><input type="checkbox" checked={content.phonePublic} onChange={event=>setContent({...content,phonePublic:event.target.checked,whatsapp:event.target.checked?content.whatsapp:false})}/>{t("Allow signed-in buyers to reveal my verified phone for this listing.","यस सूचीमा प्रवेश गरेका खरिदकर्तालाई मेरो प्रमाणित फोन देखाउन अनुमति।")}</label>
 <label className="check-label"><input type="checkbox" checked={content.whatsapp} onChange={event=>setContent({...content,whatsapp:event.target.checked})} disabled={!content.phonePublic}/>{t("Also allow WhatsApp contact","WhatsApp सम्पर्क पनि अनुमति")}</label>
 <label className="check-label"><input type="checkbox" checked={content.termsAccepted} onChange={event=>setContent({...content,termsAccepted:event.target.checked})}/><span>{t("I confirm accurate details and agree to the ","म विवरण सही भएको पुष्टि गर्छु र स्वीकार गर्छु: ")}<Link className="text-link" href="/policies" target="_blank">{t("posting terms and privacy notice","सूचीका सर्त र गोपनीयता सूचना")}</Link>.</span></label>
 <FieldError message={fieldErrors.termsAccepted}/><FieldError message={fieldErrors.whatsapp}/>
 <div className="info-panel"><p>{t("Submitting sends your listing for review. It will not appear publicly until approval. Seller role is self-declared; phone verification does not establish ownership.","पठाएपछि सूची समीक्षा हुन्छ। स्वीकृत नभएसम्म सार्वजनिक हुँदैन। विक्रेता भूमिका स्वघोषित हो; फोन प्रमाणीकरणले स्वामित्व पुष्टि गर्दैन।")}</p></div></>}
 {notice&&<p className="draft-notice" role="status">{notice}</p>}
 <div className="post-actions">{step>0?<button className="button secondary" onClick={()=>setStep(current=>current-1)} disabled={busy}>{t("Back","पछाडि")}</button>:<span/>}<button className="button secondary" onClick={save} disabled={busy}>{t("Save draft","मस्यौदा सुरक्षित")}</button>{step<3?<button className="button primary" onClick={next} disabled={busy}>{t("Continue","अगाडि")}</button>:<button className="button primary" onClick={submit} disabled={busy}>{busy?t("Submitting…","पठाउँदै…"):t("Submit for review","समीक्षामा पठाउनुहोस्")}</button>}</div></section></div></main>;
}
function FieldError({message}:{message?:string}){return message?<p className="form-error" role="alert">{message}</p>:null;}

function detailLabel(key:string,t:(en:string,ne:string)=>string){
 const labels:Record<string,string>={subtype:t("Rental type","भाडाको प्रकार"),bedrooms:t("Bedrooms","शयनकक्ष"),availableDate:t("Available from","उपलब्ध मिति"),water:t("Water arrangement","पानीको व्यवस्था"),bathroom:t("Bathroom arrangement","बाथरुमको व्यवस्था"),parking:t("Parking","पार्किङ"),charges:t("Additional charges","थप शुल्क"),brokerFee:t("Broker fee","दलाली शुल्क"),area:t("Land area","जग्गाको क्षेत्रफल"),areaUnit:t("Area unit","क्षेत्रफल एकाइ"),roadAccess:t("Road access","सडक पहुँच"),ownershipDeclared:t("Authorized to list","सूची राख्न अनुमति"),subcategory:t("Item type","सामानको प्रकार"),condition:t("Condition","अवस्था"),defects:t("Known defects","थाहा भएका कमजोरी"),pickup:t("Pickup arrangements","उठाउने व्यवस्था")};
 return labels[key]||t("Details","विवरण");
}
