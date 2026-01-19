🩺 PIMS: Pharmaceutical Inventory Management System
===============================================

**PIMS** is a comprehensive, role-based inventory and sales management platform designed to bridge the gap between warehouse logistics and front-end pharmacy operations. Built with a modern Angular architecture, it provides real-time financial tracking, secure user management, and a streamlined supply chain workflow.



🚀 Key Features
---------------

### 🧳 Role-Based Access Control (RBAC)

The system is tailored for four distinct user archetypes, each with a specialized dashboard:

-   **SuperAdmin:** Full system oversight, user management, and data portability (Import/Export).

-   **Pharmacist:** Manages local pharmacy stock, processes sales, and initiates restock requests.

-   **Warehouse Worker:** Oversees bulk inventory, approves new medicine entries, and fulfills pharmacy restock orders.

-   **Customer:** Simple interface for browsing available medicine and viewing personal purchase history.

### 📦 Dual-Layer Inventory System

Unlike basic trackers, PIMS manages two distinct stock levels:

1.  **Pharmacy Stock:** Immediate "on-shelf" availability for customer sales.

2.  **Warehouse Stock:** Bulk storage used to fulfill internal "Restock Requests."

-   *Workflow:* When pharmacy stock is low, a request is sent to the Warehouse. Upon approval, stock is automatically deducted from the Warehouse and added to the Pharmacy.

### 💰 Real-Time Financials

The `DataService` layer performs live calculations to provide a snapshot of business health:

-   **Gross Sales:** Total revenue generated from all processed sales.

-   **Restock Expenses:** Cumulative cost of goods (calculated at a 2.5% discount from retail price).

-   **Net Profit:** Real-time liquidity calculation (Revenue - Expenses).

### 🔐 Security & Validation

-   **Robust Profiles:** Built-in validation for usernames (alphanumeric) and "Strong" password requirements (Length, Case, Digits, and Special Characters).

-   **Persistence:** State is managed via Angular Signals and persisted through `localStorage`, ensuring data survives page refreshes without a complex backend setup.


🛠 Tech Stack
-------------

-   **Framework:** [Angular 21](https://angular.io/) (utilizing Signals for reactive state)

-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)

-   **Build Tool:** [VS Code](https://code.visualstudio.com/)

-   **Language:** TypeScript



💻 Getting Started
------------------

### Prerequisites

-   **Node.js** (LTS version)

-   **Angular CLI** (`npm install -g @angular/cli`)

### Installation

1.  **Clone and Navigate:**

    Bash

    ```
    cd PIMS
    ```

2.  Install Dependencies:

    We use --legacy-peer-deps to ensure perfect compatibility between Angular 21 and the supporting ecosystem.

    Bash

    ```
    npm install --legacy-peer-deps
    ```

3.  **Run Development Server:**

    Bash

    ```
    ng serve
    ```

4.  Access the App:

    Open http://localhost:3000/ in your browser.



🔑 Default Credentials
----------------------

For testing and initial setup, the system initializes with the following users:

| **Role** | **Username** | **Password** |
| --- | --- | --- |
| **Admin** | `SuperAdmin` | `Admin123!` |
| **Pharmacist** | `usairam` | `User123!` |
| **Warehouse** | `storekeeper` | `User123!` |
| **Customer** | `awais` | `User123!` |



📂 Project Structure
--------------------

-   `src/app.component.ts`: The main application shell and navigation logic.

-   `src/services/data.service.ts`: The "brain" of the app, handling state, logic, and persistence.

-   `src/components/`: Modularized dashboards for each user role.



📝 Data Management
------------------

The Admin role includes a **Data Portability** feature. You can export the entire system state (Medicines, Users, Sales, and Requests) as a JSON file and restore it on another machine using the "Import" function.
