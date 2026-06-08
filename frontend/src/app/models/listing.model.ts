export interface Listing {
  _id?: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  type: 'buyNow' | 'auction';
  price?: number;
  currentBid?: number;
  buyoutPrice?: number;
  auctionEnd?: string;
  condition: string;
  shippingInfo: string;
  slug: string;
}