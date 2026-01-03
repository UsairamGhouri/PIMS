
import { Component, inject, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-7xl mx-auto">
      <div class="bg-blue-600 rounded-xl shadow-lg p-8 mb-8 text-white">
        <h1 class="text-3xl font-bold">Welcome to Our Pharmacy</h1>
        <p class="mt-2 text-blue-100">Find the medicines you need, check prices, and order instantly.</p>
        
        <div class="mt-6 max-w-xl">
          <div class="relative">
            <input type="text" [(ngModel)]="searchTerm" 
              class="w-full bg-white text-gray-900 rounded-lg pl-12 pr-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              placeholder="Search for medicine name...">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Medicine Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        @for (med of filteredMedicines(); track med.id) {
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div class="h-32 bg-gray-100 flex items-center justify-center">
              <svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <div class="p-6">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-xl font-bold text-gray-900">{{ med.name }}</h3>
                  <p class="text-sm text-gray-500 mt-1">ID: #{{ med.id }}</p>
                </div>
                <span class="text-lg font-bold text-blue-600">\${{ med.price }}</span>
              </div>
              
              <div class="mt-4">
                <div class="flex items-center text-sm">
                  <span class="font-medium text-gray-700 mr-2">Availability:</span>
                  @if (med.stock > 0) {
                    <span class="text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs font-semibold">In Stock ({{ med.stock }})</span>
                  } @else {
                    <span class="text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-xs font-semibold">Out of Stock</span>
                  }
                </div>
              </div>

              <div class="mt-6 flex items-center space-x-3">
                 <input type="number" #qtyInput [value]="1" min="1" [max]="med.stock" class="w-20 border rounded-md p-2 text-center" [disabled]="med.stock === 0">
                 <button (click)="buy(med.id, qtyInput.value)" 
                   [disabled]="med.stock === 0"
                   class="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                   {{ med.stock > 0 ? 'Purchase' : 'Unavailable' }}
                 </button>
              </div>
            </div>
          </div>
        }
      </div>
      
      @if (filteredMedicines().length === 0) {
        <div class="text-center py-12">
           <p class="text-gray-500 text-lg">No medicines found matching "{{ searchTerm() }}"</p>
        </div>
      }

      <!-- Thank You Modal -->
      @if (showSuccessModal()) {
        <div class="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="showSuccessModal.set(false)"></div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
              <div>
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg class="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div class="mt-3 text-center sm:mt-5">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Purchase Successful</h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Thank you for your purchase! Your order has been processed.
                    </p>
                  </div>
                </div>
              </div>
              <div class="mt-5 sm:mt-6">
                <button type="button" (click)="showSuccessModal.set(false)" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:text-sm">
                  Continue Browsing
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class CustomerDashboardComponent {
  dataService = inject(DataService);
  username = input.required<string>();
  
  searchTerm = signal('');
  showSuccessModal = signal(false);

  filteredMedicines = computed(() => {
    return this.dataService.medicines().filter(m => 
      m.name.toLowerCase().includes(this.searchTerm().toLowerCase())
    );
  });

  buy(medId: number, qtyStr: string) {
    const qty = parseInt(qtyStr, 10);
    if (isNaN(qty) || qty <= 0) return;

    const result = this.dataService.processSale(medId, qty, this.username());
    if (result.success) {
      this.showSuccessModal.set(true);
    } else {
      alert(result.message);
    }
  }
}
