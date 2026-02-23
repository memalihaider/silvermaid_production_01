// /app/admin/products/lib/products-data.ts

export type UnitType = 'Litre' | 'Kg' | 'Unit' | 'Pack' | 'Box' | 'Roll' | 'Hour' | 'SqFt';

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  itemCount: number;
}

export interface InventoryLog {
  id: string;
  timestamp: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  reason: string;
  user: string;
}

export interface ProductItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  type: 'PRODUCT' | 'SERVICE';
  price: number;
  cost: number;
  unit: UnitType;
  stock: number;
  minStock: number;
  status: 'ACTIVE' | 'ARCHIVED' | 'OUT_OF_STOCK';
  lastUpdated: string;
  history?: InventoryLog[];
}

export const PRODUCT_CATEGORIES: Category[] = [
  { id: 'cat_1', name: 'Cleaning Supplies', description: 'Detergents, soaps and chemicals', color: '#3b82f6', itemCount: 12 },
  { id: 'cat_2', name: 'Equipment & Tools', description: 'Vacuum cleaners, mops and brushes', color: '#f59e0b', itemCount: 8 },
  { id: 'cat_3', name: 'Safety Gear', description: 'Gloves, masks and specialized suits', color: '#ef4444', itemCount: 5 },
  { id: 'cat_4', name: 'Maintenance', description: 'Repair kits and spare parts', color: '#10b981', itemCount: 3 },
];

export const MOCK_PRODUCTS: ProductItem[] = [
  {
    id: 'prod_1',
    sku: 'HW-CLN-001',
    name: 'Professional Cleaning Solution',
    description: 'Concentrated eco-friendly cleaning logic for all surfaces.',
    categoryId: 'cat_1',
    categoryName: 'Cleaning Supplies',
    type: 'PRODUCT',
    price: 45.00,
    cost: 15.00,
    unit: 'Litre',
    stock: 120,
    minStock: 20,
    status: 'ACTIVE',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'prod_2',
    sku: 'HW-CLN-002',
    name: 'Heavy Duty Degreaser',
    description: 'Industrial strength degreaser for kitchens and workshops.',
    categoryId: 'cat_1',
    categoryName: 'Cleaning Supplies',
    type: 'PRODUCT',
    price: 65.00,
    cost: 22.50,
    unit: 'Litre',
    stock: 15,
    minStock: 25,
    status: 'ACTIVE',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'svc_1',
    sku: 'HW-SVC-001',
    name: 'Deep Cleaning Service',
    description: 'Complete home deep cleaning including windows and balcony.',
    categoryId: 'cat_1',
    categoryName: 'Cleaning Supplies',
    type: 'SERVICE',
    price: 450.00,
    cost: 200.00,
    unit: 'Unit',
    stock: 0,
    minStock: 0,
    status: 'ACTIVE',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'prod_3',
    sku: 'HW-EQP-001',
    name: 'Industrial Vacuum Cleaner',
    description: 'High suction power vacuum for commercial use.',
    categoryId: 'cat_2',
    categoryName: 'Equipment & Tools',
    type: 'PRODUCT',
    price: 1200.00,
    cost: 850.00,
    unit: 'Unit',
    stock: 5,
    minStock: 2,
    status: 'ACTIVE',
    lastUpdated: new Date().toISOString()
  }
];

export const STORAGE_KEYS = {
  PRODUCTS: 'silvermaid_products_v2',
  CATEGORIES: 'silvermaid_categories_v2',
  PREFERENCES: 'silvermaid_product_prefs'
};
