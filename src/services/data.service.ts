
import { Injectable, signal, computed, effect } from '@angular/core';

// Types mirroring the structure
export interface Medicine {
  id: number;
  name: string;
  price: number;
  stock: number; // Pharmacy Stock
  warehouseStock: number; // Warehouse Stock
}

export interface User {
  username: string;
  password: string;
  role: 'admin' | 'pharmacist' | 'customer' | 'warehouse';
}

export interface SaleRecord {
  id: string;
  medicineName: string;
  quantity: number;
  totalPrice: number;
  date: string;
  soldBy: string; 
}

export interface RestockRequest {
  id: string;
  medicineId: number;
  medicineName: string;
  quantity: number;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  cost: number; 
  message?: string; 
}

export interface NewMedicineRequest {
  id: string;
  name: string;
  price: number;
  initialStock: number;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly MEDICINES_KEY = 'pims_medicines';
  private readonly USERS_KEY = 'pims_users';
  private readonly SALES_KEY = 'pims_sales';
  private readonly REQUESTS_KEY = 'pims_requests';
  private readonly NEW_MED_REQ_KEY = 'pims_new_med_requests';

  // Signals for state
  medicines = signal<Medicine[]>([]);
  users = signal<User[]>([]);
  sales = signal<SaleRecord[]>([]);
  restockRequests = signal<RestockRequest[]>([]);
  newMedicineRequests = signal<NewMedicineRequest[]>([]);
  
  // Notification System
  notifications = signal<Notification[]>([]);

  // Computed signals
  lowStockItems = computed(() => this.medicines().filter(m => m.stock < 20));
  
  // Financials - Real-time Inventory System Logic
  
  // Gross Sales: Total Revenue generated from sales (Starts from 0)
  totalSalesValue = computed(() => this.sales().reduce((acc, s) => acc + s.totalPrice, 0));
  
  // Restock Expenses: Total Cost of Goods Purchased (Money Out)
  // Only counts requests that have been APPROVED (actually purchased/moved)
  totalRestockExpenses = computed(() => 
    this.restockRequests()
      .filter(r => r.status === 'approved')
      .reduce((acc, r) => acc + r.cost, 0)
  );

  // Actual Profit (Net Cash Flow): Revenue - Expenses
  // In a real-time system, this represents the liquidity or actual cash gain/loss.
  netProfit = computed(() => this.totalSalesValue() - this.totalRestockExpenses());

  // Warehouse Revenue = The Expenses of the Pharmacy (Internal accounting)
  warehouseRevenue = computed(() => this.totalRestockExpenses());

  constructor() {
    this.loadData();
    
    effect(() => localStorage.setItem(this.MEDICINES_KEY, JSON.stringify(this.medicines())));
    effect(() => localStorage.setItem(this.USERS_KEY, JSON.stringify(this.users())));
    effect(() => localStorage.setItem(this.SALES_KEY, JSON.stringify(this.sales())));
    effect(() => localStorage.setItem(this.REQUESTS_KEY, JSON.stringify(this.restockRequests())));
    effect(() => localStorage.setItem(this.NEW_MED_REQ_KEY, JSON.stringify(this.newMedicineRequests())));
  }

  showNotification(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = crypto.randomUUID();
    this.notifications.update(current => [...current, { id, message, type }]);
    
    // Auto remove after 1.5 seconds
    setTimeout(() => {
      this.notifications.update(current => current.filter(n => n.id !== id));
    }, 1500);
  }

  private loadData() {
    const savedMeds = localStorage.getItem(this.MEDICINES_KEY);
    if (savedMeds) {
      this.medicines.set(JSON.parse(savedMeds));
    } else {
      this.medicines.set([
        { id: 1, name: 'Panadol', price: 30, stock: 100, warehouseStock: 5000 },
        { id: 2, name: 'Rigix', price: 50, stock: 20, warehouseStock: 2000 },
        { id: 3, name: 'Pfizer', price: 100, stock: 200, warehouseStock: 1000 } 
      ]);
    }

    const savedUsers = localStorage.getItem(this.USERS_KEY);
    if (savedUsers) {
      this.users.set(JSON.parse(savedUsers));
    } else {
      this.users.set([
        { username: 'SuperAdmin', password: 'Admin123!', role: 'admin' },
        { username: 'usairam', password: 'User123!', role: 'pharmacist' },
        { username: 'awais', password: 'User123!', role: 'customer' },
        { username: 'storekeeper', password: 'User123!', role: 'warehouse' }
      ]);
    }

    const savedSales = localStorage.getItem(this.SALES_KEY);
    if (savedSales) this.sales.set(JSON.parse(savedSales));

    const savedRequests = localStorage.getItem(this.REQUESTS_KEY);
    if (savedRequests) this.restockRequests.set(JSON.parse(savedRequests));

    const savedNewMedRequests = localStorage.getItem(this.NEW_MED_REQ_KEY);
    if (savedNewMedRequests) this.newMedicineRequests.set(JSON.parse(savedNewMedRequests));
  }

  // --- Validation Helpers ---

  validateUsername(username: string): string | null {
    if (!username) return 'Username is required.';
    // First char must be alphabet
    if (!/^[a-zA-Z]/.test(username)) {
      return 'Username must start with a letter.';
    }
    // Only alphanumeric and underscore allowed
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores.';
    }
    return null;
  }

  validatePassword(password: string): string | null {
    if (!password) return 'Password is required.';
    if (password.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
    if (!/\d/.test(password)) return 'Password must contain at least one digit.';
    // Special character check
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character.';
    
    return null;
  }

  // --- Data Persistence Helpers ---
  exportData(): string {
    const data = {
      medicines: this.medicines(),
      users: this.users(),
      sales: this.sales(),
      restockRequests: this.restockRequests(),
      newMedicineRequests: this.newMedicineRequests()
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      
      // Validation
      if (!data.medicines || !data.users) throw new Error('Invalid Data Structure');

      this.medicines.set(data.medicines);
      this.users.set(data.users);
      this.sales.set(data.sales || []);
      this.restockRequests.set(data.restockRequests || []);
      this.newMedicineRequests.set(data.newMedicineRequests || []);

      this.showNotification('System data restored successfully', 'success');
      return true;
    } catch (e) {
      console.error(e);
      this.showNotification('Failed to import data. File is invalid.', 'error');
      return false;
    }
  }

  // --- Medicine Operations ---
  
  // Changed: Admin now requests, doesn't add directly
  requestNewMedicine(med: { name: string, price: number, stock: number }, requestedBy: string) {
    const req: NewMedicineRequest = {
      id: crypto.randomUUID(),
      name: med.name,
      price: med.price,
      initialStock: med.stock,
      requestedBy,
      status: 'pending'
    };
    this.newMedicineRequests.update(curr => [req, ...curr]);
    this.showNotification('New medicine request sent to Warehouse', 'success');
  }

  approveNewMedicine(reqId: string) {
    const req = this.newMedicineRequests().find(r => r.id === reqId);
    if (!req) return;

    // Create the medicine
    const newId = Math.max(0, ...this.medicines().map(m => m.id)) + 1;
    this.medicines.update(current => [...current, { 
      id: newId, 
      name: req.name, 
      price: req.price, 
      stock: req.initialStock, 
      warehouseStock: 0 // Starts at 0 until shipment
    }]);

    // Update request status
    this.newMedicineRequests.update(current => 
      current.map(r => r.id === reqId ? { ...r, status: 'approved' } : r)
    );
    this.showNotification(`Medicine ${req.name} added to inventory`, 'success');
  }

  rejectNewMedicine(reqId: string) {
    this.newMedicineRequests.update(current => 
      current.map(r => r.id === reqId ? { ...r, status: 'rejected' } : r)
    );
    this.showNotification('Medicine request rejected', 'info');
  }

  deleteMedicine(id: number) {
    this.medicines.update(current => current.filter(m => m.id !== id));
    this.showNotification('Medicine removed', 'info');
  }

  // Used by Warehouse to increase their own stock from external suppliers
  warehouseReceiveStock(id: number, quantity: number) {
    this.medicines.update(current => 
      current.map(m => m.id === id ? { ...m, warehouseStock: m.warehouseStock + quantity } : m)
    );
    this.showNotification(`Added ${quantity} units to Warehouse Stock`, 'success');
  }

  // --- Restock Request Operations ---
  requestRestock(medicineId: number, quantity: number, requestedBy: string) {
    const med = this.medicines().find(m => m.id === medicineId);
    if (!med) throw new Error("Medicine not found");

    const unitCost = med.price * 0.975; 
    const totalCost = unitCost * quantity;

    const request: RestockRequest = {
      id: crypto.randomUUID(),
      medicineId,
      medicineName: med.name,
      quantity,
      requestedBy,
      status: 'pending',
      requestDate: new Date().toISOString(),
      cost: totalCost
    };

    this.restockRequests.update(current => [request, ...current]);
    this.showNotification('Restock request sent', 'success');
  }

  approveRestockRequest(requestId: string): { success: boolean, message: string } {
    const request = this.restockRequests().find(r => r.id === requestId);
    if (!request || request.status !== 'pending') {
      return { success: false, message: 'Invalid request' };
    }

    const med = this.medicines().find(m => m.id === request.medicineId);
    if (!med) return { success: false, message: 'Medicine no longer exists' };

    if (med.warehouseStock < request.quantity) {
      return { success: false, message: 'Insufficient Warehouse Stock' };
    }

    // Transaction
    this.medicines.update(current => 
      current.map(m => m.id === request.medicineId ? {
        ...m,
        warehouseStock: m.warehouseStock - request.quantity, // Deduct from Warehouse
        stock: m.stock + request.quantity // Add to Pharmacy
      } : m)
    );

    this.restockRequests.update(current => 
      current.map(r => r.id === requestId ? { ...r, status: 'approved' } : r)
    );

    this.showNotification('Request Approved', 'success');
    return { success: true, message: 'Restock approved and processed' };
  }

  rejectRestockRequest(requestId: string, message: string) {
    this.restockRequests.update(current => 
      current.map(r => r.id === requestId ? { ...r, status: 'rejected', message } : r)
    );
    this.showNotification('Request Rejected', 'info');
  }

  deleteRestockRequest(requestId: string) {
    this.restockRequests.update(current => current.filter(r => r.id !== requestId));
    this.showNotification('Request deleted', 'info');
  }

  // --- Sales Operations ---
  processSale(medicineId: number, quantity: number, username: string): { success: boolean, message: string } {
    const med = this.medicines().find(m => m.id === medicineId);
    
    if (!med) return { success: false, message: 'Medicine not found.' };
    if (med.stock < quantity) return { success: false, message: `Insufficient stock. Only ${med.stock} available.` };

    // Deduct stock
    this.medicines.update(current => 
      current.map(m => m.id === medicineId ? { ...m, stock: med.stock - quantity } : m)
    );

    // Record sale
    const record: SaleRecord = {
      id: crypto.randomUUID(),
      medicineName: med.name,
      quantity,
      totalPrice: med.price * quantity,
      date: new Date().toISOString(),
      soldBy: username
    };
    
    this.sales.update(current => [record, ...current]); 
    // Not showing notification here as it might be handled by modal in customer view or custom logic

    return { success: true, message: 'Sale processed successfully.' };
  }

  // --- User Operations ---
  addUser(user: User) {
    // Basic checks
    const nameError = this.validateUsername(user.username);
    if (nameError) throw new Error(nameError);
    
    const passError = this.validatePassword(user.password);
    if (passError) throw new Error(passError);

    if (this.users().some(u => u.username === user.username)) {
      throw new Error('Username already exists');
    }
    this.users.update(current => [...current, user]);
    this.showNotification('User created successfully', 'success');
  }

  updateUser(oldUsername: string, updatedUser: User): void {
    const nameError = this.validateUsername(updatedUser.username);
    if (nameError) throw new Error(nameError);
    
    const passError = this.validatePassword(updatedUser.password);
    if (passError) throw new Error(passError);

    // If changing username, check availability
    if (oldUsername !== updatedUser.username) {
       if (this.users().some(u => u.username === updatedUser.username)) {
        throw new Error('Username already taken.');
      }
    }

    this.users.update(current => current.map(u => 
      u.username === oldUsername ? updatedUser : u
    ));
    this.showNotification('Profile updated successfully', 'success');
  }

  deleteUser(username: string) {
    if (username === 'SuperAdmin') {
      this.showNotification('Cannot delete SuperAdmin', 'error');
      return;
    }
    this.users.update(current => current.filter(u => u.username !== username));
    this.showNotification('User removed', 'info');
  }

  resetData() {
    localStorage.removeItem(this.MEDICINES_KEY);
    localStorage.removeItem(this.USERS_KEY);
    localStorage.removeItem(this.SALES_KEY);
    localStorage.removeItem(this.REQUESTS_KEY);
    localStorage.removeItem(this.NEW_MED_REQ_KEY);
    this.loadData();
    this.showNotification('System Reset Complete', 'info');
  }
}
