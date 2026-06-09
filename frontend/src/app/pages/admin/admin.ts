import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { injectApiBaseUrl } from '../../services/api-base';

type AdminUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role?: 'user' | 'admin';
  createdAt?: string;
};

type AdminInventoryItem = {
  id: string;
  source: 'product';
  name: string;
  price: number;
  discountPercent: number;
  showDiscountBadge: boolean;
  stock: number;
  category?: string;
  createdAt?: string;
};

type AdminStats = {
  totalUsers: number;
  totalAdmins: number;
  totalProducts: number;
  totalOrders: number;
  totalStockUnits: number;
  totalInventoryValue: number;
  lowStockProducts: number;
};

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class AdminComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly apiBase = `${injectApiBaseUrl()}/admin`;

  usersLoading = true;
  statsLoading = true;
  inventoryLoading = true;
  creatingProduct = false;

  users: AdminUser[] = [];
  inventory: AdminInventoryItem[] = [];
  stockDraft: Record<string, number> = {};
  discountDraft: Record<string, number> = {};
  badgeDraft: Record<string, boolean> = {};
  stockSaving: Record<string, boolean> = {};
  pricingSaving: Record<string, boolean> = {};

  userSearch = '';
  selectedRole: 'all' | 'admin' | 'user' = 'all';

  maintenanceMessage = '';
  maintenanceError = '';

  productName = '';
  productPrice: number | null = null;
  productStock: number | null = null;
  productDescription = '';
  productImage = '';
  productModelFile = '';
  productAuction = false;
  productMessage = '';
  productError = '';

  stockMessage = '';
  stockError = '';
  readonly discountOptions = [0, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90];

  stats: AdminStats = {
    totalUsers: 0,
    totalAdmins: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalStockUnits: 0,
    totalInventoryValue: 0,
    lowStockProducts: 0
  };

  ngOnInit(): void {
    this.refreshAll();
  }

  get filteredUsers(): AdminUser[] {
    const query = this.userSearch.trim().toLowerCase();

    return this.users.filter((user) => {
      const roleMatch = this.selectedRole === 'all' || (user.role ?? 'user') === this.selectedRole;
      if (!roleMatch) return false;

      if (!query) return true;

      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      return fullName.includes(query) || user.email.toLowerCase().includes(query);
    });
  }

  get inventoryValueLabel(): string {
    return this.formatCurrency(this.stats.totalInventoryValue || 0);
  }

  refreshAll(): void {
    this.loadUsers();
    this.loadStats();
    this.loadInventory();
  }

  stockKey(item: AdminInventoryItem): string {
    return `${item.source}:${item.id}`;
  }

  currentStockDraft(item: AdminInventoryItem): number {
    const key = this.stockKey(item);
    return this.stockDraft[key] ?? item.stock;
  }

  adjustStock(item: AdminInventoryItem, delta: number): void {
    const key = this.stockKey(item);
    const current = Number(this.stockDraft[key] ?? item.stock);
    this.stockDraft[key] = Math.max(0, current + delta);
  }

  setDiscount(item: AdminInventoryItem, value: number): void {
    const key = this.stockKey(item);
    this.discountDraft[key] = value;

    if (value <= 0) {
      this.badgeDraft[key] = false;
    }
  }

  updateStock(item: AdminInventoryItem): void {
    this.stockMessage = '';
    this.stockError = '';

    const key = this.stockKey(item);
    const value = Number(this.stockDraft[key]);

    if (!Number.isInteger(value) || value < 0) {
      this.stockError = 'Stock must be a whole number >= 0.';
      return;
    }

    this.stockSaving[key] = true;

    this.http.patch<{ message: string; item: AdminInventoryItem }>(
      `${this.apiBase}/inventory/${item.source}/${item.id}/stock`,
      { stock: value },
      this.requestOptions()
    ).subscribe({
      next: (response) => {
        this.stockSaving[key] = false;
        this.stockMessage = response.message || 'Stock updated.';
        this.applyInventoryItem(response.item);
        this.loadStats();
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.stockSaving[key] = false;
        this.stockError = error?.error?.message || 'Could not update stock.';
        this.cdr.markForCheck();
      }
    });
  }

  updatePricing(item: AdminInventoryItem): void {
    this.stockMessage = '';
    this.stockError = '';

    const key = this.stockKey(item);
    const discountPercent = Number(this.discountDraft[key] || 0);
    const showDiscountBadge = discountPercent > 0 && Boolean(this.badgeDraft[key]);

    if (!Number.isInteger(discountPercent) || discountPercent < 0 || discountPercent > 95) {
      this.stockError = 'Discount must be a whole percent from 0 to 95.';
      return;
    }

    this.pricingSaving[key] = true;

    this.http.patch<{ message: string; item: AdminInventoryItem }>(
      `${this.apiBase}/inventory/${item.source}/${item.id}/pricing`,
      { discountPercent, showDiscountBadge },
      this.requestOptions()
    ).subscribe({
      next: (response) => {
        this.pricingSaving[key] = false;
        this.stockMessage = response.message || 'Pricing updated.';
        this.applyInventoryItem(response.item);
        this.loadStats();
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.pricingSaving[key] = false;
        this.stockError = error?.error?.message || 'Could not update pricing.';
        this.cdr.markForCheck();
      }
    });
  }

  private applyInventoryItem(item: AdminInventoryItem): void {
    const key = this.stockKey(item);
    this.inventory = this.inventory.map((current) => (this.stockKey(current) === key ? item : current));
    this.stockDraft[key] = Number(item.stock || 0);
    this.discountDraft[key] = Number(item.discountPercent || 0);
    this.badgeDraft[key] = Boolean(item.showDiscountBadge);
  }

  discountedPrice(item: AdminInventoryItem): number {
    const key = this.stockKey(item);
    const discountPercent = Number(this.discountDraft[key] || 0);
    return Math.round(item.price * (100 - discountPercent)) / 100;
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'Unknown';

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return 'Unknown';

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(parsed);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(value || 0);
  }

  addProduct(): void {
    this.productMessage = '';
    this.productError = '';

    const name = this.productName.trim();
    const price = Number(this.productPrice);
    const stock = Number(this.productStock);

    if (!name) {
      this.productError = 'Product name is required.';
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      this.productError = 'Price must be zero or higher.';
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      this.productError = 'Stock must be a whole number >= 0.';
      return;
    }

    this.creatingProduct = true;

    this.http.post(`${this.apiBase}/products`, {
      name,
      price,
      stock,
      description: this.productDescription.trim(),
      image: this.productImage.trim(),
      modelFile: this.productModelFile.trim(),
      isAuction: this.productAuction
    }, this.requestOptions()).subscribe({
      next: () => {
        this.creatingProduct = false;
        this.productMessage = 'Product created successfully.';
        this.productName = '';
        this.productPrice = null;
        this.productStock = null;
        this.productDescription = '';
        this.productImage = '';
        this.productModelFile = '';
        this.productAuction = false;
        this.loadInventory();
        this.loadStats();
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.creatingProduct = false;
        this.productError = error?.error?.message || 'Could not create product.';
        this.cdr.markForCheck();
      }
    });
  }

  private loadUsers(): void {
    this.usersLoading = true;

    this.http.get<AdminUser[]>(`${this.apiBase}/users`, this.requestOptions()).subscribe({
      next: (users) => {
        this.users = Array.isArray(users) ? users : [];
        this.usersLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.usersLoading = false;
        this.maintenanceError = error?.error?.message || 'Could not load users.';
        this.cdr.markForCheck();
      }
    });
  }

  private loadStats(): void {
    this.statsLoading = true;

    this.http.get<AdminStats>(`${this.apiBase}/stats`, this.requestOptions()).subscribe({
      next: (stats) => {
        this.stats = {
          totalUsers: stats?.totalUsers || 0,
          totalAdmins: stats?.totalAdmins || 0,
          totalProducts: stats?.totalProducts || 0,
          totalOrders: stats?.totalOrders || 0,
          totalStockUnits: stats?.totalStockUnits || 0,
          totalInventoryValue: stats?.totalInventoryValue || 0,
          lowStockProducts: stats?.lowStockProducts || 0
        };
        this.statsLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.statsLoading = false;
        this.maintenanceError = error?.error?.message || 'Could not load stats.';
        this.cdr.markForCheck();
      }
    });
  }

  private loadInventory(): void {
    this.inventoryLoading = true;

    this.http.get<AdminInventoryItem[]>(`${this.apiBase}/inventory`, this.requestOptions()).subscribe({
      next: (items) => {
        this.inventory = Array.isArray(items) ? items : [];
        const draft: Record<string, number> = {};
        const discountDraft: Record<string, number> = {};
        const badgeDraft: Record<string, boolean> = {};
        this.inventory.forEach((item) => {
          const key = this.stockKey(item);
          draft[key] = Number(item.stock || 0);
          discountDraft[key] = Number(item.discountPercent || 0);
          badgeDraft[key] = Boolean(item.showDiscountBadge);
        });
        this.stockDraft = draft;
        this.discountDraft = discountDraft;
        this.badgeDraft = badgeDraft;
        this.inventoryLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.inventoryLoading = false;
        this.maintenanceError = error?.error?.message || 'Could not load inventory.';
        this.cdr.markForCheck();
      }
    });
  }

  private requestOptions(): { headers: HttpHeaders } {
    const token = this.auth.getToken();
    const headers = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    return { headers };
  }
}
