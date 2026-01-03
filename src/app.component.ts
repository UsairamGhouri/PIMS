
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User, DataService } from './services/data.service';
import { LoginComponent } from './components/login.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard.component';
import { PharmacistDashboardComponent } from './components/pharmacist/pharmacist-dashboard.component';
import { CustomerDashboardComponent } from './components/customer/customer-dashboard.component';
import { WarehouseDashboardComponent } from './components/warehouse/warehouse-dashboard.component';
import { NavbarComponent } from './components/layout/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    LoginComponent, 
    AdminDashboardComponent, 
    PharmacistDashboardComponent, 
    CustomerDashboardComponent,
    WarehouseDashboardComponent,
    NavbarComponent
  ],
  template: `
    <!-- Notifications Container -->
    <div class="fixed top-16 right-4 z-50 flex flex-col space-y-2 pointer-events-none">
      @for (note of dataService.notifications(); track note.id) {
        <div class="pointer-events-auto transform transition-all duration-300 ease-in-out bg-white border-l-4 rounded shadow-lg p-4 min-w-[300px]"
          [class.border-green-500]="note.type === 'success'"
          [class.border-red-500]="note.type === 'error'"
          [class.border-blue-500]="note.type === 'info'">
          <div class="flex items-start">
             <div class="flex-shrink-0">
               @if (note.type === 'success') {
                 <svg class="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
               } @else if (note.type === 'error') {
                  <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
               } @else {
                  <svg class="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
               }
             </div>
             <div class="ml-3 w-0 flex-1 pt-0.5">
               <p class="text-sm font-medium text-gray-900">{{ note.message }}</p>
             </div>
          </div>
        </div>
      }
    </div>

    @if (currentUser()) {
      <app-navbar 
        [role]="currentUser()!.role" 
        [username]="currentUser()!.username"
        (onLogout)="logout()"
        (onOpenProfile)="openProfile()">
      </app-navbar>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        @switch (currentUser()?.role) {
          @case ('admin') {
            <app-admin-dashboard></app-admin-dashboard>
          }
          @case ('pharmacist') {
            <app-pharmacist-dashboard [username]="currentUser()!.username"></app-pharmacist-dashboard>
          }
          @case ('customer') {
            <app-customer-dashboard [username]="currentUser()!.username"></app-customer-dashboard>
          }
          @case ('warehouse') {
            <app-warehouse-dashboard></app-warehouse-dashboard>
          }
        }
      </main>
    } @else {
      <app-login (onLoginSuccess)="handleLogin($event)"></app-login>
    }

    <!-- Profile Management Modal -->
    @if (showProfileModal()) {
      <div class="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="showProfileModal.set(false)"></div>
          <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            
            <div class="absolute top-0 right-0 pt-4 pr-4">
              <button (click)="showProfileModal.set(false)" class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none">
                <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">My Profile</h3>
                <div class="mt-4 space-y-4">
                  
                  <!-- Username Field -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Username</label>
                    <input [(ngModel)]="editProfileData.username" 
                      [disabled]="currentUser()?.username === 'SuperAdmin'"
                      class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500">
                    @if (usernameError()) {
                       <p class="mt-1 text-xs text-red-600">{{ usernameError() }}</p>
                    }
                    <p class="text-xs text-gray-500 mt-1">First letter alphabet. Only letters, numbers, and underscores.</p>
                  </div>

                  <!-- Password Field -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700">New Password</label>
                    <input type="text" [(ngModel)]="editProfileData.password" 
                       class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    @if (passwordError()) {
                       <p class="mt-1 text-xs text-red-600">{{ passwordError() }}</p>
                    }
                    <ul class="text-xs text-gray-500 mt-1 list-disc pl-4 space-y-0.5">
                      <li>At least 8 characters</li>
                      <li>Upper & Lowercase letters</li>
                      <li>At least one digit</li>
                      <li>At least one special character</li>
                    </ul>
                  </div>

                  <!-- Role (Read Only) -->
                   <div>
                    <label class="block text-sm font-medium text-gray-700">Role</label>
                    <input [value]="currentUser()?.role | titlecase" disabled
                       class="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm text-gray-600 cursor-not-allowed">
                  </div>
                </div>
              </div>
            </div>

            <!-- Global Modal Footer -->
            <div class="mt-8 sm:flex sm:flex-row-reverse sm:justify-between">
               <button (click)="saveProfile()" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:w-auto sm:text-sm">
                Save Changes
              </button>
              
              @if (currentUser()?.username !== 'SuperAdmin') {
                <button (click)="showDeleteConfirm.set(true)" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-100 text-base font-medium text-red-700 hover:bg-red-200 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">
                  Delete My Account
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Delete Account Confirmation Modal -->
    @if (showDeleteConfirm()) {
      <div class="fixed z-[60] inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" (click)="showDeleteConfirm.set(false)"></div>
          <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Delete Account?</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Are you sure you want to delete your account? This action cannot be undone and you will lose access immediately.
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button (click)="deleteMyAccount()" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                Confirm Delete
              </button>
              <button (click)="showDeleteConfirm.set(false)" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class AppComponent {
  dataService = inject(DataService);
  currentUser = signal<User | null>(null);

  // Profile Modal State
  showProfileModal = signal(false);
  showDeleteConfirm = signal(false);
  editProfileData = { username: '', password: '' };
  
  usernameError = signal<string | null>(null);
  passwordError = signal<string | null>(null);

  handleLogin(user: User) {
    this.currentUser.set(user);
    this.dataService.showNotification(`Welcome back, ${user.username}!`, 'success');
  }

  logout() {
    this.currentUser.set(null);
    this.dataService.showNotification('Signed out successfully');
  }

  openProfile() {
    if (!this.currentUser()) return;
    // Copy current data to edit form
    this.editProfileData = {
      username: this.currentUser()!.username,
      password: this.currentUser()!.password
    };
    this.usernameError.set(null);
    this.passwordError.set(null);
    this.showProfileModal.set(true);
  }

  saveProfile() {
    const user = this.currentUser();
    if (!user) return;

    // Reset errors
    this.usernameError.set(null);
    this.passwordError.set(null);

    // Validate
    const uErr = this.dataService.validateUsername(this.editProfileData.username);
    const pErr = this.dataService.validatePassword(this.editProfileData.password);

    if (uErr) {
      this.usernameError.set(uErr);
      return;
    }
    if (pErr) {
      this.passwordError.set(pErr);
      return;
    }

    try {
      this.dataService.updateUser(user.username, {
        ...user,
        username: this.editProfileData.username,
        password: this.editProfileData.password
      });

      // Update local state
      this.currentUser.set({
        ...user,
        username: this.editProfileData.username,
        password: this.editProfileData.password
      });

      this.showProfileModal.set(false);
    } catch (e: any) {
      this.dataService.showNotification(e.message, 'error');
    }
  }

  deleteMyAccount() {
    const user = this.currentUser();
    if (user && user.username !== 'SuperAdmin') {
      this.dataService.deleteUser(user.username);
      this.showDeleteConfirm.set(false);
      this.showProfileModal.set(false);
      this.logout();
    }
  }
}
