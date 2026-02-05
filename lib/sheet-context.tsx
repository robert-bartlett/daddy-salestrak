import { createContext, useContext, useCallback, useRef, type ReactNode } from 'react';
import { useRouter } from 'expo-router';
import type { Project, User, Workflow, ProjectStatus, AgeUpdateReason, ActivityType } from './mock-data';

// Define locally to avoid circular imports
export type DateRange = 'today' | 'week' | 'month' | 'all';

// Map filter types
export type MapFilters = {
  workflows: string[];
  ageStatuses: ProjectStatus[];
  assignees: string[];
  owners: string[];
  showArchived: boolean;
};

// Inbox filter types
export type InboxFilters = {
  showUnreadOnly: boolean;
  selectedTypes: ActivityType[];
};

// ============================================================================
// Types for Sheet Data
// ============================================================================

type AgeUpdateData = {
  projectId: string;
  project: Project;
  onSubmit: (status: ProjectStatus, reason: AgeUpdateReason, note?: string) => void;
};

type TeamMemberData = {
  role: 'owners' | 'assignees';
  currentMembers: User[];
  projectName: string;
  onSave: (members: User[]) => void;
};

type StageSelectData = {
  workflow: Workflow;
  currentStageId: string;
  onSelectStage: (stageId: string) => void;
};

type WorkflowSelectData = {
  currentWorkflowId: string;
  currentStageId: string;
  onSelectWorkflow: (workflowId: string, stageId: string) => void;
};

type ProjectActionsData = {
  project: Project;
  onDelete?: () => void;
};

type ActivityFilterData = {
  filters: {
    types: ActivityType[];
    dateRange: DateRange;
  };
  onFiltersChange: (filters: { types: ActivityType[]; dateRange: DateRange }) => void;
};

type StatusSelectData = {
  currentStatus: ProjectStatus;
  onSelect: (status: ProjectStatus) => void;
};

type ReasonSelectData = {
  currentReason: AgeUpdateReason;
  onSelect: (reason: AgeUpdateReason) => void;
};

type MapFilterData = {
  filters: MapFilters;
  onFiltersChange: (filters: MapFilters) => void;
};

type InboxFilterData = {
  filters: InboxFilters;
  onFiltersChange: (filters: InboxFilters) => void;
};

type UserSelectData = {
  title: string;
  selected: string[];
  onSelectedChange: (selected: string[]) => void;
};

type AgeStatusSelectData = {
  selected: ProjectStatus[];
  onSelectedChange: (selected: ProjectStatus[]) => void;
};

type SavedFilterSelectData = {
  onSelect: (filters: MapFilters) => void;
};

// Generic list selection for forms
type ListSelectItem = {
  id: string;
  label: string;
  sublabel?: string;
  color?: string;
};

type ListSelectData = {
  title: string;
  items: ListSelectItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  allowMultiple?: boolean;
  selectedIds?: string[];
  onSelectMultiple?: (ids: string[]) => void;
};

// ============================================================================
// Context
// ============================================================================

type SheetContextValue = {
  // Age Update
  setAgeUpdateData: (data: AgeUpdateData) => void;
  getAgeUpdateData: () => AgeUpdateData | null;
  clearAgeUpdateData: () => void;

  // Team Member
  setTeamMemberData: (data: TeamMemberData) => void;
  getTeamMemberData: () => TeamMemberData | null;
  clearTeamMemberData: () => void;

  // Stage Select
  setStageSelectData: (data: StageSelectData) => void;
  getStageSelectData: () => StageSelectData | null;
  clearStageSelectData: () => void;

  // Workflow Select
  setWorkflowSelectData: (data: WorkflowSelectData) => void;
  getWorkflowSelectData: () => WorkflowSelectData | null;
  clearWorkflowSelectData: () => void;

  // Project Actions
  setProjectActionsData: (data: ProjectActionsData) => void;
  getProjectActionsData: () => ProjectActionsData | null;
  clearProjectActionsData: () => void;

  // Activity Filter
  setActivityFilterData: (data: ActivityFilterData) => void;
  getActivityFilterData: () => ActivityFilterData | null;
  clearActivityFilterData: () => void;

  // Status Select (nested in age update)
  setStatusSelectData: (data: StatusSelectData) => void;
  getStatusSelectData: () => StatusSelectData | null;
  clearStatusSelectData: () => void;

  // Reason Select (nested in age update)
  setReasonSelectData: (data: ReasonSelectData) => void;
  getReasonSelectData: () => ReasonSelectData | null;
  clearReasonSelectData: () => void;

  // Map Filter
  setMapFilterData: (data: MapFilterData) => void;
  getMapFilterData: () => MapFilterData | null;
  clearMapFilterData: () => void;

  // Inbox Filter
  setInboxFilterData: (data: InboxFilterData) => void;
  getInboxFilterData: () => InboxFilterData | null;
  clearInboxFilterData: () => void;

  // User Select (for map filter assignees/owners)
  setUserSelectData: (data: UserSelectData) => void;
  getUserSelectData: () => UserSelectData | null;
  clearUserSelectData: () => void;

  // Age Status Select (for map filter)
  setAgeStatusSelectData: (data: AgeStatusSelectData) => void;
  getAgeStatusSelectData: () => AgeStatusSelectData | null;
  clearAgeStatusSelectData: () => void;

  // Saved Filter Select
  setSavedFilterSelectData: (data: SavedFilterSelectData) => void;
  getSavedFilterSelectData: () => SavedFilterSelectData | null;
  clearSavedFilterSelectData: () => void;

  // List Select (generic selection sheet)
  setListSelectData: (data: ListSelectData) => void;
  getListSelectData: () => ListSelectData | null;
  clearListSelectData: () => void;

  // Navigation helpers
  openAgeUpdateSheet: (data: AgeUpdateData) => void;
  openTeamMemberSheet: (data: TeamMemberData) => void;
  openStageSelectSheet: (data: StageSelectData) => void;
  openWorkflowSelectSheet: (data: WorkflowSelectData) => void;
  openProjectActionsSheet: (data: ProjectActionsData) => void;
  openActivityFilterSheet: (data: ActivityFilterData) => void;
  openStatusSelectSheet: (data: StatusSelectData) => void;
  openReasonSelectSheet: (data: ReasonSelectData) => void;
  openMapFilterSheet: (data: MapFilterData) => void;
  openInboxFilterSheet: (data: InboxFilterData) => void;
  openUserSelectSheet: (data: UserSelectData) => void;
  openAgeStatusSelectSheet: (data: AgeStatusSelectData) => void;
  openSavedFilterSelectSheet: (data: SavedFilterSelectData) => void;
  openListSelectSheet: (data: ListSelectData) => void;
};

const SheetContext = createContext<SheetContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

export function SheetProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  // Use refs to store data so it persists across renders without causing re-renders
  const ageUpdateDataRef = useRef<AgeUpdateData | null>(null);
  const teamMemberDataRef = useRef<TeamMemberData | null>(null);
  const stageSelectDataRef = useRef<StageSelectData | null>(null);
  const workflowSelectDataRef = useRef<WorkflowSelectData | null>(null);
  const projectActionsDataRef = useRef<ProjectActionsData | null>(null);
  const activityFilterDataRef = useRef<ActivityFilterData | null>(null);
  const statusSelectDataRef = useRef<StatusSelectData | null>(null);
  const reasonSelectDataRef = useRef<ReasonSelectData | null>(null);
  const mapFilterDataRef = useRef<MapFilterData | null>(null);
  const inboxFilterDataRef = useRef<InboxFilterData | null>(null);
  const userSelectDataRef = useRef<UserSelectData | null>(null);
  const ageStatusSelectDataRef = useRef<AgeStatusSelectData | null>(null);
  const savedFilterSelectDataRef = useRef<SavedFilterSelectData | null>(null);
  const listSelectDataRef = useRef<ListSelectData | null>(null);

  // Age Update
  const setAgeUpdateData = useCallback((data: AgeUpdateData) => {
    ageUpdateDataRef.current = data;
  }, []);
  const getAgeUpdateData = useCallback(() => ageUpdateDataRef.current, []);
  const clearAgeUpdateData = useCallback(() => {
    ageUpdateDataRef.current = null;
  }, []);

  // Team Member
  const setTeamMemberData = useCallback((data: TeamMemberData) => {
    teamMemberDataRef.current = data;
  }, []);
  const getTeamMemberData = useCallback(() => teamMemberDataRef.current, []);
  const clearTeamMemberData = useCallback(() => {
    teamMemberDataRef.current = null;
  }, []);

  // Stage Select
  const setStageSelectData = useCallback((data: StageSelectData) => {
    stageSelectDataRef.current = data;
  }, []);
  const getStageSelectData = useCallback(() => stageSelectDataRef.current, []);
  const clearStageSelectData = useCallback(() => {
    stageSelectDataRef.current = null;
  }, []);

  // Workflow Select
  const setWorkflowSelectData = useCallback((data: WorkflowSelectData) => {
    workflowSelectDataRef.current = data;
  }, []);
  const getWorkflowSelectData = useCallback(() => workflowSelectDataRef.current, []);
  const clearWorkflowSelectData = useCallback(() => {
    workflowSelectDataRef.current = null;
  }, []);

  // Project Actions
  const setProjectActionsData = useCallback((data: ProjectActionsData) => {
    projectActionsDataRef.current = data;
  }, []);
  const getProjectActionsData = useCallback(() => projectActionsDataRef.current, []);
  const clearProjectActionsData = useCallback(() => {
    projectActionsDataRef.current = null;
  }, []);

  // Activity Filter
  const setActivityFilterData = useCallback((data: ActivityFilterData) => {
    activityFilterDataRef.current = data;
  }, []);
  const getActivityFilterData = useCallback(() => activityFilterDataRef.current, []);
  const clearActivityFilterData = useCallback(() => {
    activityFilterDataRef.current = null;
  }, []);

  // Status Select
  const setStatusSelectData = useCallback((data: StatusSelectData) => {
    statusSelectDataRef.current = data;
  }, []);
  const getStatusSelectData = useCallback(() => statusSelectDataRef.current, []);
  const clearStatusSelectData = useCallback(() => {
    statusSelectDataRef.current = null;
  }, []);

  // Reason Select
  const setReasonSelectData = useCallback((data: ReasonSelectData) => {
    reasonSelectDataRef.current = data;
  }, []);
  const getReasonSelectData = useCallback(() => reasonSelectDataRef.current, []);
  const clearReasonSelectData = useCallback(() => {
    reasonSelectDataRef.current = null;
  }, []);

  // Map Filter
  const setMapFilterData = useCallback((data: MapFilterData) => {
    mapFilterDataRef.current = data;
  }, []);
  const getMapFilterData = useCallback(() => mapFilterDataRef.current, []);
  const clearMapFilterData = useCallback(() => {
    mapFilterDataRef.current = null;
  }, []);

  // Inbox Filter
  const setInboxFilterData = useCallback((data: InboxFilterData) => {
    inboxFilterDataRef.current = data;
  }, []);
  const getInboxFilterData = useCallback(() => inboxFilterDataRef.current, []);
  const clearInboxFilterData = useCallback(() => {
    inboxFilterDataRef.current = null;
  }, []);

  // User Select
  const setUserSelectData = useCallback((data: UserSelectData) => {
    userSelectDataRef.current = data;
  }, []);
  const getUserSelectData = useCallback(() => userSelectDataRef.current, []);
  const clearUserSelectData = useCallback(() => {
    userSelectDataRef.current = null;
  }, []);

  // Age Status Select
  const setAgeStatusSelectData = useCallback((data: AgeStatusSelectData) => {
    ageStatusSelectDataRef.current = data;
  }, []);
  const getAgeStatusSelectData = useCallback(() => ageStatusSelectDataRef.current, []);
  const clearAgeStatusSelectData = useCallback(() => {
    ageStatusSelectDataRef.current = null;
  }, []);

  // Saved Filter Select
  const setSavedFilterSelectData = useCallback((data: SavedFilterSelectData) => {
    savedFilterSelectDataRef.current = data;
  }, []);
  const getSavedFilterSelectData = useCallback(() => savedFilterSelectDataRef.current, []);
  const clearSavedFilterSelectData = useCallback(() => {
    savedFilterSelectDataRef.current = null;
  }, []);

  // List Select
  const setListSelectData = useCallback((data: ListSelectData) => {
    listSelectDataRef.current = data;
  }, []);
  const getListSelectData = useCallback(() => listSelectDataRef.current, []);
  const clearListSelectData = useCallback(() => {
    listSelectDataRef.current = null;
  }, []);

  // Navigation helpers - set data and push route
  const openAgeUpdateSheet = useCallback((data: AgeUpdateData) => {
    setAgeUpdateData(data);
    router.push({
      pathname: '/age-update-sheet',
      params: { projectId: data.projectId },
    });
  }, [router, setAgeUpdateData]);

  const openTeamMemberSheet = useCallback((data: TeamMemberData) => {
    setTeamMemberData(data);
    router.push({
      pathname: '/team-member-sheet',
      params: { role: data.role },
    });
  }, [router, setTeamMemberData]);

  const openStageSelectSheet = useCallback((data: StageSelectData) => {
    setStageSelectData(data);
    router.push({
      pathname: '/stage-select-sheet',
      params: { workflowId: data.workflow.id, currentStageId: data.currentStageId },
    });
  }, [router, setStageSelectData]);

  const openWorkflowSelectSheet = useCallback((data: WorkflowSelectData) => {
    setWorkflowSelectData(data);
    router.push({
      pathname: '/workflow-select-sheet',
      params: { currentWorkflowId: data.currentWorkflowId },
    });
  }, [router, setWorkflowSelectData]);

  const openProjectActionsSheet = useCallback((data: ProjectActionsData) => {
    setProjectActionsData(data);
    router.push({
      pathname: '/project-actions-sheet',
      params: { projectId: data.project.id },
    });
  }, [router, setProjectActionsData]);

  const openActivityFilterSheet = useCallback((data: ActivityFilterData) => {
    setActivityFilterData(data);
    router.push('/activity-filter-sheet');
  }, [router, setActivityFilterData]);

  const openStatusSelectSheet = useCallback((data: StatusSelectData) => {
    setStatusSelectData(data);
    router.push({
      pathname: '/status-select-sheet',
      params: { currentStatus: data.currentStatus },
    });
  }, [router, setStatusSelectData]);

  const openReasonSelectSheet = useCallback((data: ReasonSelectData) => {
    setReasonSelectData(data);
    router.push({
      pathname: '/reason-select-sheet',
      params: { currentReason: data.currentReason },
    });
  }, [router, setReasonSelectData]);

  const openMapFilterSheet = useCallback((data: MapFilterData) => {
    setMapFilterData(data);
    router.push('/map-filter-sheet');
  }, [router, setMapFilterData]);

  const openInboxFilterSheet = useCallback((data: InboxFilterData) => {
    setInboxFilterData(data);
    router.push('/inbox-filter-sheet');
  }, [router, setInboxFilterData]);

  const openUserSelectSheet = useCallback((data: UserSelectData) => {
    setUserSelectData(data);
    router.push('/user-select-sheet');
  }, [router, setUserSelectData]);

  const openAgeStatusSelectSheet = useCallback((data: AgeStatusSelectData) => {
    setAgeStatusSelectData(data);
    router.push('/age-status-select-sheet');
  }, [router, setAgeStatusSelectData]);

  const openSavedFilterSelectSheet = useCallback((data: SavedFilterSelectData) => {
    setSavedFilterSelectData(data);
    router.push('/saved-filter-select-sheet');
  }, [router, setSavedFilterSelectData]);

  const openListSelectSheet = useCallback((data: ListSelectData) => {
    setListSelectData(data);
    router.push('/list-select-sheet');
  }, [router, setListSelectData]);

  const value: SheetContextValue = {
    setAgeUpdateData,
    getAgeUpdateData,
    clearAgeUpdateData,
    setTeamMemberData,
    getTeamMemberData,
    clearTeamMemberData,
    setStageSelectData,
    getStageSelectData,
    clearStageSelectData,
    setWorkflowSelectData,
    getWorkflowSelectData,
    clearWorkflowSelectData,
    setProjectActionsData,
    getProjectActionsData,
    clearProjectActionsData,
    setActivityFilterData,
    getActivityFilterData,
    clearActivityFilterData,
    setStatusSelectData,
    getStatusSelectData,
    clearStatusSelectData,
    setReasonSelectData,
    getReasonSelectData,
    clearReasonSelectData,
    openAgeUpdateSheet,
    openTeamMemberSheet,
    openStageSelectSheet,
    openWorkflowSelectSheet,
    openProjectActionsSheet,
    openActivityFilterSheet,
    openStatusSelectSheet,
    openReasonSelectSheet,
    setMapFilterData,
    getMapFilterData,
    clearMapFilterData,
    setInboxFilterData,
    getInboxFilterData,
    clearInboxFilterData,
    setUserSelectData,
    getUserSelectData,
    clearUserSelectData,
    setAgeStatusSelectData,
    getAgeStatusSelectData,
    clearAgeStatusSelectData,
    setSavedFilterSelectData,
    getSavedFilterSelectData,
    clearSavedFilterSelectData,
    openMapFilterSheet,
    openInboxFilterSheet,
    openUserSelectSheet,
    openAgeStatusSelectSheet,
    openSavedFilterSelectSheet,
    setListSelectData,
    getListSelectData,
    clearListSelectData,
    openListSelectSheet,
  };

  return (
    <SheetContext.Provider value={value}>
      {children}
    </SheetContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useSheetContext() {
  const context = useContext(SheetContext);
  if (!context) {
    throw new Error('useSheetContext must be used within a SheetProvider');
  }
  return context;
}
