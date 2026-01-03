
import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <svg class="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <span class="ml-2 text-xl font-bold text-gray-900 tracking-tight">PIMS</span>
            </div>
            <div class="ml-10 flex space-x-4">
              <span class="px-3 py-2 rounded-md text-sm font-medium text-gray-500 bg-gray-50">
                Dashboard: <span class="text-gray-900">{{ role() | titlecase }}</span>
              </span>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-500">Welcome, {{ username() }}</span>
            
            <button (click)="onOpenProfile.emit()" class="p-1 rounded-full text-gray-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors" title="My Profile">
              <span class="sr-only">View profile</span>
              <svg class="h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            
            <button (click)="onLogout.emit()" class="text-sm text-red-600 hover:text-red-900 font-medium ml-2">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  role = input.required<string>();
  username = input.required<string>();
  onLogout = output<void>();
  onOpenProfile = output<void>();
}
