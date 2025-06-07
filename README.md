# CSV Manager

A Notion-like CSV management tool built with OpenSaaS template, using Vite + React (not Next.js as initially specified in requirements).

## Project Overview

This project was developed as a full-stack assessment, creating a CSV import and management tool with a Notion-like interface. While the original requirements specified Next.js, this implementation uses Vite + React as it's the framework provided by the OpenSaaS template.

### Key Features
- **Modern, Intuitive UI**
  - Clean, minimal design inspired by Notion
  - Responsive layout for all screen sizes
  - Smooth animations and transitions
  - Consistent design language using Shadcn UI components
  - Dark/Light mode support

- **Advanced CSV Management**
  - Drag & drop file upload with progress tracking
  - Multi-step import process with field mapping
  - Real-time data preview
  - Batch type management for different CSV structures
  - Automatic column type detection

- **Notion-like Data Table**
  - Interactive cell editing with keyboard shortcuts
  - Column management (show/hide, reordering)
  - Advanced sorting and filtering
  - Pagination with customizable page sizes
  - Row selection and bulk actions
  - Inline cell validation

- **User Experience**
  - Intuitive navigation with breadcrumbs
  - Contextual tooltips and help text
  - Loading states and skeleton screens
  - Error boundaries with user-friendly messages
  - Success/error notifications
  - Empty states with helpful guidance

## Technical Stack
- **Framework**: OpenSaaS (https://opensaas.sh/)
- **Frontend**: Vite + React (OpenSaas provided frontend framework. It is confusing to use Next.js with OpenSass)
- **Backend**: Node.js
- **Database**: PostgreSQL
- **UI Components**: 
  - Shadcn UI (for consistent, accessible components)
  - Tailwind CSS (for styling)
  - Lucide Icons (for iconography)
  - React Hot Toast (for notifications)
  - React Dropzone (for file uploads)
  - React Hook Form (for form management)
  - Zod (for form validation)
- **State Management & Data Fetching**:
  - React Query (for server state management)
  - Zustand (for client state management)
- **Table Management**:
  - TanStack Table (for advanced table features)
  - React Virtual (for virtualized lists)
- **Development Tools**:
  - TypeScript (for type safety)
  - ESLint (for code linting)
  - Prettier (for code formatting)
  - Husky (for git hooks)
- **Testing**:
  - Vitest (for unit testing)
  - React Testing Library (for component testing)
- **Build Tools**:
  - Vite (for development and building)
  - PostCSS (for CSS processing)
  - Autoprefixer (for CSS compatibility)

## Development Setup

### Prerequisites
- Node.js (latest LTS version recommended)
- PostgreSQL
- Git

### Environment Setup
1. Clone the repository
2. Create the following environment files in the project root:
   - `.env.client` - Frontend environment variables
   - `.env.server` - Backend environment variables
   - `.env` - Database connection string

### Running the Application
1. Navigate to the app directory:
   ```bash
   cd app
   ```

2. Start the database:
   ```bash
   wasp start db
   ```

3. Start the development server:
   ```bash
   wasp start
   ```

4. [First-time setup] Run database migrations:
   ```bash
   wasp db migrate-dev 
   ```

### Project Structure
```
app/
├── src/
│   └── csv-manager/
│       ├── csv-files/           # CSV management features
│       │   ├── components/      # Step-by-step import components
│       │   ├── actions.ts       # Backend operations
│       │   └── queries.ts       # Data fetching
│       ├── batch-types/         # Batch type management
│       └── dashboard/           # Dashboard components
├── schema.prisma               # Database schema
└── main.wasp                  # Wasp configuration
```

## Framework Note
The original assessment requirements specified Next.js as the frontend framework. However, this implementation uses Vite + React as it's the framework provided by the OpenSaaS template. This decision was made after careful consideration:

1. **Initial Confusion**: The requirement for Next.js initially created some uncertainty, as OpenSaaS uses Vite + React by default. This led to a deeper investigation of the template's architecture.

2. **Decision Factors**:
   - OpenSaaS's built-in authentication and infrastructure are tightly coupled with Vite + React
   - The template provides optimized build configurations and development tools
   - Existing components and utilities are designed for Vite + React
   - Migration to Next.js would require significant refactoring

3. **Resolution**: After analyzing the requirements and the OpenSaaS template, it became clear that the core functionality (CSV management, Notion-like interface) could be implemented effectively using either framework. The decision to stick with Vite + React was made to:
   - Maintain consistency with the OpenSaaS ecosystem
   - Leverage the existing authentication and infrastructure
   - Ensure compatibility with the template's features
   - Focus development efforts on feature implementation rather than framework migration

The core functionality remains the same, with the only difference being the underlying framework. This approach allowed for faster development and better integration with the OpenSaaS template's features.

## Features Implementation
- **CSV Upload**: Multi-step process with field mapping and validation
- **Data Table**: Notion-like interface with advanced sorting, filtering, and editing
- **Batch Types**: Flexible support for different CSV structures
- **User Management**: Secure file access and user-specific operations
- **UI/UX**: Modern, responsive design with attention to user experience

## Contributing
This is an assessment project and is not open for contributions.

## License
This project is proprietary and confidential.

