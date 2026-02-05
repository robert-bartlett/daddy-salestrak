/**
 * Search Service - Pure search functions for all entity types
 *
 * Provides unified search across projects, contacts, accounts, workflows, and activities.
 * Used by the universal search / command palette.
 */

import type {
  Project,
  Contact,
  Account,
  Workflow,
  WorkflowStage,
  Activity,
  BadgeColor,
} from './mock-data';
import { getWorkflowById, getStageById, MOCK_WORKFLOWS } from './mock-data';

// ============================================================================
// Types
// ============================================================================

export type SearchableEntity = 'project' | 'contact' | 'account' | 'workflow' | 'stage' | 'activity';

export type SearchResult = {
  id: string;
  type: SearchableEntity;
  title: string;
  subtitle?: string;
  icon?: string;
  color?: BadgeColor;
  drillable?: boolean; // Can drill down (workflows, stages)
  metadata?: Record<string, unknown>;
};

export type GroupedResults = {
  projects: SearchResult[];
  contacts: SearchResult[];
  accounts: SearchResult[];
  workflows: SearchResult[];
  activities: SearchResult[];
};

// ============================================================================
// Search Utilities
// ============================================================================

/**
 * Normalize a string for search comparison
 */
function normalizeForSearch(str: string): string {
  return str.toLowerCase().trim();
}

/**
 * Check if a string matches a search query
 */
function matchesQuery(text: string | undefined | null, query: string): boolean {
  if (!text) return false;
  return normalizeForSearch(text).includes(normalizeForSearch(query));
}

/**
 * Score a match based on how early the match appears and how close it is to the full string
 */
function scoreMatch(text: string, query: string): number {
  const normalizedText = normalizeForSearch(text);
  const normalizedQuery = normalizeForSearch(query);

  if (!normalizedText.includes(normalizedQuery)) return 0;

  const index = normalizedText.indexOf(normalizedQuery);
  const lengthRatio = normalizedQuery.length / normalizedText.length;

  // Higher score for matches at the beginning and for closer length matches
  return (1 - index / normalizedText.length) + lengthRatio;
}

// ============================================================================
// Entity Search Functions
// ============================================================================

/**
 * Search projects by name, address, workflow, stage, and owner names
 */
export function searchProjects(projects: Project[], query: string): SearchResult[] {
  if (!query.trim()) return [];

  const results: (SearchResult & { score: number })[] = [];

  for (const project of projects) {
    // Skip archived projects from search results
    if (project.isArchived) continue;

    const workflow = getWorkflowById(project.workflowId);
    const stage = getStageById(project.workflowId, project.stageId);
    const ownerNames = project.owners.map((o) => o.name).join(' ');

    // Check all searchable fields
    const nameScore = scoreMatch(project.name, query);
    const addressScore = scoreMatch(project.address, query) * 0.8;
    const workflowScore = workflow ? scoreMatch(workflow.name, query) * 0.6 : 0;
    const stageScore = stage ? scoreMatch(stage.name, query) * 0.6 : 0;
    const ownerScore = scoreMatch(ownerNames, query) * 0.5;

    const maxScore = Math.max(nameScore, addressScore, workflowScore, stageScore, ownerScore);

    if (maxScore > 0) {
      results.push({
        id: project.id,
        type: 'project',
        title: project.name,
        subtitle: project.address,
        color: stage?.color,
        metadata: {
          workflowId: project.workflowId,
          workflowName: workflow?.name,
          stageId: project.stageId,
          stageName: stage?.name,
          ageResetAt: project.ageResetAt,
        },
        score: maxScore,
      });
    }
  }

  // Sort by score descending
  return results.sort((a, b) => b.score - a.score).map(({ score, ...result }) => result);
}

/**
 * Search contacts by name, email, phone, and company name
 */
export function searchContacts(contacts: Contact[], query: string): SearchResult[] {
  if (!query.trim()) return [];

  const results: (SearchResult & { score: number })[] = [];

  for (const contact of contacts) {
    const nameScore = scoreMatch(contact.name, query);
    const emailScore = contact.email ? scoreMatch(contact.email, query) * 0.8 : 0;
    const phoneScore = contact.phone ? scoreMatch(contact.phone, query) * 0.7 : 0;
    const companyScore = contact.companyName ? scoreMatch(contact.companyName, query) * 0.6 : 0;

    const maxScore = Math.max(nameScore, emailScore, phoneScore, companyScore);

    if (maxScore > 0) {
      results.push({
        id: contact.id,
        type: 'contact',
        title: contact.name,
        subtitle: contact.email ?? contact.phone ?? contact.companyName,
        metadata: {
          type: contact.type,
          email: contact.email,
          phone: contact.phone,
          companyName: contact.companyName,
        },
        score: maxScore,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).map(({ score, ...result }) => result);
}

/**
 * Search accounts by name, type, and address
 */
export function searchAccounts(accounts: Account[], query: string): SearchResult[] {
  if (!query.trim()) return [];

  const results: (SearchResult & { score: number })[] = [];

  for (const account of accounts) {
    const nameScore = scoreMatch(account.name, query);
    const typeScore = scoreMatch(account.type, query) * 0.6;
    const addressScore = account.address ? scoreMatch(account.address, query) * 0.7 : 0;

    const maxScore = Math.max(nameScore, typeScore, addressScore);

    if (maxScore > 0) {
      results.push({
        id: account.id,
        type: 'account',
        title: account.name,
        subtitle: account.address ?? account.type,
        metadata: {
          type: account.type,
          address: account.address,
        },
        score: maxScore,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).map(({ score, ...result }) => result);
}

/**
 * Search workflows by name and stage names
 */
export function searchWorkflows(
  workflows: Workflow[],
  query: string,
  projectCounts?: Record<string, number>
): SearchResult[] {
  if (!query.trim()) return [];

  const results: (SearchResult & { score: number })[] = [];

  for (const workflow of workflows) {
    const nameScore = scoreMatch(workflow.name, query);
    const stageNamesScore = Math.max(
      ...workflow.stages.map((s) => scoreMatch(s.name, query) * 0.7)
    );

    const maxScore = Math.max(nameScore, stageNamesScore);

    if (maxScore > 0) {
      results.push({
        id: workflow.id,
        type: 'workflow',
        title: workflow.name,
        subtitle: projectCounts
          ? `${projectCounts[workflow.id] ?? 0} projects`
          : `${workflow.stages.length} stages`,
        drillable: true,
        metadata: {
          stageCount: workflow.stages.length,
          projectCount: projectCounts?.[workflow.id] ?? 0,
        },
        score: maxScore,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).map(({ score, ...result }) => result);
}

/**
 * Search stages within a workflow
 */
export function searchStages(
  stages: WorkflowStage[],
  workflowId: string,
  query: string,
  projectCounts?: Record<string, number>
): SearchResult[] {
  if (!query.trim()) {
    // Return all stages if no query (for drill-down browsing)
    return stages.map((stage) => ({
      id: stage.id,
      type: 'stage' as const,
      title: stage.name,
      subtitle: projectCounts
        ? `${projectCounts[stage.id] ?? 0} projects`
        : undefined,
      color: stage.color,
      drillable: true,
      metadata: {
        workflowId,
        order: stage.order,
        projectCount: projectCounts?.[stage.id] ?? 0,
      },
    }));
  }

  const results: (SearchResult & { score: number })[] = [];

  for (const stage of stages) {
    const nameScore = scoreMatch(stage.name, query);

    if (nameScore > 0) {
      results.push({
        id: stage.id,
        type: 'stage',
        title: stage.name,
        subtitle: projectCounts
          ? `${projectCounts[stage.id] ?? 0} projects`
          : undefined,
        color: stage.color,
        drillable: true,
        metadata: {
          workflowId,
          order: stage.order,
          projectCount: projectCounts?.[stage.id] ?? 0,
        },
        score: nameScore,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).map(({ score, ...result }) => result);
}

/**
 * Search activities by description, user name, and project name
 */
export function searchActivities(
  activities: Activity[],
  query: string,
  projectNameMap?: Record<string, string>
): SearchResult[] {
  if (!query.trim()) return [];

  const results: (SearchResult & { score: number })[] = [];

  for (const activity of activities) {
    const descriptionScore = scoreMatch(activity.description, query);
    const userScore = scoreMatch(activity.user.name, query) * 0.7;
    const projectName = projectNameMap?.[activity.projectId] ?? '';
    const projectScore = scoreMatch(projectName, query) * 0.6;

    const maxScore = Math.max(descriptionScore, userScore, projectScore);

    if (maxScore > 0) {
      results.push({
        id: activity.id,
        type: 'activity',
        title: activity.description,
        subtitle: projectName ? `${activity.user.name} • ${projectName}` : activity.user.name,
        metadata: {
          activityType: activity.type,
          projectId: activity.projectId,
          projectName,
          userId: activity.user.id,
          userName: activity.user.name,
          timestamp: activity.timestamp,
          read: activity.read,
        },
        score: maxScore,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score).map(({ score, ...result }) => result);
}

// ============================================================================
// Universal Search
// ============================================================================

type UniversalSearchData = {
  projects: Project[];
  contacts: Contact[];
  accounts: Account[];
  activities: Activity[];
  workflows?: Workflow[];
};

/**
 * Search across all entity types and return grouped results
 */
export function universalSearch(data: UniversalSearchData, query: string): GroupedResults {
  const workflows = data.workflows ?? MOCK_WORKFLOWS;

  // Calculate project counts per workflow for display
  const workflowProjectCounts: Record<string, number> = {};
  for (const project of data.projects) {
    workflowProjectCounts[project.workflowId] = (workflowProjectCounts[project.workflowId] ?? 0) + 1;
  }

  // Build project name map for activity search
  const projectNameMap: Record<string, string> = {};
  for (const project of data.projects) {
    projectNameMap[project.id] = project.name;
  }

  return {
    projects: searchProjects(data.projects, query),
    contacts: searchContacts(data.contacts, query),
    accounts: searchAccounts(data.accounts, query),
    workflows: searchWorkflows(workflows, query, workflowProjectCounts),
    activities: searchActivities(data.activities, query, projectNameMap),
  };
}

/**
 * Get all workflows with project counts (for browsing, not searching)
 */
export function getAllWorkflowsAsResults(
  projects: Project[],
  workflows?: Workflow[]
): SearchResult[] {
  const workflowList = workflows ?? MOCK_WORKFLOWS;

  // Calculate project counts per workflow
  const workflowProjectCounts: Record<string, number> = {};
  for (const project of projects) {
    if (!project.isArchived) {
      workflowProjectCounts[project.workflowId] = (workflowProjectCounts[project.workflowId] ?? 0) + 1;
    }
  }

  return workflowList.map((workflow) => ({
    id: workflow.id,
    type: 'workflow' as const,
    title: workflow.name,
    subtitle: `${workflowProjectCounts[workflow.id] ?? 0} projects`,
    drillable: true,
    metadata: {
      stageCount: workflow.stages.length,
      projectCount: workflowProjectCounts[workflow.id] ?? 0,
    },
  }));
}

/**
 * Get projects in a specific stage
 */
export function getProjectsInStageAsResults(
  projects: Project[],
  workflowId: string,
  stageId: string
): SearchResult[] {
  const workflow = getWorkflowById(workflowId);
  const stage = getStageById(workflowId, stageId);

  return projects
    .filter((p) => p.workflowId === workflowId && p.stageId === stageId && !p.isArchived)
    .map((project) => ({
      id: project.id,
      type: 'project' as const,
      title: project.name,
      subtitle: project.address,
      color: stage?.color,
      metadata: {
        workflowId,
        workflowName: workflow?.name,
        stageId,
        stageName: stage?.name,
        ageResetAt: project.ageResetAt,
      },
    }));
}
