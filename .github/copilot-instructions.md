# Project Overview

This project is a web application that allows managers and staff to manage electric motorcycle dealerships.  
It is built using **Ant Design Pro**, **TailwindCSS**, and **JavaScript** for the frontend.  
The system covers dealers, vehicles, pricing, promotions, and orders (including installment payments).

## Folder Structure

- `/src`: Contains the frontend source code (React + Ant Design Pro + TailwindCSS).
- `/pages`: Page-level components (Dealers, Vehicles, Pricing, Promotions, Orders, Auth).
- `/components`: Application layouts (sidebar, header, dashboard layout).
- `/assets`: Static resources (logos, images, icons).
- `/api`: Connect to API(.NET)

## Libraries and Frameworks

- **React (Ant Design Pro)** for UI.
- **Ant Design v5 + Pro Components** for layout, tables, and forms.
- **TailwindCSS** for utility-first styling and responsive design.
- **JavaScript (ES6+)** for coding (with `allowJs` enabled in project config).

## Coding Standards

- Use semicolons at the end of each statement.
- Use single quotes for strings.
- Use **function-based components** in React.
- Use arrow functions for callbacks and event handlers.
- Keep API calls abstracted inside `/services` instead of directly in components.

## UI Guidelines

- Provide a toggle to switch between light and dark mode (via Ant Design theme tokens).
- Maintain a modern, clean, and responsive design (desktop + mobile).
- Use Ant Design Pro Layout for consistent navigation and sidebar.
- Use TailwindCSS utilities for spacing, flex/grid, and responsive tweaks.
- Ensure accessibility (ARIA labels, keyboard navigation support).
