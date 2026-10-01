import test from "node:test";
import assert from "node:assert/strict";
import { toPaisa, filterListings, filtersFromParams, filtersToParams, defaultFilters, validateDraft, emptyDraft } from "../src/lib/market.ts";
import type { Listing } from "../src/lib/market.ts";
const example: Listing = {id:"one",category:"items",pricePaisa:1050,title:{en:"Wooden chair",ne:"काठको कुर्सी"},description:{en:"A comfortable chair",ne:"आरामदायी कुर्सी"},locality:{en:"Birendranagar",ne:"वीरेन्द्रनगर"},image:"",imageAlt:{en:"",ne:""},facts:{en:[],ne:[]},sellerRole:{en:"",ne:""},status:"available",fees:{en:"",ne:""}};
test("money preserves decimals without floating point multiplication errors",()=>{ assert.equal(toPaisa("10.50"),1050); assert.equal(toPaisa("0.29"),29); for(const invalid of ["-1","1e3","Infinity","0.001","", "999999999999999999999"]) assert.equal(toPaisa(invalid),null); });
test("combined bilingual search, price and locality exclude unavailable inventory",()=>{
 const sold={...example,id:"sold",status:"sold" as const};
 assert.equal(filterListings([example,sold],{...defaultFilters,query:"कुर्सी",min:"10",max:"11",locality:"Birendranagar"}).length,1);
 assert.equal(filterListings([example],{...defaultFilters,category:"rent"}).length,0);
 assert.equal(filterListings([example],{...defaultFilters,query:"chair",max:"10"}).length,0);
});
test("URL state roundtrips and untrusted enum values are normalized",()=>{
 const filters={...defaultFilters,category:"items",query:"कुर्सी",sort:"price-asc",min:"10"};
 assert.deepEqual(filtersFromParams(new URLSearchParams(filtersToParams(filters))),filters);
 const normalized=filtersFromParams(new URLSearchParams("category=bad&sort=bad&min=-1"));
 assert.equal(normalized.category,"all");assert.equal(normalized.sort,"recommended");assert.equal(normalized.min,"");
});
test("draft preview rejects missing costs and supports explicit zero deposit",()=>{
 const draft={...emptyDraft,title:"A bright rental flat",description:"A clear description with enough information for the preview.",price:"12000",locality:"Birendranagar",detail:"Two bedrooms",role:"owner",fee:"No broker fee",deposit:"0"};
 assert.deepEqual(validateDraft(draft),[]);
 assert.ok(validateDraft({...draft,deposit:""}).includes("deposit"));
 assert.ok(validateDraft({...draft,price:"0"}).includes("price"));
});
