import { notFound } from "next/navigation";
import { publicListings } from "@/server/catalog";
import { ListingDetail } from "@/components/listing-detail";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = (await publicListings()).find(item => item.id === id);
  return { title: listing ? listing.title.en : "Listing unavailable" };
}
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = (await publicListings()).find(item => item.id === id);
  if (!listing) notFound();
  return <ListingDetail listing={listing}/>;
}
