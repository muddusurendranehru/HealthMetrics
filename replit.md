# Overview

This is a health and fitness tracking web application built with a modern full-stack architecture. The application allows users to register, log in, and track various health metrics including meals, exercises, sleep patterns, weight, and water intake. It features a React frontend with TypeScript and a Node.js/Express backend, connected to a PostgreSQL database through Drizzle ORM.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: React Hook Form with Zod for validation
- **Build Tool**: Vite for fast development and optimized builds

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: bcrypt for password hashing, session-based auth
- **API Design**: RESTful endpoints with JSON responses
- **Error Handling**: Centralized error middleware

## Database Schema
The PostgreSQL database includes the following core entities:
- **Users**: Authentication and profile information
- **Meals**: Food logging with nutritional data (calories, protein, carbs, fat)
- **Exercises**: Workout tracking with duration and calories burned
- **Sleep Records**: Sleep quality and duration monitoring
- **Weight Tracking**: Weight progression over time
- **Water Intake**: Daily hydration tracking

## Development Setup
- **Monorepo Structure**: Shared schema and types between frontend and backend
- **Hot Reloading**: Vite dev server with HMR for frontend development
- **Database Migrations**: Drizzle Kit for schema management
- **Path Aliases**: Configured for clean imports (@/, @shared/)

## Security Considerations
- Password hashing with bcrypt (10 salt rounds)
- Input validation using Zod schemas
- CORS and security headers through Express middleware
- Environment variable management for sensitive data

## Build and Deployment
- **Frontend**: Vite builds to static assets in dist/public
- **Backend**: esbuild compiles TypeScript to optimized Node.js bundle
- **Database**: Uses Neon serverless PostgreSQL with connection pooling

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with WebSocket support
- **Connection Pooling**: @neondatabase/serverless for efficient database connections

## UI and Component Libraries
- **Radix UI**: Comprehensive set of unstyled, accessible UI primitives
- **Lucide React**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Class Variance Authority**: For component variant management

## Development and Build Tools
- **TypeScript**: Static type checking across the entire stack
- **Vite**: Fast build tool with plugin ecosystem
- **ESBuild**: JavaScript bundler for production backend builds
- **PostCSS**: CSS processing with Autoprefixer

## Authentication and Validation
- **bcrypt**: Secure password hashing and verification
- **Zod**: Runtime type validation and schema definitions
- **React Hook Form**: Form state management and validation

## State Management and Data Fetching
- **TanStack Query**: Server state management, caching, and synchronization
- **Wouter**: Lightweight routing solution for React

## Session Management
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **Express Session**: Session middleware for user authentication

## Development Experience
- **Replit Plugins**: Development banner and error overlay for Replit environment
- **Hot Module Replacement**: Fast development feedback loop
- **TypeScript Path Mapping**: Clean import statements with path aliases