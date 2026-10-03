import type { Listing } from "./market";
const photo = (id: string) => "https://images.unsplash.com/" + id + "?auto=format&fit=crop&w=1200&q=85";
export const listings: Listing[] = [
  {
    id:"sunlit-flat",category:"rent",title:{en:"A sunlit flat with room to settle in",ne:"उज्यालो र आरामदायी फ्ल्याट"},
    description:{en:"Illustrative rental listing for the design preview. Two bedrooms, a separate kitchen and a small balcony. Water arrangements and all charges must be confirmed with a real owner before an actual listing can be published.",ne:"डिजाइन पूर्वावलोकनका लागि नमुना भाडा सूची। दुई शयनकक्ष, छुट्टै भान्सा र सानो बाल्कोनी। वास्तविक प्रकाशनअघि पानी र सबै शुल्क पुष्टि गर्नुपर्छ।"},
    locality:{en:"Birendranagar",ne:"वीरेन्द्रनगर"},pricePaisa:1800000,
    image:photo("photo-1600210492486-724fe5c67fb0"),imageAlt:{en:"Illustrative bright living room with a sofa",ne:"सोफासहित उज्यालो बैठक कोठाको उदाहरण"},
    facts:{en:["2 bedrooms","Separate kitchen"],ne:["२ शयनकक्ष","छुट्टै भान्सा"]},
    sellerRole:{en:"Owner · sample",ne:"घरधनी · नमुना"},status:"available",depositPaisa:1800000,fees:{en:"No broker fee in this sample. Utilities excluded; actual charges need confirmation.",ne:"यस नमुनामा दलाली शुल्क छैन। उपयोगिता शुल्क छुट्टै; वास्तविक शुल्क पुष्टि गर्नुपर्छ।"}
  },
  {
    id:"family-house",category:"rent",title:{en:"A quiet home for your next chapter",ne:"नयाँ सुरुवातका लागि शान्त घर"},
    description:{en:"Illustrative house listing, with three bedrooms and outdoor space. The photograph is representative and is not a property in Surkhet. No seller contact or transaction is available in this preview.",ne:"तीन शयनकक्ष र बाहिरी ठाउँसहितको नमुना घर। तस्बिर उदाहरण मात्र हो, सुर्खेतको सम्पत्ति होइन। यस पूर्वावलोकनमा सम्पर्क वा कारोबार उपलब्ध छैन।"},
    locality:{en:"Surkhet",ne:"सुर्खेत"},pricePaisa:3200000,
    image:photo("photo-1600596542815-ffad4c1539a9"),imageAlt:{en:"Illustrative house exterior with garden",ne:"बगैँचासहित घरको बाहिरी भागको उदाहरण"},
    facts:{en:["3 bedrooms","Outdoor space"],ne:["३ शयनकक्ष","बाहिरी ठाउँ"]},
    sellerRole:{en:"Owner · sample",ne:"घरधनी · नमुना"},status:"available",depositPaisa:3200000,fees:{en:"Broker fee: NPR 0 in this example. Utility costs are not specified.",ne:"यस उदाहरणमा दलाली शुल्क: रु. ०। उपयोगिता खर्च उल्लेख गरिएको छैन।"}
  },
  {
    id:"green-plot",category:"land",title:{en:"Space to build something of your own",ne:"आफ्नो घर बनाउन खुला जग्गा"},
    description:{en:"Illustrative land-sale listing demonstrating area, access and fee disclosures. Area is shown in its original unit. No ownership or title verification is claimed. The image does not identify a real plot for sale.",ne:"क्षेत्रफल, पहुँच र शुल्क देखाउने नमुना जग्गा सूची। क्षेत्रफल मूल एकाइमा छ। स्वामित्व वा लालपुर्जा प्रमाणित भएको दाबी छैन। तस्बिर वास्तविक बिक्रीको जग्गा होइन।"},
    locality:{en:"Birendranagar",ne:"वीरेन्द्रनगर"},pricePaisa:450000000,
    image:photo("photo-1500382017468-9049fed747ef"),imageAlt:{en:"Illustrative green open land",ne:"खुला हरियो जग्गाको उदाहरण"},
    facts:{en:["8 aana","Road access: illustrative"],ne:["८ आना","सडक पहुँच: उदाहरण"]},
    sellerRole:{en:"Broker · sample",ne:"दलाल · नमुना"},status:"available",fees:{en:"Broker fee: 1% in this sample only. Buyer must investigate actual ownership and terms.",ne:"यस नमुनामा मात्र दलाली शुल्क १%। वास्तविक स्वामित्व र सर्त खरिदकर्ताले जाँच गर्नुपर्छ।"}
  },
  {
    id:"linen-sofa",category:"items",title:{en:"A well-loved sofa, ready for a new home",ne:"नयाँ घरका लागि आरामदायी सोफा"},
    description:{en:"Illustrative secondhand sofa with light wear on the armrest. Includes two cushions. Condition and defects are examples to show how honest seller descriptions will appear. This item is not actually for sale.",ne:"हात राख्ने भागमा हल्का घिसावट भएको नमुना पुरानो सोफा। दुई कुशनसहित। अवस्था र कमजोरी उदाहरण हुन्। यो सामान वास्तविक बिक्रीमा छैन।"},
    locality:{en:"Birendranagar",ne:"वीरेन्द्रनगर"},pricePaisa:1450000,
    image:photo("photo-1555041469-a586c61ea9bc"),imageAlt:{en:"Illustrative green fabric sofa",ne:"हरियो कपडाको सोफाको उदाहरण"},
    facts:{en:["Good condition","Local pickup"],ne:["राम्रो अवस्था","स्थानीय उठान"]},condition:{en:"Light armrest wear; no other known defects in this example.",ne:"हात राख्ने भागमा हल्का घिसावट; यस उदाहरणमा अरू कमजोरी थाहा छैन।"},
    sellerRole:{en:"Individual · sample",ne:"व्यक्ति · नमुना"},status:"available",fees:{en:"Pickup only in this example. No delivery service.",ne:"यस उदाहरणमा आफैँ उठाउनुपर्ने। ढुवानी सेवा छैन।"}
  },
  {
    id:"everyday-chair",category:"items",title:{en:"A comfortable corner for everyday life",ne:"दैनिक जीवनका लागि आरामदायी कुर्सी"},
    description:{en:"Illustrative accent chair with a fabric seat and wooden legs. Minor scratches on one leg. The photo and asking price are sample content, not a real offer.",ne:"कपडाको सिट र काठको खुट्टा भएको नमुना कुर्सी। एउटा खुट्टामा साना कोरिएका दाग। तस्बिर र मूल्य उदाहरण मात्र हुन्।"},
    locality:{en:"Surkhet",ne:"सुर्खेत"},pricePaisa:650000,
    image:photo("photo-1567538096630-e0c55bd6374c"),imageAlt:{en:"Illustrative upholstered chair",ne:"कपडाले ढाकिएको कुर्सीको उदाहरण"},
    facts:{en:["Good condition","Minor scratches"],ne:["राम्रो अवस्था","साना कोरिएका दाग"]},condition:{en:"Minor scratches on one leg.",ne:"एउटा खुट्टामा साना कोरिएका दाग।"},
    sellerRole:{en:"Individual · sample",ne:"व्यक्ति · नमुना"},status:"available",fees:{en:"Local pickup. No platform checkout.",ne:"स्थानीय उठान। प्लेटफर्मबाट भुक्तानी छैन।"}
  },
  {
    id:"camera-kit",category:"items",title:{en:"Capture your next adventure",ne:"अर्को यात्राका सम्झना कैद गर्नुहोस्"},
    description:{en:"Illustrative used camera kit. Camera body, lens and strap included. Battery life needs checking; no warranty claim. This sample does not represent a real seller or available camera.",ne:"नमुना पुरानो क्यामेरा सेट। क्यामेरा, लेन्स र पट्टा समावेश। ब्याट्री जाँच गर्नुपर्छ; वारेन्टी दाबी छैन। यो वास्तविक विक्रेता वा उपलब्ध क्यामेरा होइन।"},
    locality:{en:"Birendranagar",ne:"वीरेन्द्रनगर"},pricePaisa:2800000,
    image:photo("photo-1516035069371-29a1b244cc32"),imageAlt:{en:"Illustrative camera and lens",ne:"क्यामेरा र लेन्सको उदाहरण"},
    facts:{en:["Fair condition","Lens included"],ne:["ठीकठाक अवस्था","लेन्ससहित"]},condition:{en:"Battery life untested. Inspect before any real purchase.",ne:"ब्याट्री परीक्षण गरिएको छैन। वास्तविक खरिदअघि जाँच गर्नुहोस्।"},
    sellerRole:{en:"Individual · sample",ne:"व्यक्ति · नमुना"},status:"available",fees:{en:"Local pickup. No delivery or payment processing.",ne:"स्थानीय उठान। ढुवानी वा भुक्तानी सेवा छैन।"}
  }
];
