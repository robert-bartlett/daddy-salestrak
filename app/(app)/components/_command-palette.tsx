/**
 * Command Palette - Universal search with drill-down navigation
 *
 * Spotlight-style search that searches across all entities and supports
 * drill-down into workflows → stages → projects.
 *
 * Top-level menu shows:
 * - Create new project/contact/account (actions)
 * - Recent activity (drill-down)
 * - Workflows (drill-down)
 *
 * Uses native Modal sheet on iOS/Android.
 */

import { useMemo, useCallback, useEffect, useRef } from 'react';
import { View, Pressable, TextInput, Keyboard, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { GlassView } from 'expo-glass-effect';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  User,
  Building2,
  GitBranch,
  Clock,
  X,
  Plus,
  Search,
  FolderKanban,
  Activity,
} from 'lucide-react-native';

import { Box, HStack, VStack } from '@/components/ui/layout';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUniversalSearch } from '@/lib/universal-search-context';
import { useProjects } from '@/lib/projects-context';
import { useContacts } from '@/lib/contacts-context';
import { useAccounts } from '@/lib/accounts-context';
import { useMapSheet } from '@/lib/map-sheet-context';
import {
  universalSearch,
  getAllWorkflowsAsResults,
  searchStages,
  getProjectsInStageAsResults,
  type SearchResult,
} from '@/lib/search-service';
import { getWorkflowById } from '@/lib/mock-data';
import { formatAge, getStatusFromAge, getStatusHexColor } from '@/lib/age-utils';
import { getPinColor } from '@/lib/map-colors';

// Maximum results to show per category
const MAX_RESULTS_PER_CATEGORY = 5;
const MAX_RECENT_ACTIVITIES = 10;

// ============================================================================
// Result Item Components
// ============================================================================

type ResultItemProps = {
  onPress: () => void;
  children: React.ReactNode;
};

function ResultItem({ onPress, children }: ResultItemProps) {
  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <View
          className="rounded-lg px-3 py-2.5"
          style={{ opacity: pressed ? 0.7 : 1, backgroundColor: pressed ? 'rgba(255,255,255,0.05)' : 'transparent' }}
        >
          {children}
        </View>
      )}
    </Pressable>
  );
}

// Action item with icon (for create actions)
type ActionItemProps = {
  icon: typeof Plus;
  title: string;
  subtitle?: string;
  onPress: () => void;
};

function ActionItem({ icon: IconComponent, title, subtitle, onPress }: ActionItemProps) {
  return (
    <ResultItem onPress={onPress}>
      <HStack gap="sm" align="center">
        <View className="h-9 w-9 items-center justify-center rounded-lg bg-muted">
          <Icon as={IconComponent} size={20} />
        </View>
        <View className="flex-1">
          <Text weight="medium">{title}</Text>
          {subtitle ? (
            <Text size="sm" tone="muted">{subtitle}</Text>
          ) : null}
        </View>
      </HStack>
    </ResultItem>
  );
}

// Drillable item with chevron (for navigation)
type DrillItemProps = {
  icon: typeof GitBranch;
  title: string;
  badge?: number | string;
  onPress: () => void;
};

function DrillItem({ icon: IconComponent, title, badge, onPress }: DrillItemProps) {
  return (
    <ResultItem onPress={onPress}>
      <HStack gap="sm" align="center">
        <Icon as={IconComponent} size={18} className="text-muted-foreground" />
        <Text weight="medium" numberOfLines={1} style={{ flex: 1 }}>
          {title}
        </Text>
        {badge !== undefined ? (
          <Badge variant="secondary" size="sm">
            <Text size="xs">{badge}</Text>
          </Badge>
        ) : null}
        <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
      </HStack>
    </ResultItem>
  );
}

type ProjectResultProps = {
  result: SearchResult;
  onSelect: () => void;
};

function ProjectResult({ result, onSelect }: ProjectResultProps) {
  const stageColor = result.color ? getPinColor(result.color) : '#6B7280';
  const ageResetAt = result.metadata?.ageResetAt as Date | undefined;
  const ageText = ageResetAt ? formatAge(ageResetAt) : null;
  const ageColor = ageResetAt ? getStatusHexColor(getStatusFromAge(ageResetAt)) : undefined;

  return (
    <ResultItem onPress={onSelect}>
      <HStack gap="sm" align="center">
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: stageColor,
          }}
        />
        <View className="flex-1">
          <Text weight="medium" numberOfLines={1}>
            {result.title}
          </Text>
          {result.subtitle ? (
            <HStack gap="xs" align="center">
              <Icon as={MapPin} size={12} className="text-muted-foreground" />
              <Text size="sm" tone="muted" numberOfLines={1}>
                {result.subtitle}
              </Text>
            </HStack>
          ) : null}
        </View>
        {ageText ? (
          <Text size="sm" weight="semibold" style={{ color: ageColor }}>
            {ageText}
          </Text>
        ) : null}
      </HStack>
    </ResultItem>
  );
}

type ContactResultProps = {
  result: SearchResult;
  onSelect: () => void;
};

function ContactResult({ result, onSelect }: ContactResultProps) {
  const contactType = result.metadata?.type as string | undefined;

  return (
    <ResultItem onPress={onSelect}>
      <HStack gap="sm" align="center">
        <Icon as={User} size={18} className="text-muted-foreground" />
        <View className="flex-1">
          <Text weight="medium" numberOfLines={1}>
            {result.title}
          </Text>
          {result.subtitle ? (
            <Text size="sm" tone="muted" numberOfLines={1}>
              {result.subtitle}
            </Text>
          ) : null}
        </View>
        {contactType ? (
          <Badge variant="secondary" size="sm">
            <Text size="xs">{contactType}</Text>
          </Badge>
        ) : null}
      </HStack>
    </ResultItem>
  );
}

type AccountResultProps = {
  result: SearchResult;
  onSelect: () => void;
};

function AccountResult({ result, onSelect }: AccountResultProps) {
  const accountType = result.metadata?.type as string | undefined;

  return (
    <ResultItem onPress={onSelect}>
      <HStack gap="sm" align="center">
        <Icon as={Building2} size={18} className="text-muted-foreground" />
        <View className="flex-1">
          <Text weight="medium" numberOfLines={1}>
            {result.title}
          </Text>
          {result.subtitle ? (
            <Text size="sm" tone="muted" numberOfLines={1}>
              {result.subtitle}
            </Text>
          ) : null}
        </View>
        {accountType ? (
          <Badge variant="secondary" size="sm">
            <Text size="xs">{accountType}</Text>
          </Badge>
        ) : null}
      </HStack>
    </ResultItem>
  );
}

type WorkflowResultProps = {
  result: SearchResult;
  onDrill: () => void;
};

function WorkflowResult({ result, onDrill }: WorkflowResultProps) {
  const projectCount = result.metadata?.projectCount as number | undefined;

  return (
    <ResultItem onPress={onDrill}>
      <HStack gap="sm" align="center">
        <Icon as={GitBranch} size={18} className="text-muted-foreground" />
        <Text weight="medium" numberOfLines={1} style={{ flex: 1 }}>
          {result.title}
        </Text>
        {typeof projectCount === 'number' ? (
          <Badge variant="secondary" size="sm">
            <Text size="xs">{projectCount}</Text>
          </Badge>
        ) : null}
        <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
      </HStack>
    </ResultItem>
  );
}

type StageResultProps = {
  result: SearchResult;
  onDrill: () => void;
};

function StageResult({ result, onDrill }: StageResultProps) {
  const stageColor = result.color ? getPinColor(result.color) : '#6B7280';
  const projectCount = result.metadata?.projectCount as number | undefined;

  return (
    <ResultItem onPress={onDrill}>
      <HStack gap="sm" align="center">
        <View
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: stageColor,
          }}
        />
        <Text weight="medium" numberOfLines={1} style={{ flex: 1 }}>
          {result.title}
        </Text>
        {typeof projectCount === 'number' ? (
          <Badge variant="secondary" size="sm">
            <Text size="xs">{projectCount}</Text>
          </Badge>
        ) : null}
        <Icon as={ChevronRight} size={18} className="text-muted-foreground" />
      </HStack>
    </ResultItem>
  );
}

type ActivityResultProps = {
  result: SearchResult;
  onSelect: () => void;
};

function ActivityResult({ result, onSelect }: ActivityResultProps) {
  const timestamp = result.metadata?.timestamp as Date | undefined;

  return (
    <ResultItem onPress={onSelect}>
      <HStack gap="sm" align="center">
        <Icon as={Clock} size={18} className="text-muted-foreground" />
        <View className="flex-1">
          <Text size="sm" numberOfLines={1}>
            {result.title}
          </Text>
          {result.subtitle ? (
            <Text size="xs" tone="muted" numberOfLines={1}>
              {result.subtitle}
            </Text>
          ) : null}
        </View>
        {timestamp ? (
          <Text size="xs" tone="muted">
            {formatRelativeTime(timestamp)}
          </Text>
        ) : null}
      </HStack>
    </ResultItem>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ============================================================================
// Section Header
// ============================================================================

function SectionHeader({ title }: { title: string }) {
  return (
    <Box paddingX="md" paddingY="xs">
      <Text size="xs" weight="semibold" tone="muted" style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {title}
      </Text>
    </Box>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function CommandPalette() {
  const router = useRouter();
  const {
    query,
    setQuery,
    drillStack,
    drillInto,
    drillBack,
    clearDrill,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  } = useUniversalSearch();

  const { projects, activities, getProjectById } = useProjects();
  const { contacts } = useContacts();
  const { accounts } = useAccounts();
  const { expandProject, openTab } = useMapSheet();

  const inputRef = useRef<TextInput>(null);

  // Focus input on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  // Calculate project counts for stages
  const stageProjectCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const project of projects) {
      if (!project.isArchived) {
        counts[project.stageId] = (counts[project.stageId] ?? 0) + 1;
      }
    }
    return counts;
  }, [projects]);

  // Current drill-down level
  const currentLevel = drillStack.length > 0 ? drillStack[drillStack.length - 1] : null;

  // Recent activities (limited)
  const recentActivities = useMemo(() => {
    return [...activities]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, MAX_RECENT_ACTIVITIES);
  }, [activities]);

  // Build project name map for activity display
  const projectNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const project of projects) {
      map[project.id] = project.name;
    }
    return map;
  }, [projects]);

  // Get search results based on current drill-down level
  const results = useMemo(() => {
    // Drilling into workflows list
    if (currentLevel?.type === 'workflows') {
      const workflowResults = getAllWorkflowsAsResults(projects);
      if (query.trim()) {
        const lowerQuery = query.toLowerCase();
        return {
          workflows: workflowResults.filter((w) =>
            w.title.toLowerCase().includes(lowerQuery)
          ),
        };
      }
      return { workflows: workflowResults };
    }

    // Drilling into a specific workflow - show stages
    if (currentLevel?.type === 'workflow') {
      const workflow = getWorkflowById(currentLevel.id);
      if (workflow) {
        return {
          stages: searchStages(workflow.stages, currentLevel.id, query, stageProjectCounts),
        };
      }
    }

    // Drilling into a stage - show projects
    if (currentLevel?.type === 'stage') {
      const projectResults = getProjectsInStageAsResults(
        projects,
        currentLevel.workflowId,
        currentLevel.id
      );
      if (query.trim()) {
        const lowerQuery = query.toLowerCase();
        return {
          projects: projectResults.filter(
            (p) =>
              p.title.toLowerCase().includes(lowerQuery) ||
              p.subtitle?.toLowerCase().includes(lowerQuery)
          ),
        };
      }
      return { projects: projectResults };
    }

    // Drilling into activity - show recent activities
    if (currentLevel?.type === 'activity') {
      const activityResults: SearchResult[] = recentActivities.map((activity) => ({
        id: activity.id,
        type: 'activity' as const,
        title: activity.description,
        subtitle: `${activity.user.name} • ${projectNameMap[activity.projectId] ?? 'Unknown'}`,
        metadata: {
          activityType: activity.type,
          projectId: activity.projectId,
          projectName: projectNameMap[activity.projectId],
          userId: activity.user.id,
          userName: activity.user.name,
          timestamp: activity.timestamp,
          read: activity.read,
        },
      }));

      if (query.trim()) {
        const lowerQuery = query.toLowerCase();
        return {
          activities: activityResults.filter(
            (a) =>
              a.title.toLowerCase().includes(lowerQuery) ||
              a.subtitle?.toLowerCase().includes(lowerQuery)
          ),
        };
      }
      return { activities: activityResults };
    }

    // Top level with search query - universal search
    if (query.trim()) {
      const searchResults = universalSearch(
        { projects, contacts, accounts, activities },
        query
      );
      return searchResults;
    }

    // Top level without query - show menu
    return { topLevelMenu: true, recentSearches };
  }, [
    query,
    projects,
    contacts,
    accounts,
    activities,
    currentLevel,
    stageProjectCounts,
    recentSearches,
    recentActivities,
    projectNameMap,
  ]);

  // Handlers
  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    setQuery('');
    clearDrill();
    router.back();
  }, [setQuery, clearDrill, router]);

  const handleCreateProject = useCallback(() => {
    Keyboard.dismiss();
    setQuery('');
    clearDrill();
    router.back();
    setTimeout(() => {
      openTab('add');
    }, 100);
  }, [setQuery, clearDrill, router, openTab]);

  const handleCreateContact = useCallback(() => {
    Keyboard.dismiss();
    setQuery('');
    clearDrill();
    router.back();
    setTimeout(() => {
      openTab('add');
    }, 100);
  }, [setQuery, clearDrill, router, openTab]);

  const handleCreateAccount = useCallback(() => {
    Keyboard.dismiss();
    setQuery('');
    clearDrill();
    router.back();
    setTimeout(() => {
      openTab('add');
    }, 100);
  }, [setQuery, clearDrill, router, openTab]);

  const handleDrillActivity = useCallback(() => {
    drillInto({ type: 'activity', title: 'Recent Activity' });
  }, [drillInto]);

  const handleDrillWorkflows = useCallback(() => {
    drillInto({ type: 'workflows', title: 'Workflows' });
  }, [drillInto]);

  const handleProjectSelect = useCallback(
    (projectId: string) => {
      if (query.trim()) {
        addRecentSearch(query);
      }
      Keyboard.dismiss();
      setQuery('');
      clearDrill();
      router.back();
      setTimeout(() => {
        expandProject(projectId);
      }, 100);
    },
    [query, addRecentSearch, setQuery, clearDrill, router, expandProject]
  );

  const handleContactSelect = useCallback(
    (contactId: string) => {
      if (query.trim()) {
        addRecentSearch(query);
      }
      Keyboard.dismiss();
      setQuery('');
      clearDrill();
      router.back();
      console.log('Selected contact:', contactId);
    },
    [query, addRecentSearch, setQuery, clearDrill, router]
  );

  const handleAccountSelect = useCallback(
    (accountId: string) => {
      if (query.trim()) {
        addRecentSearch(query);
      }
      Keyboard.dismiss();
      setQuery('');
      clearDrill();
      router.back();
      console.log('Selected account:', accountId);
    },
    [query, addRecentSearch, setQuery, clearDrill, router]
  );

  const handleWorkflowDrill = useCallback(
    (workflowId: string, workflowName: string) => {
      drillInto({ type: 'workflow', id: workflowId, title: workflowName });
    },
    [drillInto]
  );

  const handleStageDrill = useCallback(
    (stageId: string, stageName: string, workflowId: string) => {
      drillInto({ type: 'stage', id: stageId, workflowId, title: stageName });
    },
    [drillInto]
  );

  const handleActivitySelect = useCallback(
    (activityId: string, projectId: string) => {
      if (query.trim()) {
        addRecentSearch(query);
      }
      Keyboard.dismiss();
      setQuery('');
      clearDrill();
      router.back();
      setTimeout(() => {
        expandProject(projectId, true);
      }, 100);
    },
    [query, addRecentSearch, setQuery, clearDrill, router, expandProject]
  );

  const handleRecentSearchSelect = useCallback(
    (search: string) => {
      setQuery(search);
    },
    [setQuery]
  );

  // Check for empty results
  const hasResults =
    ('topLevelMenu' in results && results.topLevelMenu) ||
    ('projects' in results && results.projects && results.projects.length > 0) ||
    ('contacts' in results && results.contacts && results.contacts.length > 0) ||
    ('accounts' in results && results.accounts && results.accounts.length > 0) ||
    ('workflows' in results && results.workflows && results.workflows.length > 0) ||
    ('activities' in results && results.activities && results.activities.length > 0) ||
    ('stages' in results && results.stages && results.stages.length > 0);

  // Count unread activities
  const unreadCount = useMemo(() => {
    return activities.filter((a) => !a.read).length;
  }, [activities]);

  return (
    <BlurView
      intensity={100}
      tint="dark"
      style={{ flex: 1, backgroundColor: 'rgba(30, 30, 30, 0.25)' }}
    >
      {/* Search row - floating on top, Apple Maps style */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {drillStack.length > 0 ? (
            <Pressable onPress={drillBack}>
              {({ pressed }) => (
                <GlassView
                  glassEffectStyle="regular"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: pressed ? 0.7 : 1,
                  }}
                >
                  <Icon as={ChevronLeft} size={20} color="#FFFFFF" />
                </GlassView>
              )}
            </Pressable>
          ) : null}
          {/* Search pill */}
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              height: 48,
              borderRadius: 24,
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderWidth: 0.5,
              borderColor: 'rgba(255, 255, 255, 0.12)',
              borderCurve: 'continuous',
              paddingHorizontal: 14,
              gap: 10,
            }}
          >
            <Icon as={Search} size={18} color="rgba(255, 255, 255, 0.4)" />
            <TextInput
              ref={inputRef}
              placeholder={
                currentLevel?.type === 'workflow'
                  ? `Search stages...`
                  : currentLevel?.type === 'stage'
                  ? `Search projects...`
                  : currentLevel?.type === 'activity'
                  ? `Search activity...`
                  : currentLevel?.type === 'workflows'
                  ? `Search workflows...`
                  : 'Search...'
              }
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              style={{
                flex: 1,
                fontSize: 17,
                color: '#FFFFFF',
                minWidth: 0,
              }}
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon as={X} size={12} color="rgba(255, 255, 255, 0.8)" />
                </View>
              </Pressable>
            ) : null}
          </View>
          {/* Close button - same height as pill */}
          <Pressable onPress={handleClose}>
            {({ pressed }) => (
              <GlassView
                glassEffectStyle="regular"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.7 : 1,
                }}
              >
                <Icon as={X} size={20} color="#FFFFFF" />
              </GlassView>
            )}
          </Pressable>
        </View>
      </View>

      {/* Results - scrolls behind the search row */}
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingTop: 68, paddingBottom: 40 }}
      >
        {/* Empty state for search */}
        {query.trim() && !hasResults ? (
          <Box padding="xl">
            <VStack gap="sm" align="center">
              <Text tone="muted">No results found for "{query}"</Text>
            </VStack>
          </Box>
        ) : null}

        {/* Top Level Menu (when no query and at root) */}
        {'topLevelMenu' in results && results.topLevelMenu ? (
          <>
            {/* Create actions */}
            <VStack gap="none">
              <SectionHeader title="Create" />
              <ActionItem
                icon={FolderKanban}
                title="New Project"
                subtitle="Track a job, lead, or property"
                onPress={handleCreateProject}
              />
              <ActionItem
                icon={User}
                title="New Contact"
                subtitle="Add a person to your network"
                onPress={handleCreateContact}
              />
              <ActionItem
                icon={Building2}
                title="New Account"
                subtitle="Create a company or organization"
                onPress={handleCreateAccount}
              />
            </VStack>

            {/* Navigation */}
            <VStack gap="none">
              <SectionHeader title="Browse" />
              <DrillItem
                icon={Activity}
                title="Recent Activity"
                badge={unreadCount > 0 ? unreadCount : undefined}
                onPress={handleDrillActivity}
              />
              <DrillItem
                icon={GitBranch}
                title="Workflows"
                badge={projects.filter((p) => !p.isArchived).length}
                onPress={handleDrillWorkflows}
              />
            </VStack>

            {/* Recent searches */}
            {'recentSearches' in results &&
            results.recentSearches &&
            results.recentSearches.length > 0 ? (
              <VStack gap="none">
                <SectionHeader title="Recent Searches" />
                {results.recentSearches.map((search, index) => (
                  <ResultItem key={`recent-${index}`} onPress={() => handleRecentSearchSelect(search)}>
                    <HStack gap="sm" align="center">
                      <Icon as={Clock} size={16} className="text-muted-foreground" />
                      <Text size="sm">{search}</Text>
                    </HStack>
                  </ResultItem>
                ))}
                <ResultItem onPress={clearRecentSearches}>
                  <Text size="sm" tone="muted">
                    Clear recent searches
                  </Text>
                </ResultItem>
              </VStack>
            ) : null}
          </>
        ) : null}

        {/* Stages (when drilled into workflow) */}
        {'stages' in results && results.stages && results.stages.length > 0 ? (
          <VStack gap="none">
            <SectionHeader title="Stages" />
            {results.stages.map((stage) => (
              <StageResult
                key={stage.id}
                result={stage}
                onDrill={() =>
                  handleStageDrill(
                    stage.id,
                    stage.title,
                    stage.metadata?.workflowId as string
                  )
                }
              />
            ))}
          </VStack>
        ) : null}

        {/* Projects */}
        {'projects' in results && results.projects && results.projects.length > 0 ? (
          <VStack gap="none">
            <SectionHeader title="Projects" />
            {results.projects.slice(0, MAX_RESULTS_PER_CATEGORY).map((project) => (
              <ProjectResult
                key={project.id}
                result={project}
                onSelect={() => handleProjectSelect(project.id)}
              />
            ))}
            {results.projects.length > MAX_RESULTS_PER_CATEGORY ? (
              <Box paddingX="md" paddingY="xs">
                <Text size="sm" tone="muted">
                  +{results.projects.length - MAX_RESULTS_PER_CATEGORY} more projects
                </Text>
              </Box>
            ) : null}
          </VStack>
        ) : null}

        {/* Contacts */}
        {'contacts' in results && results.contacts && results.contacts.length > 0 ? (
          <VStack gap="none">
            <SectionHeader title="Contacts" />
            {results.contacts.slice(0, MAX_RESULTS_PER_CATEGORY).map((contact) => (
              <ContactResult
                key={contact.id}
                result={contact}
                onSelect={() => handleContactSelect(contact.id)}
              />
            ))}
            {results.contacts.length > MAX_RESULTS_PER_CATEGORY ? (
              <Box paddingX="md" paddingY="xs">
                <Text size="sm" tone="muted">
                  +{results.contacts.length - MAX_RESULTS_PER_CATEGORY} more contacts
                </Text>
              </Box>
            ) : null}
          </VStack>
        ) : null}

        {/* Accounts */}
        {'accounts' in results && results.accounts && results.accounts.length > 0 ? (
          <VStack gap="none">
            <SectionHeader title="Accounts" />
            {results.accounts.slice(0, MAX_RESULTS_PER_CATEGORY).map((account) => (
              <AccountResult
                key={account.id}
                result={account}
                onSelect={() => handleAccountSelect(account.id)}
              />
            ))}
            {results.accounts.length > MAX_RESULTS_PER_CATEGORY ? (
              <Box paddingX="md" paddingY="xs">
                <Text size="sm" tone="muted">
                  +{results.accounts.length - MAX_RESULTS_PER_CATEGORY} more accounts
                </Text>
              </Box>
            ) : null}
          </VStack>
        ) : null}

        {/* Workflows */}
        {'workflows' in results && results.workflows && results.workflows.length > 0 ? (
          <VStack gap="none">
            <SectionHeader title="Workflows" />
            {results.workflows.map((workflow) => (
              <WorkflowResult
                key={workflow.id}
                result={workflow}
                onDrill={() => handleWorkflowDrill(workflow.id, workflow.title)}
              />
            ))}
          </VStack>
        ) : null}

        {/* Activities */}
        {'activities' in results && results.activities && results.activities.length > 0 ? (
          <VStack gap="none">
            <SectionHeader title="Activities" />
            {results.activities.slice(0, MAX_RESULTS_PER_CATEGORY).map((activity) => (
              <ActivityResult
                key={activity.id}
                result={activity}
                onSelect={() =>
                  handleActivitySelect(
                    activity.id,
                    activity.metadata?.projectId as string
                  )
                }
              />
            ))}
            {results.activities.length > MAX_RESULTS_PER_CATEGORY ? (
              <Box paddingX="md" paddingY="xs">
                <Text size="sm" tone="muted">
                  +{results.activities.length - MAX_RESULTS_PER_CATEGORY} more activities
                </Text>
              </Box>
            ) : null}
          </VStack>
        ) : null}
      </ScrollView>
    </BlurView>
  );
}
