// Mock data for the door-to-door sales app

// ============================================================================
// Types
// ============================================================================

export type WorkflowStage = {
  id: string;
  name: string;
  order: number;
  color: BadgeColor;
};

export type Workflow = {
  id: string;
  name: string;
  stages: WorkflowStage[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string;
};

export type ProjectStatus = 'on_track' | 'at_risk' | 'off_track' | 'disabled';

export type AgeUpdateReason =
  | 'none'
  | 'knock_no_contact'
  | 'contacted'
  | 'inspection_scheduled'
  | 'inspection_completed'
  | 'contract_signed';

export type AgeUpdate = {
  id: string;
  previousAge: number;
  newAge: number;
  reason: AgeUpdateReason;
  status: ProjectStatus;
  note?: string;
  updatedAt: Date;
  updatedBy: User;
};

export type ActivityType = 'note' | 'stage_change' | 'age_update' | 'assignment' | 'created' | 'favorite' | 'archive';

export type Activity = {
  id: string;
  projectId: string;
  type: ActivityType;
  description: string;
  timestamp: Date;
  user: User;
  read: boolean;
  metadata?: Record<string, unknown>;
};

export type Project = {
  id: string;
  name: string;
  age: number;
  ageResetAt: Date;
  status: ProjectStatus;
  ageHistory: AgeUpdate[];
  address: string;
  latitude: number;
  longitude: number;
  workflowId: string;
  stageId: string;
  owners: User[];
  assignees: User[];
  isFavorite: boolean;
  isArchived: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

// Badge color type from the UI library
export type BadgeColor =
  | 'grey'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'light-green'
  | 'green'
  | 'teal'
  | 'cyan'
  | 'light-blue'
  | 'blue'
  | 'purple'
  | 'light-purple'
  | 'violet'
  | 'magenta'
  | 'pink';

// ============================================================================
// Mock Users
// ============================================================================

// Generate 100+ realistic users for testing large lists
const FIRST_NAMES = [
  'James', 'John', 'Robert', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles',
  'Christopher', 'Daniel', 'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua',
  'Mary', 'Patricia', 'Jennifer', 'Linda', 'Barbara', 'Elizabeth', 'Susan', 'Jessica', 'Sarah', 'Karen',
  'Lisa', 'Nancy', 'Betty', 'Margaret', 'Sandra', 'Ashley', 'Kimberly', 'Emily', 'Donna', 'Michelle',
  'Dorothy', 'Carol', 'Amanda', 'Melissa', 'Deborah', 'Stephanie', 'Rebecca', 'Sharon', 'Laura', 'Cynthia',
  'Aaron', 'Adam', 'Adrian', 'Alan', 'Albert', 'Alex', 'Alexander', 'Alfred', 'Allen', 'Andre',
  'Angela', 'Anna', 'Anne', 'Annie', 'April', 'Audrey', 'Benjamin', 'Bradley', 'Brandon', 'Brian',
  'Bruce', 'Bryan', 'Carl', 'Carlos', 'Catherine', 'Charlotte', 'Christina', 'Christine', 'Claudia', 'Colin',
  'Craig', 'Crystal', 'Curtis', 'Dale', 'Dana', 'Danielle', 'Darren', 'Dean', 'Denise', 'Dennis',
  'Derek', 'Diana', 'Diane', 'Douglas', 'Dylan', 'Edward', 'Eric', 'Ethan', 'Eugene', 'Eva',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
  'Turner', 'Phillips', 'Evans', 'Parker', 'Edwards', 'Collins', 'Stewart', 'Morris', 'Murphy', 'Cook',
];

function generateUsers(count: number): User[] {
  const users: User[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    let firstName: string;
    let lastName: string;
    let fullName: string;

    // Ensure unique names
    do {
      firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      fullName = `${firstName} ${lastName}`;
    } while (usedNames.has(fullName));

    usedNames.add(fullName);

    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@salestrak.com`;

    users.push({
      id: `user-${i + 1}`,
      name: fullName,
      email,
      initials,
    });
  }

  // Sort alphabetically by name
  return users.sort((a, b) => a.name.localeCompare(b.name));
}

export const MOCK_USERS: User[] = generateUsers(120);

export const CURRENT_USER = MOCK_USERS[0];

// ============================================================================
// Mock Workflows
// ============================================================================

export const MOCK_WORKFLOWS: Workflow[] = [
  {
    id: 'workflow-cash',
    name: 'Jobs - Cash',
    stages: [
      { id: 'cash-1', name: 'Needs Quote', order: 1, color: 'grey' },
      { id: 'cash-2', name: 'Quote Created', order: 2, color: 'light-blue' },
      { id: 'cash-3', name: 'Proposal Presented', order: 3, color: 'blue' },
      { id: 'cash-4', name: 'Follow Up', order: 4, color: 'yellow' },
      { id: 'cash-5', name: 'Signed', order: 5, color: 'green' },
      { id: 'cash-6', name: 'Production Review', order: 6, color: 'teal' },
      { id: 'cash-7', name: 'Manager Approval', order: 7, color: 'purple' },
    ],
  },
  {
    id: 'workflow-insurance',
    name: 'Jobs - Insurance',
    stages: [
      { id: 'ins-1', name: 'Lead', order: 1, color: 'grey' },
      { id: 'ins-2', name: 'Inspection Scheduled', order: 2, color: 'light-blue' },
      { id: 'ins-3', name: 'Claim Filed', order: 3, color: 'blue' },
      { id: 'ins-4', name: 'Adjustor Meeting', order: 4, color: 'yellow' },
      { id: 'ins-5', name: 'Approved', order: 5, color: 'green' },
      { id: 'ins-6', name: 'Production', order: 6, color: 'teal' },
      { id: 'ins-7', name: 'Complete', order: 7, color: 'purple' },
    ],
  },
  {
    id: 'workflow-retail',
    name: 'Retail Sales',
    stages: [
      { id: 'ret-1', name: 'Prospect', order: 1, color: 'grey' },
      { id: 'ret-2', name: 'Contacted', order: 2, color: 'light-blue' },
      { id: 'ret-3', name: 'Quoted', order: 3, color: 'blue' },
      { id: 'ret-4', name: 'Negotiating', order: 4, color: 'yellow' },
      { id: 'ret-5', name: 'Closed Won', order: 5, color: 'green' },
      { id: 'ret-6', name: 'Closed Lost', order: 6, color: 'red' },
    ],
  },
  {
    id: 'workflow-commercial',
    name: 'Commercial',
    stages: [
      { id: 'com-1', name: 'Initial Contact', order: 1, color: 'grey' },
      { id: 'com-2', name: 'Site Visit', order: 2, color: 'light-blue' },
      { id: 'com-3', name: 'Proposal', order: 3, color: 'blue' },
      { id: 'com-4', name: 'Contract Review', order: 4, color: 'yellow' },
      { id: 'com-5', name: 'Signed', order: 5, color: 'green' },
      { id: 'com-6', name: 'In Progress', order: 6, color: 'teal' },
      { id: 'com-7', name: 'Complete', order: 7, color: 'purple' },
    ],
  },
];

// ============================================================================
// Mock Projects
// ============================================================================

// Generate dates relative to now
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Johnson Residence',
    age: 1,
    ageResetAt: daysAgo(1),
    status: 'on_track',
    ageHistory: [],
    address: '5012 W Targee St, Boise, ID 83705',
    latitude: 43.6355,
    longitude: -116.2980,
    workflowId: 'workflow-cash',
    stageId: 'cash-3',
    owners: [MOCK_USERS[0]],
    assignees: [MOCK_USERS[0], MOCK_USERS[1]],
    isFavorite: true,
    isArchived: false,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(2),
  },
  {
    id: 'proj-2',
    name: 'Smith Insurance Claim',
    age: 30,
    ageResetAt: daysAgo(30),
    status: 'at_risk',
    ageHistory: [],
    address: '4821 W Emerald St, Boise, ID 83706',
    latitude: 43.6310,
    longitude: -116.2890,
    workflowId: 'workflow-insurance',
    stageId: 'ins-4',
    owners: [MOCK_USERS[0]],
    assignees: [MOCK_USERS[2]],
    isFavorite: false,
    isArchived: false,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(1),
  },
  {
    id: 'proj-3',
    name: 'Davis Home Repair',
    age: 15,
    ageResetAt: daysAgo(15),
    status: 'on_track',
    ageHistory: [],
    address: '2109 S Owyhee St, Boise, ID 83705',
    latitude: 43.6280,
    longitude: -116.2995,
    workflowId: 'workflow-cash',
    stageId: 'cash-5',
    owners: [MOCK_USERS[1]],
    assignees: [MOCK_USERS[0]],
    isFavorite: true,
    isArchived: false,
    createdAt: daysAgo(15),
    updatedAt: daysAgo(0),
  },
  {
    id: 'proj-4',
    name: 'Wilson Retail',
    age: 60,
    ageResetAt: daysAgo(60),
    status: 'off_track',
    ageHistory: [],
    address: '5523 W Fairview Ave, Boise, ID 83706',
    latitude: 43.6185,
    longitude: -116.3050,
    workflowId: 'workflow-retail',
    stageId: 'ret-4',
    owners: [MOCK_USERS[0]],
    assignees: [MOCK_USERS[3]],
    isFavorite: false,
    isArchived: false,
    createdAt: daysAgo(60),
    updatedAt: daysAgo(5),
  },
  {
    id: 'proj-5',
    name: 'Chen Commercial Project',
    age: 90,
    ageResetAt: daysAgo(90),
    status: 'on_track',
    ageHistory: [],
    address: '4401 W Morris Hill Rd, Boise, ID 83706',
    latitude: 43.6400,
    longitude: -116.2850,
    workflowId: 'workflow-commercial',
    stageId: 'com-6',
    owners: [MOCK_USERS[2]],
    assignees: [MOCK_USERS[0], MOCK_USERS[1]],
    isFavorite: true,
    isArchived: false,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(3),
  },
  {
    id: 'proj-6',
    name: 'Brown Insurance',
    age: 7,
    ageResetAt: daysAgo(7),
    status: 'on_track',
    ageHistory: [],
    address: '5234 W Overland Rd, Boise, ID 83705',
    latitude: 43.6250,
    longitude: -116.3010,
    workflowId: 'workflow-insurance',
    stageId: 'ins-2',
    owners: [MOCK_USERS[0]],
    assignees: [MOCK_USERS[0]],
    isFavorite: false,
    isArchived: false,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
  },
  {
    id: 'proj-7',
    name: 'Taylor Roofing',
    age: 22,
    ageResetAt: daysAgo(22),
    status: 'at_risk',
    ageHistory: [],
    address: '4712 W Franklin Rd, Boise, ID 83705',
    latitude: 43.6420,
    longitude: -116.2920,
    workflowId: 'workflow-cash',
    stageId: 'cash-1',
    owners: [MOCK_USERS[0]],
    assignees: [],
    isFavorite: false,
    isArchived: false,
    createdAt: daysAgo(22),
    updatedAt: daysAgo(22),
  },
  {
    id: 'proj-8',
    name: 'Anderson Storm Damage',
    age: 3,
    ageResetAt: daysAgo(3),
    status: 'on_track',
    ageHistory: [],
    address: '2305 S Vista Ave, Boise, ID 83705',
    latitude: 43.6320,
    longitude: -116.3080,
    workflowId: 'workflow-insurance',
    stageId: 'ins-1',
    owners: [MOCK_USERS[0]],
    assignees: [MOCK_USERS[0]],
    isFavorite: false,
    isArchived: false,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(0),
  },
];

// ============================================================================
// Mock Activities
// ============================================================================

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    projectId: 'proj-3',
    type: 'stage_change',
    description: 'Moved to "Signed" stage',
    timestamp: daysAgo(0),
    user: MOCK_USERS[0],
    read: false,
    metadata: { fromStage: 'cash-4', toStage: 'cash-5' },
  },
  {
    id: 'act-2',
    projectId: 'proj-8',
    type: 'created',
    description: 'Project created',
    timestamp: daysAgo(0),
    user: MOCK_USERS[0],
    read: false,
  },
  {
    id: 'act-3',
    projectId: 'proj-2',
    type: 'note',
    description: 'Left voicemail for adjustor, will follow up tomorrow',
    timestamp: daysAgo(1),
    user: MOCK_USERS[2],
    read: false,
  },
  {
    id: 'act-4',
    projectId: 'proj-6',
    type: 'stage_change',
    description: 'Moved to "Inspection Scheduled" stage',
    timestamp: daysAgo(1),
    user: MOCK_USERS[0],
    read: true,
  },
  {
    id: 'act-5',
    projectId: 'proj-1',
    type: 'note',
    description: 'Homeowner requested revised quote with premium materials',
    timestamp: daysAgo(2),
    user: MOCK_USERS[0],
    read: true,
  },
  {
    id: 'act-6',
    projectId: 'proj-5',
    type: 'assignment',
    description: 'Sarah Johnson assigned to project',
    timestamp: daysAgo(3),
    user: MOCK_USERS[2],
    read: true,
  },
  {
    id: 'act-7',
    projectId: 'proj-4',
    type: 'age_update',
    description: 'Age updated from 55 to 60 days - Customer requested delay',
    timestamp: daysAgo(5),
    user: MOCK_USERS[3],
    read: true,
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

export function getWorkflowById(id: string): Workflow | undefined {
  return MOCK_WORKFLOWS.find((w) => w.id === id);
}

export function getStageById(workflowId: string, stageId: string): WorkflowStage | undefined {
  const workflow = getWorkflowById(workflowId);
  return workflow?.stages.find((s) => s.id === stageId);
}

export function getProjectsByWorkflow(workflowId: string): Project[] {
  return MOCK_PROJECTS.filter((p) => p.workflowId === workflowId);
}

export function getProjectsByStage(stageId: string): Project[] {
  return MOCK_PROJECTS.filter((p) => p.stageId === stageId);
}

export function getFavoriteProjects(): Project[] {
  return MOCK_PROJECTS.filter((p) => p.isFavorite && !p.isArchived);
}

export function getArchivedProjects(): Project[] {
  return MOCK_PROJECTS.filter((p) => p.isArchived);
}

export function getProjectActivities(projectId: string): Activity[] {
  return MOCK_ACTIVITIES.filter((a) => a.projectId === projectId).sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );
}

export function getRecentActivities(limit = 20): Activity[] {
  return [...MOCK_ACTIVITIES]
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
}

export function getProjectById(id: string): Project | undefined {
  return MOCK_PROJECTS.find((p) => p.id === id);
}

export function getProjectsForCurrentUser(): Project[] {
  return MOCK_PROJECTS.filter(
    (p) =>
      p.owners.some((o) => o.id === CURRENT_USER.id) ||
      p.assignees.some((a) => a.id === CURRENT_USER.id)
  );
}

export function getWorkflowStats(workflowId: string): { stageId: string; count: number }[] {
  const workflow = getWorkflowById(workflowId);
  if (!workflow) return [];

  return workflow.stages.map((stage) => ({
    stageId: stage.id,
    count: MOCK_PROJECTS.filter((p) => p.workflowId === workflowId && p.stageId === stage.id)
      .length,
  }));
}

export function getAllUsers(): User[] {
  return MOCK_USERS;
}
