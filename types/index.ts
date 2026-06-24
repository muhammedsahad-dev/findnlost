export type ItemType = "lost" | "found";
export type ItemStatus = "open" | "claimed" | "removed";

export const CATEGORIES = [
  "ID Card / Student Card",
  "Keys",
  "Electronics",
  "Books / Notes",
  "Bag / Backpack",
  "Clothing",
  "Drinkware",
  "Stationery",
  "Jewellery / Accessories",
  "Wallet / Purse",
  "Sports Equipment",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  category: Category;
  location: string;
  date_occurred: string;
  image_url: string | null;
  contact_info: string;
  storage_location?: string | null;
  status: ItemStatus;
  posted_by: string | null;
  created_at: string;
  updated_at: string;
  users?: {
    email: string;
  } | null;
}

export interface ItemsResponse {
  items: Item[];
  total: number;
  page: number;
  totalPages: number;
}

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    role?: string;
  };
  app_metadata?: {
    role?: string;
  };
}
