# Door-to-Door Sales App Plan

## Overview
A mobile-first sales app with map-based navigation as the primary interface. Users can view, pin, and track their sales projects/leads geographically.

---

## Core Features

### 1. Home Screen
- User info/profile summary
- Workflow stages overview (see projects by status)
- Favorite/pinned projects for quick access
- Keep it minimal and clean

### 2. Map View
- Full-screen interactive map
- Display pins for user's projects/leads
- Current location tracking
- Tap pins to view details
- **Quick workflow filter** (fast toggle by workflow)
- **Advanced filters** (status, owner, date, etc.)
- Access to **projects list view** from map

### 3. Project Data Model
**Core Fields:**
- Name
- Age (with update history - reason required for changes)
- Address

**Properties:**
- Stage (position in workflow)
- Workflow (which workflow the project belongs to - supports multiple workflows)
- Owners (who owns the project)
- Assignees (who is assigned to work on it)

### 4. Workflows
- Multiple workflows supported (8 total planned)
- Workflows are **predefined from web/desktop app** (no mobile configuration)
- Each workflow has its own stages
- Projects are assigned to a specific workflow

**Example Workflow - "Jobs - Cash":**
1. Needs Quote
2. Quote Created
3. Proposal Presented
4. Follow Up
5. Signed
6. Production Review
7. Manager Approval

**Activity/History:**
- Notes
- Property change log
- Timeline of all updates

**Projects List View:**
- Accessible from Map screen
- See all projects in list format
- Same filters as map view

### 5. Pin/Location Features
- Drop pins on addresses
- Pin colors/icons by workflow status
- Quick actions from pin popup
- Navigate to address

### 6. Inbox (Activity Feed)
- Recent actions and updates across all projects
- Timeline of activity
- Quick access to affected projects

---

## Screen Structure

```
app/(app)/
├── _layout.tsx          # App shell with bottom tab nav
├── (tabs)/
│   ├── _layout.tsx      # Tab bar configuration
│   ├── index.tsx        # Home screen
│   ├── map.tsx          # Map view
│   ├── new.tsx          # Add new project
│   └── inbox.tsx        # Inbox/notifications
├── projects/
│   ├── [id].tsx         # Project detail
│   └── edit.tsx         # Edit project
└── settings/
    └── index.tsx        # User settings (accessed from header/menu)
```

---

## Navigation
- **Bottom Tab Bar** (4 tabs, room for 5th):
  1. **Home** - Dashboard/overview
  2. **Map** - Map view with pins
  3. **Add** - Create new project
  4. **Inbox** - Messages/notifications
  5. _(TBD)_ - Future tab

---

## Tech Stack
- React Native + Expo
- Expo Router (file-based navigation)
- react-native-maps (map component)
- Design System components from `/components/ui`
- **Mock data initially** (API integration later)
- Local state management for prototyping

---

## Phase 1: Foundation
1. Set up bottom tab navigation (Home, Map, Add, Inbox)
2. Create placeholder screens for all tabs
3. Set up mock data structure (projects, workflows, users)

## Phase 2: Map & Projects Core
1. Implement map view with current location
2. Display project pins on map
3. Build project detail screen
4. Implement projects list view (accessible from map)
5. Build "Add new project" flow

## Phase 3: Home & Filters
1. Build Home screen (user info, workflows overview, favorites)
2. Add quick workflow filter on map
3. Add advanced filters
4. Implement favorite/pin projects

## Phase 4: Activity & Polish
1. Build Inbox/Activity feed
2. Project activity timeline (notes, property changes)
3. Age update with notes/reason
4. Final polish and navigation refinements

---

## Open Questions (Resolved)
- ~~What data should a "project" contain?~~ → Defined above
- ~~What statuses/stages should projects have?~~ → Custom per workflow
- ~~Backend/data persistence approach?~~ → Mock data for now

## Remaining Questions
- Other 7 workflows and their stages (can define as we build)
- Team/multi-user features scope
- Offline support requirements

---

## Map View UI Details

### Header Bar (at top of map)
- **Tabs**: Map | Route | List (20-24px height, compact)
  - Route is future feature (disabled for now)
  - Map and List are active
- **Filter button**: Right-aligned next to tabs, opens filter sheet

### Floating Controls
- **Search button**: Bottom-right corner, 36px icon button
  - Opens search/address lookup (future implementation)

---

## Files to Create/Modify

**Phase 1:**
- `app/(app)/_layout.tsx` - Bottom tab navigation
- `app/(app)/(tabs)/_layout.tsx` - Tab bar config
- `app/(app)/(tabs)/index.tsx` - Home screen
- `app/(app)/(tabs)/map.tsx` - Map screen
- `app/(app)/(tabs)/new.tsx` - Add project screen
- `app/(app)/(tabs)/inbox.tsx` - Activity feed
- `lib/mock-data.ts` - Mock data for projects, workflows

**Phase 2+:**
- `app/(app)/projects/[id].tsx` - Project detail
- `app/(app)/projects/list.tsx` - Projects list view
- `components/` - Reusable components as needed

## Verification
1. App launches to Home tab
2. Bottom tabs navigate between all 4 screens
3. Map shows current location with pins
4. Can view project details from map pin
5. Can create new project
6. Activity feed shows updates
