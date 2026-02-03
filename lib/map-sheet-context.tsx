import React, { createContext, useContext, useCallback, useMemo, useReducer } from 'react';

// ============================================================================
// Types
// ============================================================================

export type TabType = 'add';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type AppState =
  | { type: 'default' }
  | { type: 'tab'; tab: TabType; coordinates?: Coordinates }
  | { type: 'pin-preview'; projectId: string }
  | { type: 'project-detail'; projectId: string; showActivity?: boolean }
  | { type: 'project-activity'; projectId: string };

export type SheetSnapPoint = 'peek' | 'half' | 'full';

type MapSheetState = {
  appState: AppState;
  snapPoint: SheetSnapPoint;
};

type MapSheetAction =
  | { type: 'OPEN_TAB'; tab: TabType; coordinates?: Coordinates }
  | { type: 'SELECT_PROJECT'; projectId: string }
  | { type: 'EXPAND_PROJECT'; projectId: string; showActivity?: boolean }
  | { type: 'ENTER_ACTIVITY'; projectId: string }
  | { type: 'EXIT_ACTIVITY'; projectId: string }
  | { type: 'CLOSE_SHEET' }
  | { type: 'SET_SNAP_POINT'; snapPoint: SheetSnapPoint };

type MapSheetContextValue = {
  /** Current app state */
  appState: AppState;
  /** Current sheet snap point */
  snapPoint: SheetSnapPoint;
  /** Whether sheet is visible */
  isSheetVisible: boolean;
  /** Open a tab sheet, optionally with coordinates for new project */
  openTab: (tab: TabType, coordinates?: Coordinates) => void;
  /** Select a project (pin tap) - shows preview */
  selectProject: (projectId: string) => void;
  /** Expand to full project detail view. Pass showActivity to open directly to activity tab. */
  expandProject: (projectId: string, showActivity?: boolean) => void;
  /** Enter the project activity view */
  enterActivity: (projectId: string) => void;
  /** Exit activity view back to project detail */
  exitActivity: (projectId: string) => void;
  /** Close the sheet and return to default state */
  closeSheet: () => void;
  /** Set the snap point */
  setSnapPoint: (snapPoint: SheetSnapPoint) => void;
};

// ============================================================================
// Initial State & Reducer
// ============================================================================

const initialState: MapSheetState = {
  appState: { type: 'default' },
  snapPoint: 'half',
};

function mapSheetReducer(state: MapSheetState, action: MapSheetAction): MapSheetState {
  console.log('=== mapSheetReducer ===');
  console.log('Action:', action.type, action);
  console.log('Current state:', state);

  let newState: MapSheetState;

  switch (action.type) {
    case 'OPEN_TAB':
      newState = {
        appState: { type: 'tab', tab: action.tab, coordinates: action.coordinates },
        snapPoint: 'half',
      };
      break;
    case 'SELECT_PROJECT':
      newState = {
        appState: { type: 'pin-preview', projectId: action.projectId },
        snapPoint: 'peek',
      };
      break;
    case 'EXPAND_PROJECT':
      newState = {
        appState: { type: 'project-detail', projectId: action.projectId, showActivity: action.showActivity },
        snapPoint: action.showActivity ? 'full' : 'half',
      };
      break;
    case 'ENTER_ACTIVITY':
      newState = {
        appState: { type: 'project-activity', projectId: action.projectId },
        snapPoint: 'full',
      };
      break;
    case 'EXIT_ACTIVITY':
      newState = {
        appState: { type: 'project-detail', projectId: action.projectId },
        snapPoint: 'half',
      };
      break;
    case 'CLOSE_SHEET':
      newState = {
        appState: { type: 'default' },
        snapPoint: 'half',
      };
      break;
    case 'SET_SNAP_POINT':
      newState = {
        ...state,
        snapPoint: action.snapPoint,
      };
      break;
    default:
      newState = state;
  }

  console.log('New state:', newState);
  return newState;
}

// ============================================================================
// Context & Provider
// ============================================================================

const MapSheetContext = createContext<MapSheetContextValue | null>(null);

export function MapSheetProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(mapSheetReducer, initialState);

  const openTab = useCallback((tab: TabType, coordinates?: Coordinates) => {
    dispatch({ type: 'OPEN_TAB', tab, coordinates });
  }, []);

  const selectProject = useCallback((projectId: string) => {
    dispatch({ type: 'SELECT_PROJECT', projectId });
  }, []);

  const expandProject = useCallback((projectId: string, showActivity?: boolean) => {
    dispatch({ type: 'EXPAND_PROJECT', projectId, showActivity });
  }, []);

  const enterActivity = useCallback((projectId: string) => {
    dispatch({ type: 'ENTER_ACTIVITY', projectId });
  }, []);

  const exitActivity = useCallback((projectId: string) => {
    dispatch({ type: 'EXIT_ACTIVITY', projectId });
  }, []);

  const closeSheet = useCallback(() => {
    dispatch({ type: 'CLOSE_SHEET' });
  }, []);

  const setSnapPoint = useCallback((snapPoint: SheetSnapPoint) => {
    dispatch({ type: 'SET_SNAP_POINT', snapPoint });
  }, []);

  const isSheetVisible = state.appState.type !== 'default';

  const value = useMemo(
    () => ({
      appState: state.appState,
      snapPoint: state.snapPoint,
      isSheetVisible,
      openTab,
      selectProject,
      expandProject,
      enterActivity,
      exitActivity,
      closeSheet,
      setSnapPoint,
    }),
    [state, isSheetVisible, openTab, selectProject, expandProject, enterActivity, exitActivity, closeSheet, setSnapPoint]
  );

  return <MapSheetContext.Provider value={value}>{children}</MapSheetContext.Provider>;
}

export function useMapSheet() {
  const context = useContext(MapSheetContext);
  if (!context) {
    throw new Error('useMapSheet must be used within a MapSheetProvider');
  }
  return context;
}

// ============================================================================
// Snap Point Utilities
// ============================================================================

/** Convert snap point to pixel/percentage values for @gorhom/bottom-sheet */
export const SNAP_POINTS = {
  peek: 280,     // ~280px for preview card with address header and button
  half: '50%',   // 50% for project detail
  full: '90%',   // 90% for full details
} as const;

/** Get the numeric index for a snap point in the array */
export function getSnapIndex(snapPoint: SheetSnapPoint): number {
  const order: SheetSnapPoint[] = ['peek', 'half', 'full'];
  return order.indexOf(snapPoint);
}

/** Get snap points array for bottom sheet */
export function getSnapPointsArray(): (string | number)[] {
  return [SNAP_POINTS.peek, SNAP_POINTS.half, SNAP_POINTS.full];
}
