import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import {
  MOCK_PROJECTS,
  MOCK_ACTIVITIES,
  CURRENT_USER,
  getStageById,
  getWorkflowById,
  type Project,
  type Activity,
  type ProjectStatus,
  type AgeUpdateReason,
  type AgeUpdate,
  type User,
} from './mock-data';
import { calculateAgeInDays, getStatusLabel, getReasonLabel } from './age-utils';

type ProjectsContextValue = {
  projects: Project[];
  activities: Activity[];
  getFavoriteProjects: () => Project[];
  getProjectById: (id: string) => Project | undefined;
  getProjectActivities: (projectId: string) => Activity[];
  addProject: (data: {
    name: string;
    address: string;
    workflowId: string;
    stageId: string;
    latitude?: number;
    longitude?: number;
  }) => Project;
  addNote: (projectId: string, note: string) => void;
  updateProjectAge: (
    projectId: string,
    status: ProjectStatus,
    reason: AgeUpdateReason,
    note?: string
  ) => void;
  updateProjectStage: (projectId: string, stageId: string) => void;
  updateProjectWorkflow: (projectId: string, workflowId: string, stageId?: string) => void;
  updateProjectOwners: (projectId: string, owners: User[]) => void;
  updateProjectAssignees: (projectId: string, assignees: User[]) => void;
  markActivityRead: (activityId: string) => void;
  markAllActivitiesRead: () => void;
};

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() =>
    MOCK_PROJECTS.map((p) => ({ ...p }))
  );
  const [activities, setActivities] = useState<Activity[]>(() =>
    MOCK_ACTIVITIES.map((a) => ({ ...a }))
  );

  const getFavoriteProjects = useCallback(() => {
    return projects.filter((p) => p.isFavorite);
  }, [projects]);

  const getProjectById = useCallback(
    (id: string) => {
      return projects.find((p) => p.id === id);
    },
    [projects]
  );

  const getProjectActivities = useCallback(
    (projectId: string) => {
      return activities
        .filter((a) => a.projectId === projectId)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    },
    [activities]
  );

  const addProject = useCallback(
    (data: { name: string; address: string; workflowId: string; stageId: string; latitude?: number; longitude?: number }): Project => {
      const now = new Date();
      // Default to Boise area if no coordinates provided
      const defaultLat = 43.6339;
      const defaultLng = -116.2942;
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        name: data.name,
        address: data.address,
        workflowId: data.workflowId,
        stageId: data.stageId,
        status: 'on_track',
        age: 0,
        owners: [CURRENT_USER],
        assignees: [CURRENT_USER],
        isFavorite: false,
        latitude: data.latitude ?? defaultLat + (Math.random() - 0.5) * 0.02,
        longitude: data.longitude ?? defaultLng + (Math.random() - 0.5) * 0.02,
        ageResetAt: now,
        ageHistory: [],
        createdAt: now,
        updatedAt: now,
      };

      setProjects((prev) => [newProject, ...prev]);

      // Create activity entry
      const activity: Activity = {
        id: `act-${Date.now()}`,
        projectId: newProject.id,
        type: 'created',
        description: 'Project created',
        timestamp: now,
        user: CURRENT_USER,
        read: false,
      };

      setActivities((prev) => [activity, ...prev]);

      return newProject;
    },
    []
  );

  const addNote = useCallback(
    (projectId: string, note: string) => {
      const now = new Date();

      const activity: Activity = {
        id: `act-${Date.now()}`,
        projectId,
        type: 'note',
        description: note,
        timestamp: now,
        user: CURRENT_USER,
        read: true, // User's own notes are already "read"
      };

      setActivities((prev) => [activity, ...prev]);

      // Update project's updatedAt
      setProjects((prevProjects) =>
        prevProjects.map((project) =>
          project.id === projectId ? { ...project, updatedAt: now } : project
        )
      );
    },
    []
  );

  const updateProjectAge = useCallback(
    (projectId: string, status: ProjectStatus, reason: AgeUpdateReason, note?: string) => {
      const now = new Date();

      setProjects((prevProjects) =>
        prevProjects.map((project) => {
          if (project.id !== projectId) return project;

          const previousAge = calculateAgeInDays(project.ageResetAt);

          const ageUpdate: AgeUpdate = {
            id: `age-${Date.now()}`,
            previousAge,
            newAge: 0,
            reason,
            status,
            note,
            updatedAt: now,
            updatedBy: CURRENT_USER,
          };

          return {
            ...project,
            ageResetAt: now,
            status,
            age: 0,
            ageHistory: [ageUpdate, ...project.ageHistory],
            updatedAt: now,
          };
        })
      );

      // Create activity entry
      const statusLabel = getStatusLabel(status);
      const reasonLabel = reason !== 'none' ? getReasonLabel(reason) : null;

      let description = `Age reset - Status: ${statusLabel}`;
      if (reasonLabel) {
        description += `, Reason: ${reasonLabel}`;
      }
      if (note) {
        description += ` - "${note}"`;
      }

      const activity: Activity = {
        id: `act-${Date.now()}`,
        projectId,
        type: 'age_update',
        description,
        timestamp: now,
        user: CURRENT_USER,
        read: false,
        metadata: { status, reason, note },
      };

      setActivities((prev) => [activity, ...prev]);
    },
    []
  );

  const updateProjectStage = useCallback(
    (projectId: string, stageId: string) => {
      const now = new Date();

      setProjects((prevProjects) =>
        prevProjects.map((project) => {
          if (project.id !== projectId) return project;

          const oldStage = getStageById(project.workflowId, project.stageId);
          const newStage = getStageById(project.workflowId, stageId);

          return {
            ...project,
            stageId,
            updatedAt: now,
          };
        })
      );

      // Get stage names for activity
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        const oldStage = getStageById(project.workflowId, project.stageId);
        const newStage = getStageById(project.workflowId, stageId);

        const activity: Activity = {
          id: `act-${Date.now()}`,
          projectId,
          type: 'stage_change',
          description: `Moved to "${newStage?.name ?? stageId}" stage`,
          timestamp: now,
          user: CURRENT_USER,
          read: false,
          metadata: { fromStage: project.stageId, toStage: stageId },
        };

        setActivities((prev) => [activity, ...prev]);
      }
    },
    [projects]
  );

  const updateProjectWorkflow = useCallback(
    (projectId: string, workflowId: string, stageId?: string) => {
      const now = new Date();
      const newWorkflow = getWorkflowById(workflowId);
      const targetStageId = stageId ?? newWorkflow?.stages[0]?.id;

      setProjects((prevProjects) =>
        prevProjects.map((project) => {
          if (project.id !== projectId) return project;

          return {
            ...project,
            workflowId,
            stageId: targetStageId ?? project.stageId,
            updatedAt: now,
          };
        })
      );

      const project = projects.find((p) => p.id === projectId);
      if (project && newWorkflow) {
        const oldWorkflow = getWorkflowById(project.workflowId);

        const activity: Activity = {
          id: `act-${Date.now()}`,
          projectId,
          type: 'stage_change',
          description: `Changed workflow from "${oldWorkflow?.name}" to "${newWorkflow.name}"`,
          timestamp: now,
          user: CURRENT_USER,
          read: false,
          metadata: { fromWorkflow: project.workflowId, toWorkflow: workflowId },
        };

        setActivities((prev) => [activity, ...prev]);
      }
    },
    [projects]
  );

  const updateProjectOwners = useCallback(
    (projectId: string, owners: User[]) => {
      const now = new Date();

      setProjects((prevProjects) =>
        prevProjects.map((project) => {
          if (project.id !== projectId) return project;
          return {
            ...project,
            owners,
            updatedAt: now,
          };
        })
      );

      const activity: Activity = {
        id: `act-${Date.now()}`,
        projectId,
        type: 'assignment',
        description: `Updated owners to: ${owners.map((o) => o.name).join(', ') || 'None'}`,
        timestamp: now,
        user: CURRENT_USER,
        read: false,
        metadata: { owners: owners.map((o) => o.id) },
      };

      setActivities((prev) => [activity, ...prev]);
    },
    []
  );

  const updateProjectAssignees = useCallback(
    (projectId: string, assignees: User[]) => {
      const now = new Date();

      setProjects((prevProjects) =>
        prevProjects.map((project) => {
          if (project.id !== projectId) return project;
          return {
            ...project,
            assignees,
            updatedAt: now,
          };
        })
      );

      const activity: Activity = {
        id: `act-${Date.now()}`,
        projectId,
        type: 'assignment',
        description: `Updated assignees to: ${assignees.map((a) => a.name).join(', ') || 'None'}`,
        timestamp: now,
        user: CURRENT_USER,
        read: false,
        metadata: { assignees: assignees.map((a) => a.id) },
      };

      setActivities((prev) => [activity, ...prev]);
    },
    []
  );

  const markActivityRead = useCallback((activityId: string) => {
    setActivities((prev) =>
      prev.map((activity) =>
        activity.id === activityId ? { ...activity, read: true } : activity
      )
    );
  }, []);

  const markAllActivitiesRead = useCallback(() => {
    setActivities((prev) =>
      prev.map((activity) => ({ ...activity, read: true }))
    );
  }, []);

  const value = useMemo(
    () => ({
      projects,
      activities,
      getFavoriteProjects,
      getProjectById,
      getProjectActivities,
      addProject,
      addNote,
      updateProjectAge,
      updateProjectStage,
      updateProjectWorkflow,
      updateProjectOwners,
      updateProjectAssignees,
      markActivityRead,
      markAllActivitiesRead,
    }),
    [projects, activities, getFavoriteProjects, getProjectById, getProjectActivities, addProject, addNote, updateProjectAge, updateProjectStage, updateProjectWorkflow, updateProjectOwners, updateProjectAssignees, markActivityRead, markAllActivitiesRead]
  );

  return <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>;
}

export function useProjects() {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
}
