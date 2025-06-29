# SafeBubble - Weather & Family Safety App

**A unified emergency monitoring solution that combines friend/family location tracking with real-time weather and disaster data.**

## Problem Statement

During emergencies, users frequently switch between location-sharing apps (Find My, Life360) and weather apps to track both people and hazardous conditions. This creates friction and delays in critical situations where every second counts.

## Our Solution

SafeBubble provides a unified platform that combines:
- **Location Management**: Track important places (home, work, family locations)
- **Weather Integration**: Real-time weather alerts and radar overlays
- **Risk Assessment**: Automatic risk level calculation based on proximity to weather events
- **Focus Mode(Emergency Mode)**: Optimized interface for high-stress situations

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd safebubble-app
npm run install:all
```

2. **Start the development servers:**
```bash
npm run dev
```

This will start:
- Frontend (React): http://localhost:3000
- Backend (Express): http://localhost:5000

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server  
- **Tailwind CSS** - Styling framework
- **Leaflet** - Interactive maps
- **React Leaflet** - React components for Leaflet

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **CORS** - Cross-origin requests
- **node-cron** - Scheduled tasks for weather updates

### APIs & Services
- **OpenStreetMap** - Free map tiles
- **Nominatim** - Geocoding service
- **OpenWeatherMap** - Weather data (ready for integration)

## Features

### Implemented (MVP)
- **Interactive Map** with location markers
- **Location Management** - Add, view, categorize important places
- **Risk Assessment** - Automatic risk level calculation (Low/Medium/High)
- **Weather Alerts** - Simulated weather warnings and emergency notifications
- **12-Hour Storm Forecast** - Predictive storm path and impact timeline
- **Mobile Responsive** - Optimized for emergency use on mobile devices
- **Focus Mode(Emergency Mode)** - Enhanced visibility for critical situations
- **Local Storage** - Persistent location data

### Planned Features (Next Phase)
- **Real-time Location Sharing** - Integration with Find My, Life360 APIs
- **Live Weather Radar** - Animated weather map overlays
- **Push Notifications** - Instant alerts for location-based risks
- **Multi-hazard Support** - Earthquakes, traffic, political unrest data
- **Advanced Analytics** - Historical risk patterns and predictions
- **Team Management** - Family/group collaboration features

> **Note:**  
> This MVP version uses browser localStorage for all data persistence. No backend database is required, making setup and demo frictionless and enabling offline use.  
> The architecture is designed for easy future migration to a cloud database (e.g., MongoDB, PostgreSQL, Firebase) as needed.

## Development Checklist

### Project Setup & Infrastructure
- [x] Vite + React frontend configured
- [x] Express backend API initialized
- [x] Tailwind CSS styling integrated
- [x] Leaflet + RainViewer overlays working
- [x] Local storage for persistent data
- [x] Mobile responsive structure

### Core Features Built
- [x] Map display with location markers
- [x] Add/view/remove family & location points
- [x] Simulated weather alerts (tornado, thunderstorm)
- [x] Risk level color-coded markers
- [x] Focus Mode(Emergency Mode) toggle for high-stress UX
- [x] 12-hour storm forecast simulation

### State Management & API Integration
- [x] Custom React hooks for locations & weather
- [x] Risk assessment logic based on weather proximity
- [x] API endpoints for health, weather, locations
- [x] Demo data with realistic emergency scenarios

### Demo Readiness
- [x] Application functional on `localhost:3000`
- [x] Pre-loaded demo data for showcase
- [x] Focus Mode(Emergency Mode) demonstration
- [x] Risk level changes on proximity simulation
- [x] Mobile view tested

### Pitch Preparation
- [x] Clear problem statement aligned with family safety needs
- [x] Unified solution demonstrated live
- [x] Competitive analysis vs. Find My, weather apps
- [x] Business model & go-to-market strategy prepared

## Architecture

```
safebubble-app/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API integration
│   │   └── utils/          # Utility functions
├── server/                 # Express backend
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── utils/              # Server utilities
└── package.json           # Root package management
```

## API Endpoints

### Weather & Alerts
- `GET /api/weather/alerts` - Get all active weather alerts
- `GET /api/weather/:lat/:lng` - Get weather for specific coordinates
- `GET /api/weather/forecast/:lat/:lng` - Get 12-hour storm path prediction
- `GET /api/emergency/active-alerts` - Get high-priority emergency alerts

### Location Management
- `POST /api/locations/assess-risk` - Assess risk levels for multiple locations
- `POST /api/locations/predict-impact` - Predict impact timeline for locations

### System Health
- `GET /api/health` - Server health check and statistics

## Demo Data

The app includes realistic demo data featuring:
- **3 Sample Locations**: Home, Office, Family location
- **Dynamic Weather Alerts**: Tornado warnings, thunderstorm alerts
- **Risk Level Simulation**: Locations automatically update risk levels based on proximity to weather events

## Business Model

### Market Opportunity
- **Primary Market**: Families with dispersed members (25M+ US households)
- **Secondary Market**: Companies with distributed workforce
- **Emergency Market**: First responders and emergency management

### Revenue Streams
- **Freemium Model**: Basic features free, premium features paid
- **Enterprise Plans**: Custom solutions for businesses
- **API Licensing**: Location/weather data to third parties

### Competitive Advantage
- **Unified Experience** - Single app vs multiple apps
- **Emergency-Optimized UX** - Designed for high-stress situations
- **Multi-hazard Intelligence** - Beyond just weather

## Go-to-Market Strategy

1. **Phase 1** (MVP - Current): Core location + weather features
2. **Phase 2** (3 months): Real-time location integration, mobile app
3. **Phase 3** (6 months): AI-powered risk prediction, enterprise features
4. **Phase 4** (12 months): Global expansion, multi-language support

## Development

### Available Scripts
```bash
npm run dev          # Start both frontend and backend in development
npm run dev:client   # Start only frontend
npm run dev:server   # Start only backend
npm run build        # Build production frontend
npm run start        # Start production server
```

### Environment Variables
Create a `.env` file in the server directory:
```env
PORT=5000
OPENWEATHER_API_KEY=your_api_key_here
```

## Performance

- **Load Time**: < 2 seconds on 3G
- **Map Rendering**: < 1 second for 50+ locations  
- **Weather Updates**: Every 5 minutes
- **Offline Support**: Core features work offline

## Next Steps

1. **Real API Integration** - Connect to OpenWeatherMap, USGS, traffic APIs
2. **Location Sharing APIs** - Integrate with Find My, Google Family Link
3. **Mobile App Development** - React Native implementation
4. **Advanced Notifications** - Push notifications, SMS alerts
5. **Machine Learning** - Predictive risk assessment

##  License

MIT License - See LICENSE file for details
