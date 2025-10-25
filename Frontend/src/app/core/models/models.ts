// User and Auth Models
export interface User {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Product Models
export interface Product {
  productId: number;
  productName: string;
  productCode: string;
  categoryId?: number;
  categoryName?: string;
  description?: string;
  unitPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  unit: string;
  imageUrl?: string;
  isActive: boolean;
  isLowStock?: boolean;
}

export interface CreateProductRequest {
  productName: string;
  productCode: string;
  categoryId?: number;
  description?: string;
  unitPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  unit: string;
  imageUrl?: string;
}

export interface UpdateProductRequest {
  productName: string;
  categoryId?: number;
  description?: string;
  unitPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  unit: string;
  imageUrl?: string;
  isActive: boolean;
}

// Invoice Models
export interface Invoice {
  invoiceId: number;
  invoiceNumber: string;
  customerId?: number;
  customerName?: string;
  userName: string;
  invoiceDate: Date;
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  invoiceItemId?: number;
  productId: number;
  productName?: string;
  productCode?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CreateInvoiceRequest {
  customerId?: number;
  taxAmount: number;
  discountAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  items: CreateInvoiceItemRequest[];
}

export interface CreateInvoiceItemRequest {
  productId: number;
  quantity: number;
}

// Customer Models
export interface Customer {
  customerId: number;
  customerName: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface CreateCustomerRequest {
  customerName: string;
  email?: string;
  phone?: string;
  address?: string;
}

// Analytics Models
export interface DashboardStats {
  todaySales: number;
  todayInvoices: number;
  lowStockProductsCount: number;
  totalProducts: number;
  totalCustomers: number;
  monthSales: number;
  activeAlerts: number;
}

export interface SalesReport {
  period: string;
  totalSales: number;
  totalInvoices: number;
  averageSale: number;
}

export interface TopProduct {
  productId: number;
  productName: string;
  productCode: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface StockAlert {
  alertId: number;
  productId: number;
  productName: string;
  productCode: string;
  alertType: string;
  alertMessage?: string;
  currentStock: number;
  minStockLevel: number;
  createdAt: Date;
}

export interface Category {
  categoryId: number;
  categoryName: string;
  description?: string;
  productCount?: number;
}
