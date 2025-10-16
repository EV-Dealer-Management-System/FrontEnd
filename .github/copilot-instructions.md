# Project Overview

This is a React-based web application for an **Electric Vehicle Dealer Management System** with comprehensive authentication, user role management, and EV dealership operations. Built with *Vite*, *Ant Design Pro*, *TailwindCSS*, and *JavaScript*.


## System Roles & Functionalities

### 1. Dealer Functions (Dealer Staff, Dealer Manager)
**a. Vehicle Information Management**
- View vehicle catalog, configurations, and pricing
- Compare vehicle models and features

**b. Sales Management**
- Create quotations, orders, and sales contracts
- Manage promotions and discounts
- Order vehicles from manufacturer based on demand
- Track vehicle delivery status to customers
- Manage payments (cash and installment plans)

**c. Customer Management**
- Store customer profiles and records
- Manage test drive appointments
- Record feedback and handle customer complaints

**d. Reporting**
- Sales reports by sales staff
- Customer and manufacturer debt reports

### 2. Manufacturer Functions (EVM Staff, Admin)
**a. Product & Distribution Management**
- Manage electric vehicle catalog (models, versions, colors)
- Manage total inventory and allocate vehicles to dealers
- Manage wholesale prices, discount policies, and dealer promotions

**b. Dealer Management**
- Manage contracts, sales targets, and dealer debts
- Manage dealer accounts in the system

**c. Reporting & Analytics**
- Sales reports by region and dealer
- Inventory and consumption rate analysis
- AI forecasting for production and distribution planning

### Folder Structure (Critical Patterns)
- /src/Pages/: Page components organized by user role (Admin, Customer, Home, Staff)
- /src/App/: Legacy business logic modules (being migrated to /src/Pages/)
- /src/api/api.js: Centralized Axios configuration with JWT interceptors
- /src/Router/: Route protection logic (ProtectedRoute.jsx, PublicRoute.jsx)

### Authentication Flow (Critical)
- *JWT Storage*: Token stored in localStorage.getItem("jwt_token")
- *Route Protection*: ProtectedRoute redirects to "/" if no token, PublicRoute redirects to "/login"
- *Axios Interceptors*: Automatically attach JWT to requests, handle 401 responses
### Page Components
- Use PageContainer from @ant-design/pro-components for consistent layout
- Wrap with Navbar component for navigation and user actions
- Generate mock EV data with React.useMemo() for demonstrations (vehicle models, pricing, dealer info)

### Form Handling
- Use LoginForm and ProFormText from Pro Components
- Implement detailed error handling with message.error() and Alert components
- Store user data in localStorage on successful authentication

### Styling Approach
- *Ant Design*: Primary UI framework with Pro Components for advanced layouts
- *TailwindCSS*: Utility classes for spacing, gradients (bg-gradient-to-br), and responsive design
- *Custom Classes*: Minimal custom CSS, leverage Ant Design's token system

### Adding New Pages
1. Create component in appropriate /src/Pages/[Role]/ directory
2. Add route to /src/App.jsx with proper route protection

### API Integration
1. Add service functions to /src/App/[Role]/[Module]/ (following existing pattern)
2. Use centralized api instance from /src/Api/api.js
3. Handle errors in components with try/catch and user-friendly messages

### Authentication Requirements
- Check ProtectedRoute logic before creating authenticated features
- Use localStorage.getItem("jwt_token") for auth state checks
- Always handle 401 responses (auto-handled by interceptor)

## Code Conventions

- *Function Components*: Use function ComponentName() instead of arrow functions
- *Imports*: Group by external libraries → internal components → business logic
- *Error Handling*: Provide Vietnamese error messages with fallbacks
- *Responsive Design*: Use Ant Design's Col with xs/sm/md/lg breakpoints + TailwindCSS utilities

## Code Simplicity Guidelines (Critical)
- *Keep Code Simple*: Write the absolute simplest code possible that beginners can understand
- *No Unnecessary Code*: Eliminate any redundant or extra code - focus absolutely on the project requirements only
- *Direct Implementation*: Write code that directly solves the problem without any extra layers or complications
- *No Over-Engineering*: Avoid advanced React patterns, complex abstractions, or clever solutions
- *Basic Functions Only*: Use simple, straightforward functions - no complex logic or nested operations
- *Minimal Code*: Write only what's needed for the feature - no extra utilities, helpers, or abstractions
- *Project Focus*: Every line of code must serve a direct purpose for this specific project
- *Clear and Simple*: Use descriptive Vietnamese or English names, keep logic obvious and explicit
- *Comments in Vietnamese*: Add explanatory comments for business logic in Vietnamese
- *EV Business Logic*: Focus on electric vehicle dealership operations - sales, inventory, dealer management