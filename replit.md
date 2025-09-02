# Overview

GoMeasure is a Next.js web application for ordering professional 3D scanning and LiDAR capture services. The application provides a multi-step order form where customers can specify property details, schedule appointments, provide contact information, and review their order before payment. The system is designed for both residential and commercial property scanning services with interior and exterior capture options.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: Next.js 15.5.2 with React 19 and TypeScript
- **Styling**: CSS modules with custom CSS variables for consistent theming
- **State Management**: React Context API with `OrderProvider` for managing order state across steps
- **Client-Side Storage**: Session storage for persisting order data during the user session
- **Navigation**: Next.js App Router with nested layouts and dynamic routing

## Component Structure
- **Layout Pattern**: Nested layouts with a main order layout containing progress navigation and sticky footer
- **Step Components**: Modular components for each order step (Property, Schedule, Contact, Review)
- **Shared Components**: Reusable header, progress indicator, and navigation components
- **Form Handling**: Controlled components with real-time state updates and validation

## Data Management
- **Order Context**: Centralized state management using React Context for schedule data
- **Session Persistence**: Automatic saving and restoration of order state from session storage
- **Form State**: Local component state with parent-child data flow for form updates

## UI/UX Design
- **Design System**: Custom CSS variables for colors, typography, and spacing with a pink accent color (#db0f83)
- **Responsive Design**: Grid-based layouts that adapt to mobile screens
- **Typography**: Figtree font family with consistent font sizing scale
- **Interactive Elements**: Accordion-style schedule selectors, calendar components, and progress indicators

## Routing Strategy
- **App Router**: Next.js 13+ app directory structure with nested routing
- **Order Flow**: Sequential steps through /order/property → /order/schedule → /order/contact → /order/review → /order/payment
- **Navigation**: Programmatic routing with next/navigation hooks and step validation

# External Dependencies

## Core Framework Dependencies
- **Next.js 15.5.2**: React framework for production applications
- **React 19.1.1**: Core React library with latest features
- **TypeScript 5.9.2**: Static type checking for development

## Styling and UI
- **Tailwind CSS 4.0.15**: Utility-first CSS framework (configured but not actively used in favor of custom CSS)
- **Google Fonts**: Figtree font family loaded via CDN
- **Custom CSS Variables**: Design token system for consistent theming

## Development Tools
- **ESLint**: Code linting with Next.js configuration
- **TypeScript**: Type safety and development experience enhancement

## Future Integrations (Referenced in Components)
- **Leaflet**: Interactive maps for property area estimation (referenced in component files)
- **Nominatim API**: Address geocoding and validation services
- **Stripe**: Payment processing (placeholder components exist)
- **Email Services**: Order confirmation and communication systems

## Browser APIs
- **Session Storage**: Client-side data persistence
- **Geolocation**: Potential future integration for property location services
- **File APIs**: Future integration for document uploads and property images