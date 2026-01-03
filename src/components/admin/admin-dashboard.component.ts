import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Medicine, User } from '../../services/data.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 class="text-sm font-medium text-gray-500">Gross Sales</h3>
          <p class="mt-2 text-2xl font-bold text-gray-900">\${{ dataService.totalSalesValue().toFixed(2) }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 class="text-sm font-medium text-gray-500">Restock Expenses</h3>
          <p class="mt-2 text-2xl font-bold text-red-600">-\${{ dataService.totalRestockExpenses().toFixed(2) }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 class="text-sm font-medium text-gray-500">Actual Profit</h3>
          <p class="mt-2 text-2xl font-bold text-green-600">\${{ dataService.netProfit().toFixed(2) }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
           <h3 class="text-sm font-medium text-gray-500">Medicines</h3>
           <p class="mt-2 text-2xl font-bold text-gray-900">{{ dataService.medicines().length }}</p>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="border-b border-gray-200 overflow-x-auto">
        <nav class="-mb-px flex space-x-8">
          <button (click)="currentTab.set('inventory')" 
            [class.border-blue-500]="currentTab() === 'inventory'"
            [class.text-blue-600]="currentTab() === 'inventory'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150"
            [class.border-transparent]="currentTab() !== 'inventory'"
            [class.text-gray-500]="currentTab() !== 'inventory'">
            Inventory
          </button>
          <button (click)="currentTab.set('requests')" 
            [class.border-blue-500]="currentTab() === 'requests'"
            [class.text-blue-600]="currentTab() === 'requests'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150"
            [class.border-transparent]="currentTab() !== 'requests'"
            [class.text-gray-500]="currentTab() !== 'requests'">
            Restock Requests
          </button>
          <button (click)="currentTab.set('users')"
            [class.border-blue-500]="currentTab() === 'users'"
            [class.text-blue-600]="currentTab() === 'users'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150"
            [class.border-transparent]="currentTab() !== 'users'"
            [class.text-gray-500]="currentTab() !== 'users'">
            Users
          </button>
          <button (click)="currentTab.set('reports')"
            [class.border-blue-500]="currentTab() === 'reports'"
            [class.text-blue-600]="currentTab() === 'reports'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150"
            [class.border-transparent]="currentTab() !== 'reports'"
            [class.text-gray-500]="currentTab() !== 'reports'">
            Reports
          </button>
          <button (click)="currentTab.set('settings')"
            [class.border-blue-500]="currentTab() === 'settings'"
            [class.text-blue-600]="currentTab() === 'settings'"
            class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-150"
            [class.border-transparent]="currentTab() !== 'settings'"
            [class.text-gray-500]="currentTab() !== 'settings'">
            System Management
          </button>
        </nav>
      </div>

      <!-- Inventory Tab -->
      @if (currentTab() === 'inventory') {
        <div class="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div class="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 class="text-lg font-medium text-gray-900">Medicine Inventory</h3>
            <button (click)="showAddMedModal.set(true)" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium">
              + Request New Medicine
            </button>
          </div>
          
          <div class="p-4 bg-gray-50 border-b border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" [(ngModel)]="searchQuery" placeholder="Search medicines..." class="rounded border-gray-300 p-2 text-sm w-full">
            <select [(ngModel)]="sortBy" class="rounded border-gray-300 p-2 text-sm w-full">
              <option value="name">Sort by Name</option>
              <option value="stock">Sort by Stock (Low-High)</option>
              <option value="price">Sort by Price</option>
            </select>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pharmacy Stock</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse Stock</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (med of sortedMedicines(); track med.id) {
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{{ med.id }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ med.name }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span [class.text-red-600]="med.stock < 20" [class.font-bold]="med.stock < 20">
                        {{ med.stock }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ med.warehouseStock }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">\${{ med.price }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button (click)="initDeleteMedicine(med.id)" class="bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 ml-4">Delete</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- New Medicine Requests Status Section -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="p-6 border-b border-gray-200 bg-gray-50">
            <h3 class="text-lg font-medium text-gray-900">My Medicine Creation Requests Status</h3>
            <p class="text-sm text-gray-500">Status of medicines requested to be added to the warehouse.</p>
          </div>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proposed Price</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proposed Stock</th>
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
               @if (dataService.newMedicineRequests().length === 0) {
                 <tr><td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">No requests made.</td></tr>
               }
            </tbody>
          </table>
        </div>
      }

      <!-- Restock Requests Tab -->
      @if (currentTab() === 'requests') {
        <div class="bg-white shadow rounded-lg overflow-hidden">
           <div class="p-6 border-b border-gray-200 bg-gray-50">
            <h3 class="text-lg font-medium text-gray-900">Restock Requests Monitor</h3>
            <p class="text-sm text-gray-500">View requests made by pharmacists to the warehouse.</p>
          </div>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
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
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">\${{ req.cost.toFixed(2) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button (click)="deleteRequest(req.id)" class="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Users Tab -->
      @if (currentTab() === 'users') {
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 class="text-lg font-medium text-gray-900">User Management</h3>
            <button (click)="showAddUserModal.set(true)" class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm font-medium">
              + Add User
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (user of dataService.users(); track user.username) {
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ user.username }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        {{ user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                           user.role === 'pharmacist' ? 'bg-blue-100 text-blue-800' : 
                           user.role === 'warehouse' ? 'bg-orange-100 text-orange-800' :
                           'bg-green-100 text-green-800' }}">
                        {{ user.role | titlecase }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      @if (user.username !== 'admin' && user.username !== 'SuperAdmin') {
                        <button (click)="initDeleteUser(user.username)" class="bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100">Remove</button>
                      } @else {
                        <span class="text-gray-400 cursor-not-allowed px-3 py-1">Protected</span>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- Reports Tab (Renamed to Sales Log) -->
      @if (currentTab() === 'reports') {
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="p-6 border-b border-gray-200 bg-gray-50">
            <h3 class="text-lg font-medium text-gray-900">Sales Log</h3>
          </div>
          <div class="overflow-x-auto">
             <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medicine</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sold By</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                @for (sale of dataService.sales(); track sale.id) {
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ sale.date | date:'short' }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ sale.medicineName }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ sale.quantity }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">\${{ sale.totalPrice }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ sale.soldBy }}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {{ getUserRole(sale.soldBy) | titlecase }}
                      </span>
                    </td>
                  </tr>
                }
                @if (dataService.sales().length === 0) {
                  <tr>
                    <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">No sales recorded yet.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- System Management Tab (Settings) -->
      @if (currentTab() === 'settings') {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Backup Card -->
          <div class="bg-white shadow rounded-lg p-6 border border-blue-100">
             <div class="flex items-center space-x-4 mb-4">
               <div class="bg-blue-100 p-3 rounded-full">
                 <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                 </svg>
               </div>
               <div>
                 <h3 class="text-lg font-bold text-gray-900">Backup Data</h3>
                 <p class="text-sm text-gray-500">Download a secure copy of all system data.</p>
               </div>
             </div>
             <p class="text-sm text-gray-600 mb-6">
               This will download a JSON file containing all medicines, users, sales history, and pending requests. You can use this file to restore the system state later.
             </p>
             <button (click)="downloadBackup()" class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium transition-colors">
               Download Backup
             </button>
          </div>

          <!-- Restore Card -->
          <div class="bg-white shadow rounded-lg p-6 border border-green-100">
             <div class="flex items-center space-x-4 mb-4">
               <div class="bg-green-100 p-3 rounded-full">
                 <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                 </svg>
               </div>
               <div>
                 <h3 class="text-lg font-bold text-gray-900">Restore Data</h3>
                 <p class="text-sm text-gray-500">Restore system from a backup file.</p>
               </div>
             </div>
             <p class="text-sm text-gray-600 mb-6">
               Select a valid PIMS backup JSON file to restore. <span class="text-red-600 font-bold">Warning: This will overwrite all current data immediately.</span>
             </p>
             <input type="file" #fileInput (change)="triggerFileUpload($event)" class="hidden" accept=".json">
             <button (click)="fileInput.click()" class="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium transition-colors">
               Upload & Restore
             </button>
          </div>

          <!-- Reset Card -->
          <div class="bg-white shadow rounded-lg p-6 border border-red-100 md:col-span-2">
             <div class="flex items-center space-x-4 mb-4">
               <div class="bg-red-100 p-3 rounded-full">
                 <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                 </svg>
               </div>
               <div>
                 <h3 class="text-lg font-bold text-gray-900">Factory Reset</h3>
                 <p class="text-sm text-gray-500">Reset the entire system to default state.</p>
               </div>
             </div>
             <p class="text-sm text-gray-600 mb-6">
               This will delete all custom data and return the application to its initial installation state with default users and items. This action cannot be undone.
             </p>
             <button (click)="dataService.resetData()" class="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 font-medium transition-colors">
               Reset System to Defaults
             </button>
          </div>

        </div>
      }
    </div>

    <!-- Add Medicine Request Modal -->
    @if (showAddMedModal()) {
      <div class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="showAddMedModal.set(false)"></div>
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Request New Medicine Creation</h3>
              <p class="text-sm text-gray-500 mt-1">This will send a request to the Warehouse. The medicine will appear in inventory once approved.</p>
              <div class="mt-4 space-y-4">
                <input [(ngModel)]="newMed.name" placeholder="Medicine Name" class="w-full border p-2 rounded">
                <input [(ngModel)]="newMed.price" type="number" placeholder="Retail Price" class="w-full border p-2 rounded">
                <input [(ngModel)]="newMed.stock" type="number" placeholder="Allocated Initial Stock" class="w-full border p-2 rounded">
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button (click)="requestNewMedicine()" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                Send Request
              </button>
              <button (click)="showAddMedModal.set(false)" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Add User Modal -->
    @if (showAddUserModal()) {
      <div class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="closeUserModal()"></div>
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative">
            
            <!-- Centered Error Message -->
            @if (userExistsError()) {
              <div class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-20">
                <div class="bg-red-50 border border-red-200 rounded-lg p-6 shadow-xl text-center max-w-sm mx-4 animate-bounce-short">
                  <svg class="h-10 w-10 text-red-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3 class="text-lg font-bold text-red-800">Error</h3>
                  <p class="text-red-600 mt-1">{{ errorMessage() }}</p>
                  <button (click)="userExistsError.set(false)" class="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 w-full">Dismiss</button>
                </div>
              </div>
            }

            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Create New User</h3>
              <div class="mt-4 space-y-4">
                <div>
                   <input [(ngModel)]="newUser.username" placeholder="Username" class="w-full border p-2 rounded">
                   <p class="text-xs text-gray-500 mt-1">Start with letter, alphanumeric + underscores only.</p>
                </div>
                <div>
                  <input [(ngModel)]="newUser.password" type="text" placeholder="Password" class="w-full border p-2 rounded">
                  <p class="text-xs text-gray-500 mt-1">Min 8 chars, Uppercase, Lowercase, Number, Special Char.</p>
                </div>
                <select [(ngModel)]="newUser.role" class="w-full border p-2 rounded">
                  <option value="pharmacist">Pharmacist</option>
                  <option value="customer">Customer</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button (click)="addUser()" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                Create User
              </button>
              <button (click)="closeUserModal()" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Confirmation Modal for Deletion -->
    @if (confirmDeleteModal()) {
       <div class="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="cancelDelete()"></div>
          <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  Delete {{ confirmDeleteType() | titlecase }}?
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Are you sure you want to delete this {{ confirmDeleteType() }}? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button (click)="proceedDelete()" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                Confirm
              </button>
              <button (click)="cancelDelete()" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class AdminDashboardComponent {
  dataService = inject(DataService);
  
  currentTab = signal<'inventory' | 'users' | 'reports' | 'requests' | 'settings'>('inventory');
  
  // Modals
  showAddMedModal = signal(false);
  showAddUserModal = signal(false);
  
  // Validation / Error state
  userExistsError = signal(false);
  errorMessage = signal('');

  // Confirmation Modal State
  confirmDeleteModal = signal(false);
  confirmDeleteType = signal<'medicine' | 'user' | null>(null);
  itemToDelete = signal<any>(null);

  // New Items State
  newMed = { name: '', price: 0, stock: 0 };
  newUser: User = { username: '', password: '', role: 'pharmacist' };

  // Search & Sort
  searchQuery = signal('');
  sortBy = signal<'name' | 'stock' | 'price'>('name');

  sortedMedicines = computed(() => {
    let meds = this.dataService.medicines().filter(m => 
      m.name.toLowerCase().includes(this.searchQuery().toLowerCase())
    );

    return meds.sort((a, b) => {
      if (this.sortBy() === 'stock') return a.stock - b.stock;
      if (this.sortBy() === 'price') return a.price - b.price;
      return a.name.localeCompare(b.name);
    });
  });

  requestNewMedicine() {
    if (!this.newMed.name) return;

    // Check for price and stock > 0
    if (this.newMed.price <= 0 || this.newMed.stock <= 0) {
      this.dataService.showNotification('Price and Initial Stock must be greater than 0', 'error');
      return;
    }

    // Check if duplicate
    const existsInInventory = this.dataService.medicines().some(m => m.name.toLowerCase() === this.newMed.name.toLowerCase());
    const existsInRequests = this.dataService.newMedicineRequests().some(r => r.name.toLowerCase() === this.newMed.name.toLowerCase() && r.status === 'pending');

    if (existsInInventory || existsInRequests) {
      this.dataService.showNotification('This medicine is already in inventory or pending approval!', 'error');
      return;
    }

    // Proceed
    this.dataService.requestNewMedicine({ ...this.newMed }, 'admin');
    this.showAddMedModal.set(false);
    this.newMed = { name: '', price: 0, stock: 0 };
  }

  // --- Deletion Logic with Confirmation ---

  initDeleteMedicine(id: number) {
    this.itemToDelete.set(id);
    this.confirmDeleteType.set('medicine');
    this.confirmDeleteModal.set(true);
  }

  initDeleteUser(username: string) {
    this.itemToDelete.set(username);
    this.confirmDeleteType.set('user');
    this.confirmDeleteModal.set(true);
  }

  cancelDelete() {
    this.confirmDeleteModal.set(false);
    this.itemToDelete.set(null);
    this.confirmDeleteType.set(null);
  }

  proceedDelete() {
    const item = this.itemToDelete();
    const type = this.confirmDeleteType();

    if (type === 'medicine') {
      this.dataService.deleteMedicine(item as number);
    } else if (type === 'user') {
      this.dataService.deleteUser(item as string);
    }

    this.cancelDelete();
  }

  deleteRequest(id: string) {
    // Requests are less critical, but can add confirmation if needed. 
    // Keeping immediate delete for requests as per typical workflow, 
    // but the prompt asked for "medicine or user".
    this.dataService.deleteRestockRequest(id);
  }

  addUser() {
    if (this.newUser.username && this.newUser.password) {
      try {
        this.dataService.addUser({ ...this.newUser });
        this.closeUserModal();
        this.newUser = { username: '', password: '', role: 'pharmacist' };
      } catch (e: any) {
        // Trigger center error
        this.errorMessage.set(e.message);
        this.userExistsError.set(true);
      }
    }
  }

  closeUserModal() {
    this.showAddUserModal.set(false);
    this.userExistsError.set(false);
  }


  getUserRole(username: string) {
    return this.dataService.users().find(u => u.username === username)?.role || 'Unknown';
  }

  // --- Backup & Restore Logic ---

  downloadBackup() {
    const data = this.dataService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `pims-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    this.dataService.showNotification('Backup downloaded successfully', 'success');
  }

  triggerFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          const success = this.dataService.importData(content);
          if (success) {
            // Reset input so same file can be selected again if needed
            input.value = '';
          }
        }
      };
      
      reader.readAsText(file);
    }
  }
}
