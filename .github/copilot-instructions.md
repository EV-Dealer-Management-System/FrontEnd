# Project Overview

This is a React-based web application for a service management system with authentication, user profiles, and service offerings. Built with *Vite*, *Ant Design Pro*, *TailwindCSS*, and *JavaScript*.

## Architecture & Key Patterns

### Folder Structure (Critical Patterns)
- /src/Pages/: Page components organized by user role (Admin, Customer, Home, Staff)
- /src/App/: Legacy business logic modules (being migrated to /src/Pages/)
- /src/Api/api.js: Centralized Axios configuration with JWT interceptors
- /src/Router/: Route protection logic (ProtectedRoute.jsx, PublicRoute.jsx)

### Authentication Flow (Critical)
- *JWT Storage*: Token stored in localStorage.getItem("jwt_token")
- *Route Protection*: ProtectedRoute redirects to "/" if no token, PublicRoute redirects to "/customer" if token exists

### Navigation Architecture
- *Navbar Component*: Uses @ant-design/pro-components/ProLayout with conditional user actions
- *Responsive Layout*: Full viewport width with calc(50% - 50vw) technique
- *User State*: Displays login/register buttons OR user dropdown based on JWT token presence

### Page Components
- Use PageContainer from @ant-design/pro-components for consistent layout
- Wrap with Navbar component for navigation and user actions
- Generate mock data with React.useMemo() for demonstrations

### Form Handling
- Use LoginForm and ProFormText from Pro Components
- Implement detailed error handling with message.error() and Alert components
- Store user data in localStorage on successful authentication

### Styling Approach
- *Ant Design*: Primary UI framework with Pro Components for advanced layouts
- *TailwindCSS*: Utility classes for spacing, gradients (bg-gradient-to-br), and responsive design
- *Custom Classes*: Minimal custom CSS, leverage Ant Design's token system

## Critical Developer Workflows

### Adding New Pages
1. Create component in appropriate /src/Pages/[Role]/ directory
2. Add route to /src/App.jsx with proper route protection

### API Integration
1. Add service functions to /src/App/[Module]/ (following existing pattern)
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
- *Keep Code Simple*: Write straightforward, readable code that beginners can understand
- *No Complex Patterns*: Avoid advanced React patterns, complex abstractions, or over-engineering
- *Clear Variable Names*: Use descriptive Vietnamese or English names that explain purpose
- *Basic Functions*: Use simple functions instead of complex arrow functions or closures
- *Minimal Abstractions*: Don't create unnecessary wrapper functions or custom hooks
- *Direct Approach*: Prefer direct, obvious solutions over clever or optimized code
- *Explicit Logic*: Make code flow obvious - avoid implicit behaviors or "magic"
- *Comments in Vietnamese*: Add explanatory comments for business logic in Vietnamese