
import { Component, inject, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-pharmacist-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Low Stock Alert Banner -->
      @if (dataService.lowStockItems().length > 0) {
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Low Stock Alert</h3>
              <div class="mt-1 text-sm text-red-700">
                <p>The following items are running low (< 20 units): 
                  <span class="font-bold">
                    {{ getLowStockNames() }}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Sales Section -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white shadow rounded-lg p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-medium text-gray-900">Point of Sale</h2>
              <button (click)="isBrowsing.set(!isBrowsing())" class="text-sm text-blue-600 hover:text-blue-800 font-medium underline">
                {{ isBrowsing() ? 'Show Quick Access' : 'Browse All Medicines' }}
              </button>
            </div>
            
            <div class="space-y-4">
              <div class="relative">
                <input type="text" [(ngModel)]="searchTerm" placeholder="Search medicine to sell..." 
                  class="w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:ring-blue-500 focus:border-blue-500">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <!-- POS Grid / Results -->
              <div class="border rounded-md divide-y divide-gray-200 bg-white max-h-80 overflow-y-auto">
                <div *ngIf="!searchTerm() && !isBrowsing()" class="p-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {{ hasRecentSales() ? 'Quick Access: Recently Sold & Popular' : 'Quick Access: Most Stocked' }}
                </div>
                <div *ngIf="isBrowsing() && !searchTerm()" class="p-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  All Medicines
                </div>
                
                @for (med of posMedicines(); track med.id) {
                  <div class="p-3 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div>
                      <p class="font-medium text-gray-900">{{ med.name }}</p>
                      <p class="text-sm text-gray-500">Stock: {{ med.stock }} | Price: \${{ med.price }}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                      <input type="number" [(ngModel)]="med.tempQty" min="1" [max]="med.stock" class="w-16 border rounded p-1 text-center" placeholder="1">
                      <button (click)="sellMedicine(med)" 
                        [disabled]="med.stock === 0"
                        class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        Sell
                      </button>
                    </div>
                  </div>
                }
                @if (posMedicines().length === 0) {
                  <div class="p-4 text-center text-sm text-gray-500">No medicines found.</div>
                }
              </div>
            </div>
          </div>
          
           <!-- Recent Pharmacist Sales -->
           <div class="bg-white shadow rounded-lg overflow-hidden">
             <div class="p-4 border-b border-gray-200 bg-gray-50">
               <h3 class="font-medium text-gray-900">My Recent Transactions</h3>
             </div>
             <table class="min-w-full divide-y divide-gray-200">
               <thead class="bg-gray-50">
                 <tr>
                   <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine Name</th>
                   <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                   <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                   <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Time</th>
                 </tr>
               </thead>
               <tbody class="divide-y divide-gray-200">
                 @for (sale of mySales(); track sale.id) {
                   <tr>
                     <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ sale.medicineName }}</td>
                     <td class="px-6 py-4 text-sm text-gray-500">{{ sale.quantity }}</td>
                     <td class="px-6 py-4 text-sm font-bold text-gray-900">\${{ sale.totalPrice }}</td>
                     <td class="px-6 py-4 text-sm text-gray-400 text-right">{{ sale.date | date:'shortTime' }}</td>
                   </tr>
                 }
               </tbody>
             </table>
           </div>
        </div>

        <!-- Right Col: Request Restock & Request Status -->
        <div class="space-y-6">
          
          <!-- Request Restock Form -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">Request Restock</h2>
            <p class="text-sm text-gray-500 mb-4">Request items from Warehouse.</p>
            
            <div class="space-y-4 max-h-64 overflow-y-auto pr-2">
              @for (med of dataService.medicines(); track med.id) {
                <div class="flex items-center justify-between border-b pb-2">
                  <div class="flex-1 min-w-0 mr-2">
                     <p class="font-medium text-sm text-gray-900 truncate">{{ med.name }}</p>
                     <p class="text-xs text-gray-500">Stock: {{ med.stock }}</p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <input type="number" #qtyInput placeholder="Qty" class="w-14 border rounded p-1 text-xs" min="1">
                    <button (click)="requestRestock(med.id, qtyInput.value); qtyInput.value=''" class="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded text-xs font-medium">
                      Request
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Request Status -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-medium text-gray-900 mb-4">My Requests Status</h2>
            <div class="space-y-3 max-h-64 overflow-y-auto">
              @for (req of myRequests(); track req.id) {
                <div class="p-3 rounded-md text-sm border" 
                  [class.bg-yellow-50]="req.status === 'pending'"
                  [class.border-yellow-200]="req.status === 'pending'"
                  [class.bg-green-50]="req.status === 'approved'"
                  [class.border-green-200]="req.status === 'approved'"
                  [class.bg-red-50]="req.status === 'rejected'"
                  [class.border-red-200]="req.status === 'rejected'">
                  
                  <div class="flex justify-between items-start">
                    <span class="font-medium"
                      [class.text-yellow-800]="req.status === 'pending'"
                      [class.text-green-800]="req.status === 'approved'"
                      [class.text-red-800]="req.status === 'rejected'">
                      {{ req.medicineName }} (x{{ req.quantity }})
                    </span>
                    <span class="uppercase text-xs font-bold px-2 py-0.5 rounded"
                      [class.bg-yellow-200]="req.status === 'pending'" [class.text-yellow-800]="req.status === 'pending'"
                      [class.bg-green-200]="req.status === 'approved'" [class.text-green-800]="req.status === 'approved'"
                      [class.bg-red-200]="req.status === 'rejected'" [class.text-red-800]="req.status === 'rejected'">
                      {{ req.status }}
                    </span>
                  </div>
                  <div class="text-xs text-gray-500 mt-1">{{ req.requestDate | date:'short' }}</div>
                  @if (req.status === 'rejected' && req.message) {
                    <div class="text-xs text-red-600 mt-1 font-medium">Reason: {{ req.message }}</div>
                  }
                </div>
              }
              @if (myRequests().length === 0) {
                <p class="text-gray-500 text-sm italic">No active requests.</p>
              }
            </div>
          </div>

        </div>
      </div>
    </div>
  `
})
export class PharmacistDashboardComponent {
  dataService = inject(DataService);
  username = input.required<string>(); 
  
  searchTerm = signal('');
  isBrowsing = signal(false);

  hasRecentSales = computed(() => this.mySales().length > 0);

  // Computes the list of medicines to show in POS
  posMedicines = computed(() => {
    const term = this.searchTerm().toLowerCase();
    
    // If search term exists, return matches (always browsable)
    if (term) {
      return this.dataService.medicines()
        .filter(m => m.name.toLowerCase().includes(term))
        .map(m => ({ ...m, tempQty: 1 }));
    }

    // If "Browse All" mode is enabled, show everything
    if (this.isBrowsing()) {
      return this.dataService.medicines().map(m => ({ ...m, tempQty: 1 }));
    }

    // Default View logic: Show top 4
    const allMeds = this.dataService.medicines();
    
    // Priority: Recently sold by this user, then others.
    if (this.hasRecentSales()) {
        const recentMedNames = [...new Set(this.mySales().map(s => s.medicineName))];
        // Sort: items in recentMedNames come first, in order of recency (mySales is sorted newest first)
        const sorted = [...allMeds].sort((a, b) => {
          const idxA = recentMedNames.indexOf(a.name);
          const idxB = recentMedNames.indexOf(b.name);
          
          if (idxA !== -1 && idxB !== -1) return idxA - idxB; // Both recent: lower index = more recent
          if (idxA !== -1) return -1; // A is recent
          if (idxB !== -1) return 1; // B is recent
          return b.stock - a.stock; // Fallback to stock
        });
        
        return sorted.slice(0, 4).map(m => ({ ...m, tempQty: 1 }));
    }

    // Fallback if no sales: "Most Stocked"
    return [...allMeds]
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 4)
      .map(m => ({ ...m, tempQty: 1 }));
  });

  mySales = computed(() => {
    return this.dataService.sales()
      .filter(s => s.soldBy === this.username())
      .slice(0, 10); // Last 10
  });

  myRequests = computed(() => {
    return this.dataService.restockRequests()
      .filter(r => r.requestedBy === this.username())
      .slice(0, 10); 
  });

  getLowStockNames() {
    return this.dataService.lowStockItems().map(m => m.name).join(', ');
  }

  sellMedicine(med: any) {
    const qty = med.tempQty || 1;
    const result = this.dataService.processSale(med.id, qty, this.username());
    if (result.success) {
      this.dataService.showNotification(`Sold ${qty}x ${med.name}`, 'success');
      this.searchTerm.set(''); 
    } else {
      this.dataService.showNotification(result.message, 'error');
    }
  }

  requestRestock(id: number, qtyStr: string) {
    const qty = parseInt(qtyStr, 10);
    if (!qty || qty <= 0) {
      this.dataService.showNotification('Invalid quantity', 'error');
      return;
    }

    try {
      this.dataService.requestRestock(id, qty, this.username());
    } catch(e) {
      this.dataService.showNotification('Error sending request', 'error');
    }
  }
}
