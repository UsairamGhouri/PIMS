
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-warehouse-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Warehouse Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 class="text-sm font-medium text-gray-500">Pending Requests</h3>
          <p class="mt-2 text-3xl font-bold text-orange-600">{{ pendingRequests().length + pendingNewMeds().length }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 class="text-sm font-medium text-gray-500">Total Stock Items</h3>
          <p class="mt-2 text-3xl font-bold text-gray-900">{{ dataService.medicines().length }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 class="text-sm font-medium text-gray-500">Warehouse Revenue</h3>
          <p class="mt-2 text-3xl font-bold text-green-600">\${{ dataService.warehouseRevenue().toFixed(2) }}</p>
        </div>
      </div>

      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button (click)="currentTab.set('requests')" 
            [class.border-blue-500]="currentTab() === 'requests'"
            [class.text-blue-600]="currentTab() === 'requests'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150"
            [class.border-transparent]="currentTab() !== 'requests'"
            [class.text-gray-500]="currentTab() !== 'requests'">
            Restock Requests
          </button>
           <button (click)="currentTab.set('new_medicines')" 
            [class.border-blue-500]="currentTab() === 'new_medicines'"
            [class.text-blue-600]="currentTab() === 'new_medicines'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150"
            [class.border-transparent]="currentTab() !== 'new_medicines'"
            [class.text-gray-500]="currentTab() !== 'new_medicines'">
            New Medicine Requests
          </button>
          <button (click)="currentTab.set('inventory')"
            [class.border-blue-500]="currentTab() === 'inventory'"
            [class.text-blue-600]="currentTab() === 'inventory'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150"
            [class.border-transparent]="currentTab() !== 'inventory'"
            [class.text-gray-500]="currentTab() !== 'inventory'">
            Warehouse Inventory
          </button>
          <button (click)="currentTab.set('history')"
            [class.border-blue-500]="currentTab() === 'history'"
            [class.text-blue-600]="currentTab() === 'history'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150"
            [class.border-transparent]="currentTab() !== 'history'"
            [class.text-gray-500]="currentTab() !== 'history'">
            Requests History
          </button>
        </nav>
      </div>

      <!-- Requests Tab -->
      @if (currentTab() === 'requests') {
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="p-6 border-b border-gray-200 bg-gray-50">
            <h3 class="text-lg font-medium text-gray-900">Incoming Restock Requests</h3>
          </div>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pharmacist</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (req of pendingRequests(); track req.id) {
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ req.medicineName }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ req.quantity }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ req.requestedBy }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ req.requestDate | date:'short' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button (click)="approve(req.id)" class="bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200">Accept</button>
                    <button (click)="openRejectModal(req.id)" class="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200">Reject</button>
                  </td>
                </tr>
              }
              @if (pendingRequests().length === 0) {
                <tr>
                  <td colspan="5" class="px-6 py-4 text-center text-gray-500 text-sm">No pending requests.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- New Medicines Requests Tab -->
       @if (currentTab() === 'new_medicines') {
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="p-6 border-b border-gray-200 bg-gray-50">
            <h3 class="text-lg font-medium text-gray-900">New Medicine Creation Requests</h3>
            <p class="text-sm text-gray-500">Admins have requested these items be added to the database.</p>
          </div>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retail Price</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Initial Stock</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (req of pendingNewMeds(); track req.id) {
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ req.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">\${{ req.price }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ req.initialStock }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button (click)="dataService.approveNewMedicine(req.id)" class="bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200">Approve & Create</button>
                    <button (click)="dataService.rejectNewMedicine(req.id)" class="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200">Reject</button>
                  </td>
                </tr>
              }
              @if (pendingNewMeds().length === 0) {
                 <tr>
                  <td colspan="4" class="px-6 py-4 text-center text-gray-500 text-sm">No pending new medicine requests.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Inventory Tab -->
      @if (currentTab() === 'inventory') {
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="p-6 border-b border-gray-200 bg-gray-50">
            <h3 class="text-lg font-medium text-gray-900">Warehouse Storage</h3>
          </div>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse Stock</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Supplier Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (med of dataService.medicines(); track med.id) {
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{{ med.id }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ med.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{{ med.warehouseStock }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end space-x-2">
                     <!-- Decreased width to w-16 -->
                     <input type="number" #shipQty placeholder="Qty" class="w-16 border rounded p-1 text-sm text-right" min="0">
                     <button (click)="receiveStock(med.id, shipQty.value); shipQty.value=''" class="text-blue-600 hover:text-blue-900 bg-blue-50 px-2 py-1 rounded text-sm">
                        + Add Shipment
                     </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Requests History Tab -->
      @if (currentTab() === 'history') {
         <div class="space-y-6">
           <!-- Restock Requests History -->
           <div class="bg-white shadow rounded-lg overflow-hidden">
            <div class="p-6 border-b border-gray-200 bg-gray-50">
              <h3 class="text-lg font-medium text-gray-900">Restock Requests History</h3>
            </div>
            <div class="max-h-96 overflow-y-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  @for (req of dataService.restockRequests(); track req.id) {
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ req.requestDate | date:'short' }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ req.medicineName }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ req.quantity }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <span class="px-2 py-1 rounded-full text-xs font-semibold"
                          [class.bg-yellow-100]="req.status === 'pending'" [class.text-yellow-800]="req.status === 'pending'"
                          [class.bg-green-100]="req.status === 'approved'" [class.text-green-800]="req.status === 'approved'"
                          [class.bg-red-100]="req.status === 'rejected'" [class.text-red-800]="req.status === 'rejected'">
                          {{ req.status | titlecase }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ req.requestedBy }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- New Medicine Requests History -->
          <div class="bg-white shadow rounded-lg overflow-hidden">
            <div class="p-6 border-b border-gray-200 bg-gray-50">
              <h3 class="text-lg font-medium text-gray-900">New Medicine Requests History</h3>
            </div>
            <div class="max-h-96 overflow-y-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Initial Price</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Initial Stock</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  @for (req of dataService.newMedicineRequests(); track req.id) {
                    <tr>
                      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ req.name }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">\${{ req.price }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ req.initialStock }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <span class="px-2 py-1 rounded-full text-xs font-semibold"
                          [class.bg-yellow-100]="req.status === 'pending'" [class.text-yellow-800]="req.status === 'pending'"
                          [class.bg-green-100]="req.status === 'approved'" [class.text-green-800]="req.status === 'approved'"
                          [class.bg-red-100]="req.status === 'rejected'" [class.text-red-800]="req.status === 'rejected'">
                          {{ req.status | titlecase }}
                        </span>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
         </div>
      }
    </div>

    <!-- Reject Modal -->
    @if (rejectModalOpen()) {
      <div class="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="rejectModalOpen.set(false)"></div>
            <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
              <div>
                <div class="mt-3 text-center sm:mt-5">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Reject Request</h3>
                  <div class="mt-2">
                    <input [(ngModel)]="rejectReason" class="w-full border p-2 rounded" placeholder="Reason (e.g., Out of Stock)">
                  </div>
                </div>
              </div>
              <div class="mt-5 sm:mt-6 flex justify-end space-x-2">
                 <button (click)="rejectModalOpen.set(false)" class="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300">Cancel</button>
                 <button (click)="confirmReject()" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Confirm Reject</button>
              </div>
            </div>
          </div>
        </div>
    }
  `
})
export class WarehouseDashboardComponent {
  dataService = inject(DataService);
  currentTab = signal<'requests' | 'new_medicines' | 'inventory' | 'history'>('requests');
  
  // Reject Modal State
  rejectModalOpen = signal(false);
  selectedRejectId = signal<string | null>(null);
  rejectReason = signal('Out of Stock');

  pendingRequests = computed(() => 
    this.dataService.restockRequests().filter(r => r.status === 'pending')
  );

  pendingNewMeds = computed(() => 
    this.dataService.newMedicineRequests().filter(r => r.status === 'pending')
  );

  approve(id: string) {
    const result = this.dataService.approveRestockRequest(id);
    if (!result.success) {
      this.dataService.showNotification(result.message, 'error');
    }
  }

  openRejectModal(id: string) {
    this.selectedRejectId.set(id);
    this.rejectModalOpen.set(true);
  }

  confirmReject() {
    if (this.selectedRejectId()) {
      this.dataService.rejectRestockRequest(this.selectedRejectId()!, this.rejectReason());
      this.rejectModalOpen.set(false);
      this.rejectReason.set('Out of Stock'); // Reset
    }
  }

  receiveStock(id: number, qtyStr: string) {
    const qty = parseInt(qtyStr, 10);
    if (qty > 0) {
      this.dataService.warehouseReceiveStock(id, qty);
    } else {
       this.dataService.showNotification("Invalid shipment quantity", 'error');
    }
  }
}
