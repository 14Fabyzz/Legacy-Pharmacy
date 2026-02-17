# Project Overview: Legacy Pharmacy Dashboard

## Introduction
This project is a pharmacy management dashboard known as **Legacy Pharmacy**. It is designed to manage inventory, sales, and user administration for a pharmacy business.

## Architecture
The application follows a microservices architecture with a decoupled frontend and backend.

### Frontend
- **Framework**: Angular 19.2.15
- **Type**: Hybrid (Standalone components + Modules)
- **Key Dependencies**:
  - `rxjs`: Reactive programming
  - `sweetalert2`: UI alerts/notifications
  - `@angular/ssr`: Server-Side Rendering support
- **Configuration**:
  - **API URL**: `http://localhost:8080/api/inventario` (defined in `src/environments/environment.ts`)

### Backend (Microservices)
Based on the available documentation (`SKILL.md`) and directory structure:
- **API Gateway**: Running on port `8080`.
- **Services**:
  - `inventory-service`: Manages products, stock, and kardex.
  - `MS-ventas`: Handles sales transactions (likely in a separate repository or directory not currently visible).
  - `ms-usuarios`: User management (Directory exists in root, but currently contains build artifacts; source may be external or unpulled).

## Development Guidelines
A comprehensive development guide is available in:
`c:\Users\LENOVO\OneDrive\otros\Escritorio\project\mi-dashboard\.agent\skills\legacy-pharmacy-dev\SKILL.md`

This guide covers:
- UI Design Patterns (Colors, Typography, Badges)
- Data Models (`ProductoCard`, `ProductoRequest`)
- Coding Best Practices
- Business Workflows (Search, Fractional Sales, Stock Entry)

## Project Structure
```
mi-dashboard/
├── src/
│   ├── app/                 # Application logic
│   ├── environments/        # Environment configuration
│   └── ...
├── ms-usuarios/             # Backend service (check for source code)
├── .agent/skills/           # AI Assistant Skills & Documentation
├── angular.json             # Angular CLI configuration
└── package.json             # Dependencies and scripts
```

## Setup & Running
1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Run Development Server**:
    ```bash
    ng serve
    ```
    Navigate to `http://localhost:4200/`.

3.  **Build**:
    ```bash
    ng build
    ```
