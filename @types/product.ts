export type Product = {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT';
  categoryId: number;
  shortDesc?: string | null;
  fullDesc?: string | null;
  category: { id: number; name: string } | null;
  images: { id: number; url: string; sortOrder: number }[];
  items: {
    id: number;
    sku: string;
    price: number;
    inventory: { id: number; quantity: number };
  }[];
};
