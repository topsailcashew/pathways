# Pathways - Church Management System

A modern church management application built with React, TypeScript, and Firebase.

## Features

### Stage Progression & Communication

- **Automatic Stage Triggers**: System evaluates event attendance and suggests when members are ready to advance stages
- **Pastoral Oversight**: Staff reviews and approves all stage advancements
- **Multi-Channel Communication**: Track SMS, Email, WhatsApp, and phone communications
- **Message Templates**: Use stage-specific templates with variable substitution
- **Activity Timeline**: Comprehensive history of events, stage changes, and communications

### Member Management

- Track members through various stages of church integration
- View detailed member profiles with activity history
- Pipeline view for visual stage management

### Event Tracking

- Track event attendance for different event types
- Automatic trigger evaluation based on attendance patterns

## Setup

### Prerequisites

- Node.js 18+
- Firebase project configured
- Environment variables set up (see `.env.example`)

### Installation

```bash
# Install dependencies
npm install

# Seed stage progression data (triggers and templates)
npm run seed:stage-progression

# (Optional) Seed test activity data for development
npm run seed:test-activity
```

### Development

```bash
# Start development server
npm run dev

# Run TypeScript type checking
npx tsc --noEmit

# Build for production
npm run build
```

## Usage

### Stage Progression

1. Navigate to People or Pipeline page
2. Click on any person to open the detail panel
3. View stage progress and advancement suggestions
4. When all triggers are met, click "Advance Stage" to promote the member

### Communication

1. Open a person's detail panel
2. Select a communication channel (SMS, Email, WhatsApp, Phone)
3. Choose a template or write a custom message
4. Send via app or mark as sent manually
5. All communications are tracked in the activity timeline

### Activity Timeline

The timeline shows a comprehensive history of:
- Event attendances
- Stage changes
- All communications (inbound and outbound)

## Tech Stack

- **Frontend**: React 19.2.0, TypeScript
- **Backend**: Firebase/Firestore
- **Styling**: Tailwind CSS
- **Icons**: lucide-react
- **Build Tool**: Vite

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
