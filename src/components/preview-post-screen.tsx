"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Check, House, Trees, Armchair, Upload, X, Info, Save } from "lucide-react";
import { useMarket } from "./market-provider";
import { emptyDraft, formatPrice, toPaisa, validateDraft } from "@/lib/market";
import type { Category, Draft } from "@/lib/market";
const storageKey="surkhet-local-draft-v1";
export function PreviewPostScreen() {
 const {t,language}=useMarket();
 const [draft,setDraft]=useState<Draft>(emptyDraft);
 const [step,setStep]=useState(0);
 const [errors,setErrors]=useState<string[]>([]);
 const [notice,setNotice]=useState("");
 const [ready,setReady]=useState(false);
 const [photoUrls,setPhotoUrls]=useState<string[]>([]);
 const urls=useRef<string[]>([]);
 const heading=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{
  try{
   const parsed:unknown=JSON.parse(localStorage.getItem(storageKey)||"null");
   if(parsed&&typeof parsed==="object"){
    const candidate=parsed as Record<string,unknown>;
    const restored={...emptyDraft};
    for(const key of ["title","description","price","locality","detail","deposit","fee","role"] as const) if(typeof candidate[key]==="string")restored[key]=candidate[key].slice(0,3000);
    if(["rent","land","items"].includes(String(candidate.category)))restored.category=candidate.category as Category;
    setDraft(restored);
   }
  }catch{setNotice(t("A previous draft could not be loaded. You can start a new one.","अघिल्लो मस्यौदा खोल्न सकिएन। नयाँ सुरु गर्न सकिन्छ।"));}
  setReady(true);
  return ()=>{urls.current.forEach(url=>URL.revokeObjectURL(url));};
 },[]); // Storage restore runs once; translated notices reflect the initial UI language.
 function update<K extends keyof Draft>(key:K,value:Draft[K]) {setDraft(current=>({...current,[key]:value}));setErrors(current=>current.filter(error=>error!==key));}
 function go(next:number){setStep(next);requestAnimationFrame(()=>heading.current?.focus());}
 function next(){
  if(step===1){const invalid=validateDraft(draft);if(invalid.length){setErrors(invalid);setNotice(t("Please check the highlighted details.","चिन्ह लगाइएका विवरण जाँच गर्नुहोस्।"));return;}}
  setNotice("");go(Math.min(step+1,3));
 }
 function save(){
  try{localStorage.setItem(storageKey,JSON.stringify({...draft,photos:[]}));setNotice(t("Text draft saved on this device. Photos are temporary and not saved.","पाठ मस्यौदा यस उपकरणमा राखियो। तस्बिर अस्थायी हुन् र सुरक्षित हुँदैनन्।"));}
  catch{setNotice(t("This browser could not save your draft. Keep this page open to retain your work.","ब्राउजरले मस्यौदा राख्न सकेन। काम राख्न यो पृष्ठ खुला राख्नुहोस्।"));}
 }
 function addPhotos(event:React.ChangeEvent<HTMLInputElement>){
  const accepted=Array.from(event.target.files||[]);
  if(accepted.some(file=>!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>10*1024*1024)){setNotice(t("Use JPEG, PNG or WebP files up to 10 MB each.","JPEG, PNG वा WebP तस्बिर प्रयोग गर्नुहोस्, प्रत्येक १० MB सम्म।"));event.target.value="";return;}
  if(photoUrls.length+accepted.length>10){setNotice(t("Choose up to 10 photos.","१० तस्बिरसम्म छान्नुहोस्।"));event.target.value="";return;}
  const next=[...photoUrls,...accepted.map(file=>URL.createObjectURL(file))];urls.current=next;setPhotoUrls(next);setNotice(t("Photos stay in this tab only. They are not uploaded.","तस्बिर यस ट्याबमा मात्र रहन्छन्। अपलोड हुँदैनन्।"));event.target.value="";
 }
 function removePhoto(index:number){URL.revokeObjectURL(photoUrls[index]);const next=photoUrls.filter((_,i)=>i!==index);urls.current=next;setPhotoUrls(next);}
 function clear(){
  try{localStorage.removeItem(storageKey);}catch{setNotice(t("Could not remove the saved draft.","सुरक्षित मस्यौदा हटाउन सकिएन।"));return;}
  urls.current.forEach(url=>URL.revokeObjectURL(url));urls.current=[];setPhotoUrls([]);setDraft(emptyDraft);setErrors([]);setNotice(t("Local draft cleared.","स्थानीय मस्यौदा हटाइयो।"));go(0);
 }
 const labels=[t("Category","वर्ग"),t("Details","विवरण"),t("Photos","तस्बिर"),t("Review","समीक्षा")];
 const errorText:Record<string,string>={title:t("Use 10–100 characters.","१०–१०० अक्षर प्रयोग गर्नुहोस्।"),description:t("Use 30–3,000 characters.","३०–३,००० अक्षर प्रयोग गर्नुहोस्।"),price:t("Enter a positive NPR amount with up to 2 decimals.","२ दशमलवसम्मको सकारात्मक रुपैयाँ दिनुहोस्।"),locality:t("Choose a sample locality.","नमुना ठाउँ छान्नुहोस्।"),detail:t("Add the category-specific details.","वर्गअनुसार विवरण दिनुहोस्।"),role:t("Choose your seller role.","विक्रेता भूमिका छान्नुहोस्।"),fee:t("State fees or explicitly say none.","शुल्क लेख्नुहोस् वा स्पष्ट रूपमा छैन भन्नुहोस्।"),deposit:t("State a deposit amount, including 0 if none.","धरौटी रकम दिनुहोस्; नभए ०।")};
 function field(key:keyof Draft,label:string,placeholder:string,multiline=false){
  const invalid=errors.includes(key);
  const props={id:key,value:String(draft[key]),onChange:(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>)=>update(key,e.target.value as never),placeholder,"aria-invalid":invalid,"aria-describedby":invalid?key+"-error":undefined};
  return <div className={"form-field "+(invalid?"invalid":"")}><label htmlFor={key}>{label}</label>{multiline?<textarea {...props} rows={key==="description"?5:3} maxLength={key==="description"?3000:1000}/>:<input {...props} inputMode={key==="price"||key==="deposit"?"decimal":undefined} maxLength={key==="title"?100:250}/>} {invalid&&<span id={key+"-error"} className="form-error">{errorText[key]}</span>}</div>;
 }
 return <main id="main" className="container post-page"><div className="post-intro"><div className="eyebrow">{t("LET'S MAKE A GOOD LISTING","राम्रो सूची बनाऔँ")}</div><h1>{t("A little detail.","थोरै विवरण।")} <span>{t("A lot of possibility.","धेरै सम्भावना।")}</span></h1><p>{t("Try the posting flow. Your text draft stays on this device; nothing will be published.","सूची बनाउने अनुभव लिनुहोस्। पाठ मस्यौदा उपकरणमै रहन्छ; प्रकाशन हुँदैन।")}</p></div><div className="post-layout"><aside className="post-sidebar"><ol className="step-list">{labels.map((label,index)=><li className={index===step?"current":index<step?"complete":""} key={label}><span>{index<step?<Check size={15}/>:index+1}</span>{label}</li>)}</ol><div className="info-panel"><Info size={19}/><p>{t("Design preview. Real publishing will require phone verification and moderation. Do not enter sensitive information.","डिजाइन पूर्वावलोकन। वास्तविक प्रकाशनका लागि फोन प्रमाणीकरण र समीक्षा चाहिन्छ। संवेदनशील जानकारी नदिनुहोस्।")}</p></div></aside><div className="post-form"><h2 ref={heading} tabIndex={-1}>{step===0?t("What would you like to list?","के सूची राख्न चाहनुहुन्छ?"):step===1?t("Help someone see the fit.","अरूलाई बुझ्न सहयोग गर्नुहोस्।"):step===2?t("Show it clearly.","स्पष्ट देखाउनुहोस्।"):t("Give it one last look.","अन्तिम पटक हेर्नुहोस्।")}</h2>
 {step===0&&<fieldset className="category-options"><legend className="sr-only">{t("Listing category","सूचीको वर्ग")}</legend>{[{id:"rent",Icon:House,label:t("A home for rent","भाडाको घर"),body:t("Room, flat or house","कोठा, फ्ल्याट वा घर")},{id:"land",Icon:Trees,label:t("Land for sale","जग्गा बिक्री"),body:t("A plot with possibilities","सम्भावना बोकेको जग्गा")},{id:"items",Icon:Armchair,label:t("A secondhand item","पुरानो सामान"),body:t("Useful things, a new home","उपयोगी सामान, नयाँ घर")}].map(({id,Icon,label,body})=><label className={"category-option "+(draft.category===id?"selected":"")} key={id}><input type="radio" name="posting-category" checked={draft.category===id} onChange={()=>{setDraft(current=>({...emptyDraft,category:id as Category,title:current.title,description:current.description}));setErrors([]);}}/><Icon size={23}/><span><strong>{label}</strong><small>{body}</small></span><span className="radio-indicator"/></label>)}</fieldset>}
 {step===1&&<div className="posting-fields">{field("title",t("Listing title","सूचीको शीर्षक"),t("A clear, specific title","स्पष्ट शीर्षक"))}{field("description",t("Description","विवरण"),t("What should someone know before contacting you?","सम्पर्कअघि के थाहा हुनुपर्छ?"),true)}<div className="form-columns">{field("price",draft.category==="rent"?t("Monthly rent (NPR)","मासिक भाडा (रु.)"):t("Total asking price (NPR)","कुल माग मूल्य (रु.)"),"18000")}<div className={"form-field "+(errors.includes("locality")?"invalid":"")}><label htmlFor="draft-locality">{t("Sample locality","नमुना ठाउँ")}</label><select id="draft-locality" value={draft.locality} onChange={e=>update("locality",e.target.value)} aria-invalid={errors.includes("locality")} aria-describedby={errors.includes("locality")?"locality-error":undefined}><option value="">{t("Choose an area","ठाउँ छान्नुहोस्")}</option><option value="Birendranagar">{t("Birendranagar","वीरेन्द्रनगर")}</option><option value="Surkhet">{t("Surkhet","सुर्खेत")}</option></select>{errors.includes("locality")&&<span id="locality-error" className="form-error">{errorText.locality}</span>}</div></div>{field("detail",draft.category==="rent"?t("Rooms, water, bathroom & parking","कोठा, पानी, बाथरुम र पार्किङ"):draft.category==="land"?t("Area with unit & road access","एकाइसहित क्षेत्रफल र सडक पहुँच"):t("Condition, defects & pickup","अवस्था, कमजोरी र उठाउने ठाउँ"),t("State the details honestly.","सही विवरण दिनुहोस्।"),true)}{draft.category==="rent"&&field("deposit",t("Deposit (NPR; 0 if none)","धरौटी (रु.; नभए ०)"),"0")}<div className="form-field"><label htmlFor="role">{t("Your role","तपाईंको भूमिका")}</label><select id="role" value={draft.role} onChange={e=>update("role",e.target.value)} aria-invalid={errors.includes("role")} aria-describedby={errors.includes("role")?"role-error":undefined}><option value="">{t("Choose a role","भूमिका छान्नुहोस्")}</option>{(draft.category==="items"?[{id:"individual",label:t("Individual","व्यक्ति")},{id:"shop",label:t("Shop","पसल")}]:[{id:"owner",label:t("Owner","धनी")},{id:"broker",label:t("Broker","दलाल")}]).map(role=><option key={role.id} value={role.id}>{role.label}</option>)}</select>{errors.includes("role")&&<span id="role-error" className="form-error">{errorText.role}</span>}</div>{field("fee",draft.category==="items"?t("Pickup or other charges","उठान वा अन्य शुल्क"):t("Broker fee & additional charges","दलाली र थप शुल्क"),t("Explicitly state none, included, fixed or usage-based.","छैन, समावेश, निश्चित वा प्रयोगअनुसार स्पष्ट लेख्नुहोस्।"),true)}</div>}
 {step===2&&<><p className="muted">{t("Use clear, actual photos. For this preview, photos stay temporarily in this tab and are not uploaded or saved.","स्पष्ट वास्तविक तस्बिर प्रयोग गर्नुहोस्। पूर्वावलोकनमा तस्बिर ट्याबमा अस्थायी रहन्छन्; अपलोड वा सुरक्षित हुँदैनन्।")}</p><label className="upload-zone"><Upload size={27}/><strong>{t("Choose photos","तस्बिर छान्नुहोस्")}</strong><span>{t("JPEG, PNG or WebP · 10 MB each · Up to 10","JPEG, PNG वा WebP · प्रत्येक १० MB · १० सम्म")}</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addPhotos}/></label><div className="draft-photos">{photoUrls.map((url,index)=><div key={url}><Image src={url} alt={t("Draft photo "+(index+1),"मस्यौदा तस्बिर "+(index+1))} fill unoptimized sizes="150px" style={{objectFit:"cover"}}/><button className="save-button" onClick={()=>removePhoto(index)} aria-label={t("Remove photo "+(index+1),"तस्बिर हटाउनुहोस् "+(index+1))}><X size={16}/></button></div>)}</div></>}
 {step===3&&<div className="draft-review"><span className="category-badge static">{t("LOCAL DRAFT · NOT PUBLISHED","स्थानीय मस्यौदा · प्रकाशित छैन")}</span><h3>{draft.title}</h3><p className="review-price">{formatPrice(toPaisa(draft.price)||0,language)}{draft.category==="rent"&&<small>{t(" / month"," / महिना")}</small>}</p><p>{draft.locality}</p><p>{draft.description}</p><dl className="cost-list"><div><dt>{t("Details","विवरण")}</dt><dd>{draft.detail}</dd></div>{draft.category==="rent"&&<div><dt>{t("Deposit","धरौटी")}</dt><dd>{formatPrice(toPaisa(draft.deposit)||0,language)}</dd></div>}<div><dt>{t("Charges","शुल्क")}</dt><dd>{draft.fee}</dd></div><div><dt>{t("Role","भूमिका")}</dt><dd>{draft.role==="owner"?t("Owner","धनी"):draft.role==="broker"?t("Broker","दलाल"):draft.role==="shop"?t("Shop","पसल"):t("Individual","व्यक्ति")}</dd></div><div><dt>{t("Temporary photos","अस्थायी तस्बिर")}</dt><dd>{photoUrls.length}</dd></div></dl><div className="info-panel"><Info size={18}/><p>{t("This is a layout preview, not a publishable submission. The backend phase will add structured category fields, identity, contact consent and moderation.","यो लेआउट पूर्वावलोकन हो, प्रकाशनयोग्य सूची होइन। अर्को चरणले विस्तृत वर्ग विवरण, पहिचान, सम्पर्क सहमति र समीक्षा थप्नेछ।")}</p></div></div>}
 {notice&&<p className="draft-notice" role="status">{notice}</p>}
 <div className="post-actions">{step>0?<button className="button secondary" onClick={()=>go(step-1)}><ArrowLeft size={16}/>{t("Back","पछाडि")}</button>:<span/>}<button className="button secondary" onClick={save} disabled={!ready}><Save size={16}/>{t("Save draft","मस्यौदा राख्नुहोस्")}</button>{step<3?<button className="button primary" onClick={next} disabled={!ready}>{t("Continue","अगाडि")}<ArrowRight size={16}/></button>:<button className="button primary" onClick={save}><Check size={16}/>{t("Save text draft","पाठ मस्यौदा राख्नुहोस्")}</button>}</div><button className="reset-button clear-draft" onClick={clear} disabled={!ready}>{t("Clear local draft","स्थानीय मस्यौदा हटाउनुहोस्")}</button>
 </div></div></main>;
}
