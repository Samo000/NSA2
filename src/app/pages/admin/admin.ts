import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

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
  source: 'product' | 'listing';
  name: string;
  price: number;
  stock: number;
  category?: string;
  createdAt?: string;
};

type AdminStats = {
  totalUsers: number;
  totalAdmins: number;
  totalProducts: number;
  totalListings: number;
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
  private readonly apiBase = 'http://localhost:3000/api/admin';

  usersLoading = true;
  statsLoading = true;
  inventoryLoading = true;
  creatingProduct = false;

  users: AdminUser[] = [];
  inventory: AdminInventoryItem[] = [];
  stockDraft: Record<string, number> = {};
  stockSaving: Record<string, boolean> = {};

  userSearch = '';
  selectedRole: 'all' | 'admin' | 'user' = 'all';

  deleteListingId = '';
  maintenanceMessage = '';
  maintenanceError = '';

  productName = '';
  productPrice: number | null = null;
  productStock: number | null = null;
  productDescription = '';
  productImage = '';
  productAuction = false;
  productMessage = '';
  productError = '';

  stockMessage = '';
  stockError = '';

  stats: AdminStats = {
    totalUsers: 0,
    totalAdmins: 0,
    totalProducts: 0,
    totalListings: 0,
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
        this.loadInventory();
        this.loadStats();
      },
      error: (error) => {
        this.stockSaving[key] = false;
        this.stockError = error?.error?.message || 'Could not update stock.';
      }
    });
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
        this.productAuction = false;
        this.loadInventory();
        this.loadStats();
      },
      error: (error) => {
        this.creatingProduct = false;
        this.productError = error?.error?.message || 'Could not create product.';
      }
    });
  }

  deleteListingById(): void {
    this.maintenanceMessage = '';
    this.maintenanceError = '';

    const listingId = this.deleteListingId.trim();
    if (!listingId) {
      this.maintenanceError = 'Enter a listing ID first.';
      return;
    }

    this.http.delete<{ message?: string }>(`${this.apiBase}/listing/${listingId}`, this.requestOptions()).subscribe({
      next: (response) => {
        this.maintenanceMessage = response.message ?? 'Listing removed.';
        this.deleteListingId = '';
        this.loadInventory();
        this.loadStats();
      },
      error: (error) => {
        this.maintenanceError = error?.error?.message || 'Could not delete listing.';
      }
    });
  }

  private loadUsers(): void {
    this.usersLoading = true;

    this.http.get<AdminUser[]>(`${this.apiBase}/users`, this.requestOptions()).subscribe({
      next: (users) => {
        this.users = Array.isArray(users) ? users : [];
        this.usersLoading = false;
      },
      error: (error) => {
        this.usersLoading = false;
        this.maintenanceError = error?.error?.message || 'Could not load users.';
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
          totalListings: stats?.totalListings || 0,
          totalOrders: stats?.totalOrders || 0,
          totalStockUnits: stats?.totalStockUnits || 0,
          totalInventoryValue: stats?.totalInventoryValue || 0,
          lowStockProducts: stats?.lowStockProducts || 0
        };
        this.statsLoading = false;
      },
      error: (error) => {
        this.statsLoading = false;
        this.maintenanceError = error?.error?.message || 'Could not load stats.';
      }
    });
  }

  private loadInventory(): void {
    this.inventoryLoading = true;

    this.http.get<AdminInventoryItem[]>(`${this.apiBase}/inventory`, this.requestOptions()).subscribe({
      next: (items) => {
        this.inventory = Array.isArray(items) ? items : [];
        const draft: Record<string, number> = {};
        this.inventory.forEach((item) => {
          draft[this.stockKey(item)] = Number(item.stock || 0);
        });
        this.stockDraft = draft;
        this.inventoryLoading = false;
      },
      error: (error) => {
        this.inventoryLoading = false;
        this.maintenanceError = error?.error?.message || 'Could not load inventory.';
      }
    });
  }

  private requestOptions(): { headers: HttpHeaders } {
    const token = this.auth.getToken();
    const headers = new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
    return { headers };
  }
}
