
import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, User } from '../services/data.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div class="text-center">
          <div class="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg class="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h2 class="mt-2 text-3xl font-extrabold text-gray-900">Sign in to PIMS</h2>
          <p class="mt-2 text-sm text-gray-600">
            Pharmaceutical Inventory Management System
          </p>
        </div>

        <form class="mt-8 space-y-6" (ngSubmit)="login()">
          @if (errorMsg()) {
            <div class="rounded-md bg-red-50 p-4 border border-red-200">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">{{ errorMsg() }}</h3>
                </div>
              </div>
            </div>
          }

          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="username" class="sr-only">Username</label>
              <input id="username" name="username" type="text" required 
                [(ngModel)]="username"
                class="appearance-none rounded-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                placeholder="Username">
            </div>
            <div>
              <label for="password" class="sr-only">Password</label>
              <input id="password" name="password" type="password" required 
                [(ngModel)]="password"
                class="appearance-none rounded-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                placeholder="Password">
            </div>
          </div>

          <div>
            <button type="submit" 
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg class="h-5 w-5 text-blue-500 group-hover:text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
              </span>
              Sign in
            </button>
          </div>
        </form>

        <!-- Restore Data Section -->
        <div class="mt-6 border-t border-gray-200 pt-6">
           <p class="text-xs text-center text-gray-500 mb-3">Moving to a new device?</p>
           <button (click)="fileInput.click()" class="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors">
              <svg class="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4 4m0 0L8 8m4-4v12" />
              </svg>
              Restore from Backup File
           </button>
           <input #fileInput type="file" (change)="restoreData($event)" class="hidden" accept=".json">
        </div>
        
        <div class="mt-4 text-center text-xs text-gray-500">
          <p class="font-semibold mb-1">Demo Credentials:</p>
          <div class="grid grid-cols-2 gap-2 max-w-sm mx-auto">
            <span class="bg-gray-100 rounded px-2 py-1">SuperAdmin / Admin123!</span>
            <span class="bg-gray-100 rounded px-2 py-1">usairam / User123!</span>
            <span class="bg-gray-100 rounded px-2 py-1">storekeeper / User123!</span>
            <span class="bg-gray-100 rounded px-2 py-1">awais / User123!</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  errorMsg = signal('');
  
  onLoginSuccess = output<User>();
  
  private dataService = inject(DataService);

  login() {
    this.errorMsg.set('');
    const user = this.dataService.users().find(u => 
      u.username === this.username && u.password === this.password
    );

    if (user) {
      this.onLoginSuccess.emit(user);
    } else {
      this.errorMsg.set('Invalid username or password');
    }
  }

  restoreData(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (content) {
          const success = this.dataService.importData(content);
          if (success) {
            this.username = '';
            this.password = '';
            // Reset input
            input.value = '';
          }
        }
      };
      
      reader.readAsText(file);
    }
  }
}
