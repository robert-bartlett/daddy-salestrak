import { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// Types
// ============================================================================

export type WorkspaceRole = 'owner' | 'admin' | 'member';

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  role: WorkspaceRole;
  createdAt: Date;
};

type WorkspaceContextValue = {
  /** List of all workspaces */
  workspaces: Workspace[];
  /** Currently active workspace */
  currentWorkspace: Workspace | null;
  /** Switch to a different workspace */
  switchWorkspace: (workspaceId: string) => void;
  /** Add a new workspace */
  addWorkspace: (name: string) => void;
  /** Whether workspace data has been loaded from storage */
  isLoaded: boolean;
};

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  currentId: '@workspace/currentId',
  list: '@workspace/list',
};

// ============================================================================
// Default Workspaces
// ============================================================================

const DEFAULT_WORKSPACES: Workspace[] = [
  {
    id: 'ws-1',
    name: 'Acme Roofing Co',
    slug: 'acme-roofing',
    role: 'owner',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'ws-2',
    name: 'Summit Solar',
    slug: 'summit-solar',
    role: 'admin',
    createdAt: new Date('2024-03-20'),
  },
];

// ============================================================================
// Helpers
// ============================================================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function generateId(): string {
  return `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Serialization helpers for Date objects
function serializeWorkspaces(workspaces: Workspace[]): string {
  return JSON.stringify(
    workspaces.map((ws) => ({
      ...ws,
      createdAt: ws.createdAt.toISOString(),
    }))
  );
}

function deserializeWorkspaces(json: string): Workspace[] {
  const parsed = JSON.parse(json) as Array<Omit<Workspace, 'createdAt'> & { createdAt: string }>;
  return parsed.map((ws) => ({
    ...ws,
    createdAt: new Date(ws.createdAt),
  }));
}

// ============================================================================
// Context & Provider
// ============================================================================

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(DEFAULT_WORKSPACES);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string>(DEFAULT_WORKSPACES[0].id);
  const [isLoaded, setIsLoaded] = useState(false);

  // Derive current workspace from ID
  const currentWorkspace = useMemo(
    () => workspaces.find((ws) => ws.id === currentWorkspaceId) ?? null,
    [workspaces, currentWorkspaceId]
  );

  // Load saved data on mount
  useEffect(() => {
    (async () => {
      try {
        const [savedCurrentId, savedList] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.currentId),
          AsyncStorage.getItem(STORAGE_KEYS.list),
        ]);

        if (savedList) {
          const parsedWorkspaces = deserializeWorkspaces(savedList);
          setWorkspaces(parsedWorkspaces);

          // Use saved current ID if valid, otherwise default to first workspace
          if (savedCurrentId && parsedWorkspaces.some((ws) => ws.id === savedCurrentId)) {
            setCurrentWorkspaceId(savedCurrentId);
          } else if (parsedWorkspaces.length > 0) {
            setCurrentWorkspaceId(parsedWorkspaces[0].id);
          }
        }
      } catch (error) {
        console.warn('Failed to load workspace data:', error);
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  const switchWorkspace = useCallback((workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
    AsyncStorage.setItem(STORAGE_KEYS.currentId, workspaceId).catch(console.warn);
  }, []);

  const addWorkspace = useCallback((name: string) => {
    const newWorkspace: Workspace = {
      id: generateId(),
      name: name.trim(),
      slug: generateSlug(name),
      role: 'owner',
      createdAt: new Date(),
    };

    setWorkspaces((prev) => {
      const updated = [...prev, newWorkspace];
      AsyncStorage.setItem(STORAGE_KEYS.list, serializeWorkspaces(updated)).catch(console.warn);
      return updated;
    });

    // Switch to the new workspace
    setCurrentWorkspaceId(newWorkspace.id);
    AsyncStorage.setItem(STORAGE_KEYS.currentId, newWorkspace.id).catch(console.warn);
  }, []);

  const value = useMemo(
    () => ({
      workspaces,
      currentWorkspace,
      switchWorkspace,
      addWorkspace,
      isLoaded,
    }),
    [workspaces, currentWorkspace, switchWorkspace, addWorkspace, isLoaded]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
