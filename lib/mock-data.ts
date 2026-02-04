// Mock data for the door-to-door sales app

// ============================================================================
// Types
// ============================================================================

// Project Type for categorizing projects
export type ProjectType = {
  id: string;
  name: string;
  icon?: string; // lucide icon name
};

export const PROJECT_TYPES: ProjectType[] = [
  { id: 'residential-roof', name: 'Residential Roof', icon: 'Home' },
  { id: 'commercial-roof', name: 'Commercial Roof', icon: 'Building2' },
];

// Contact type for people in the network
export type ContactType = 'lead' | 'customer' | 'vendor' | 'partner' | 'other';

export type Contact = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: ContactType;
  companyName?: string;
  createdAt: Date;
  updatedAt: Date;
};

export const CONTACT_TYPES: { value: ContactType; label: string }[] = [
  { value: 'lead', label: 'Lead' },
  { value: 'customer', label: 'Customer' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'partner', label: 'Partner' },
  { value: 'other', label: 'Other' },
];

// Account type for organizations
export type AccountType = 'residential' | 'commercial' | 'property_manager' | 'contractor' | 'other';

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
};

export const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'property_manager', label: 'Property Manager' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'other', label: 'Other' },
];

// Custom field types for projects
export type CustomFieldType = 'text' | 'phone' | 'email' | 'date' | 'currency' | 'dropdown';

export type CustomFieldDefinition = {
  key: string;
  label: string;
  type: CustomFieldType;
  required: boolean;
  options?: string[]; // For dropdown type
};

// All 26 custom fields for projects
export const PROJECT_CUSTOM_FIELDS: CustomFieldDefinition[] = [
  // Required field first
  { key: 'leadSource', label: 'Lead Source', type: 'dropdown', required: true, options: ['Referral', 'Door Knock', 'Online', 'Trade Show', 'Other'] },

  // Dropdowns
  { key: 'bidType', label: 'Bid Type', type: 'dropdown', required: false, options: ['Standard', 'Emergency', 'Supplemental'] },
  { key: 'insuranceCarrier', label: 'Insurance Carrier', type: 'dropdown', required: false, options: ['State Farm', 'Allstate', 'Progressive', 'USAA', 'Liberty Mutual', 'Farmers', 'Nationwide', 'Other'] },
  { key: 'jobType', label: 'Job Type', type: 'dropdown', required: false, options: ['Residential', 'Commercial'] },
  { key: 'region', label: 'Region', type: 'dropdown', required: false, options: ['North', 'South', 'East', 'West', 'Central'] },

  // Text fields
  { key: 'claimNumber', label: 'Claim Number', type: 'text', required: false },
  { key: 'companyName', label: 'Company Name', type: 'text', required: false },
  { key: 'roofLinkId', label: 'Rooflink ID', type: 'text', required: false },
  { key: 'roofLinkJob', label: 'Rooflink Job', type: 'text', required: false },

  // Contact fields
  { key: 'customerCell', label: 'Customer Cell', type: 'phone', required: false },
  { key: 'customerPhone', label: 'Customer Phone', type: 'phone', required: false },
  { key: 'customerEmail', label: 'Customer Email', type: 'email', required: false },

  // Currency
  { key: 'deductible', label: 'Deductible', type: 'currency', required: false },

  // Date fields (13 total)
  { key: 'closed', label: 'Closed', type: 'date', required: false },
  { key: 'customerInvoiceSent', label: 'Customer Invoice Sent', type: 'date', required: false },
  { key: 'dateApproved', label: 'Date Approved', type: 'date', required: false },
  { key: 'dateFinalInspectionComplete', label: 'Date Final Inspection Complete', type: 'date', required: false },
  { key: 'dateInspectionCompleted', label: 'Date Inspection Completed', type: 'date', required: false },
  { key: 'dateMidpointInspectionComplete', label: 'Date Midpoint Inspection Complete', type: 'date', required: false },
  { key: 'dateRoofScheduled', label: 'Date Roof Scheduled', type: 'date', required: false },
  { key: 'dateSigned', label: 'Date Signed', type: 'date', required: false },
  { key: 'preContractSigned', label: 'Pre Contract Signed', type: 'date', required: false },
  { key: 'preferredInspectionDate', label: 'Preferred Inspection Date', type: 'date', required: false },
  { key: 'rdRequested', label: 'RD Requested', type: 'date', required: false },
  { key: 'roofComplete', label: 'Roof Complete', type: 'date', required: false },
  { key: 'roofLinkCreationDate', label: 'Rooflink Creation Date', type: 'date', required: false },
];

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

export type ProjectCustomFields = Record<string, string | number | Date | null>;

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
  customFields: ProjectCustomFields;
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
    id: 'workflow-approvals',
    name: 'Approvals',
    stages: [
      { id: 'app-1', name: 'Backlog', order: 1, color: 'grey' },
      { id: 'app-2', name: 'Scheduled', order: 2, color: 'light-blue' },
      { id: 'app-3', name: 'In Progress', order: 3, color: 'blue' },
      { id: 'app-4', name: 'Job Completed', order: 4, color: 'teal' },
      { id: 'app-5', name: 'Invoicing', order: 5, color: 'yellow' },
      { id: 'app-6', name: 'A/R', order: 6, color: 'orange' },
      { id: 'app-7', name: 'Closed', order: 7, color: 'green' },
    ],
  },
  {
    id: 'workflow-cash',
    name: 'Jobs - Cash',
    stages: [
      { id: 'cash-1', name: 'Quote Created', order: 1, color: 'grey' },
      { id: 'cash-2', name: 'Proposal Presented', order: 2, color: 'light-blue' },
      { id: 'cash-3', name: 'Follow Up', order: 3, color: 'yellow' },
      { id: 'cash-4', name: 'Signed', order: 4, color: 'green' },
      { id: 'cash-5', name: 'Production Review', order: 5, color: 'teal' },
      { id: 'cash-6', name: 'Manager Approval', order: 6, color: 'purple' },
    ],
  },
  {
    id: 'workflow-insurance',
    name: 'Jobs - Insurance',
    stages: [
      { id: 'ins-1', name: 'Signed', order: 1, color: 'grey' },
      { id: 'ins-2', name: 'Adjuster Meeting Complete', order: 2, color: 'light-blue' },
      { id: 'ins-3', name: 'Negotiations', order: 3, color: 'blue' },
      { id: 'ins-4', name: 'Margin Review', order: 4, color: 'yellow' },
      { id: 'ins-5', name: 'Upgrades', order: 5, color: 'orange' },
      { id: 'ins-6', name: 'Production Review', order: 6, color: 'teal' },
      { id: 'ins-7', name: 'Manager Approval', order: 7, color: 'purple' },
      { id: 'ins-8', name: 'Dead Lead', order: 8, color: 'red' },
    ],
  },
  {
    id: 'workflow-leads-inbound',
    name: 'Leads - Inbound',
    stages: [
      { id: 'inb-1', name: 'New Lead', order: 1, color: 'grey' },
      { id: 'inb-2', name: 'Follow Up', order: 2, color: 'yellow' },
      { id: 'inb-3', name: 'Inspection Scheduled', order: 3, color: 'light-blue' },
      { id: 'inb-4', name: 'Inspection Complete', order: 4, color: 'green' },
      { id: 'inb-5', name: 'Canceled', order: 5, color: 'red' },
    ],
  },
  {
    id: 'workflow-leads-selfgen',
    name: 'Leads - Self Gen',
    stages: [
      { id: 'sg-1', name: 'Observed Damage', order: 1, color: 'grey' },
      { id: 'sg-2', name: 'No Visible Damage', order: 2, color: 'light-blue' },
      { id: 'sg-3', name: 'Aged Roof', order: 3, color: 'blue' },
      { id: 'sg-4', name: 'Knocked No Contact', order: 4, color: 'yellow' },
      { id: 'sg-5', name: 'Follow Up', order: 5, color: 'orange' },
      { id: 'sg-6', name: 'Inspection Scheduled', order: 6, color: 'teal' },
      { id: 'sg-7', name: 'Inspection Complete', order: 7, color: 'green' },
    ],
  },
  {
    id: 'workflow-open-leads',
    name: 'Open Leads',
    stages: [
      { id: 'ol-1', name: 'Open Lead', order: 1, color: 'grey' },
    ],
  },
  {
    id: 'workflow-renters',
    name: 'Renters',
    stages: [
      { id: 'rent-1', name: 'Renter', order: 1, color: 'grey' },
    ],
  },
  {
    id: 'workflow-lost-leads',
    name: 'Lost Leads',
    stages: [
      { id: 'lost-1', name: 'Not Interested', order: 1, color: 'grey' },
      { id: 'lost-2', name: 'Interested in the Future', order: 2, color: 'light-blue' },
      { id: 'lost-3', name: 'Not Enough Damage', order: 3, color: 'blue' },
      { id: 'lost-4', name: 'Insurance Denial', order: 4, color: 'yellow' },
      { id: 'lost-5', name: 'Dead Cash Lead', order: 5, color: 'orange' },
      { id: 'lost-6', name: 'Absolutely Do Not Contact', order: 6, color: 'red' },
      { id: 'lost-7', name: 'Rooflink Deleted', order: 7, color: 'magenta' },
      { id: 'lost-8', name: 'Lost to Competitor', order: 8, color: 'purple' },
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
    stageId: 'cash-3', // Follow Up
    owners: [MOCK_USERS[0]],
    assignees: [MOCK_USERS[0], MOCK_USERS[1]],
    isFavorite: true,
    isArchived: false,
    createdAt: daysAgo(45),
    updatedAt: daysAgo(2),
    customFields: {
      leadSource: 'Referral',
      jobType: 'Residential',
      customerCell: '(208) 555-1234',
      deductible: 1500,
    },
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
    stageId: 'ins-4', // Margin Review
    owners: [MOCK_USERS[0]],
    assignees: [MOCK_USERS[2]],
    isFavorite: false,
    isArchived: false,
    createdAt: daysAgo(30),
    updatedAt: daysAgo(1),
    customFields: {
      leadSource: 'Door Knock',
      insuranceCarrier: 'State Farm',
      claimNumber: 'CLM-2024-001234',
      deductible: 2500,
      dateInspectionCompleted: daysAgo(25),
    },
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
    stageId: 'cash-5', // Production Review
    owners: [MOCK_USERS[1]],
    assignees: [MOCK_USERS[0]],
    isFavorite: true,
    isArchived: false,
    createdAt: daysAgo(15),
    updatedAt: daysAgo(0),
    customFields: {
      leadSource: 'Online',
      jobType: 'Residential',
      dateSigned: daysAgo(10),
      dateRoofScheduled: daysAgo(-5), // 5 days in the future
    },
  },
  {
    id: 'proj-4',
    name: 'Wilson Lead',
    age: 60,
    ageResetAt: daysAgo(60),
    status: 'off_track',
    ageHistory: [],
    address: '5523 W Fairview Ave, Boise, ID 83706',
    latitude: 43.6185,
    longitude: -116.3050,
    workflowId: 'workflow-leads-selfgen',
    stageId: 'sg-5', // Follow Up
    owners: [MOCK_USERS[0]],
    assignees: [MOCK_USERS[3]],
    isFavorite: false,
    isArchived: false,
    createdAt: daysAgo(60),
    updatedAt: daysAgo(5),
    customFields: {
      leadSource: 'Trade Show',
      companyName: 'Wilson Enterprises LLC',
      jobType: 'Commercial',
    },
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
    workflowId: 'workflow-approvals',
    stageId: 'app-3', // In Progress
    owners: [MOCK_USERS[2]],
    assignees: [MOCK_USERS[0], MOCK_USERS[1]],
    isFavorite: true,
    isArchived: false,
    createdAt: daysAgo(90),
    updatedAt: daysAgo(3),
    customFields: {
      leadSource: 'Referral',
      companyName: 'Chen Holdings',
      jobType: 'Commercial',
      region: 'West',
      deductible: 10000,
    },
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
    stageId: 'ins-2', // Adjuster Meeting Complete
    owners: [MOCK_USERS[0]],
    assignees: [MOCK_USERS[0]],
    isFavorite: false,
    isArchived: false,
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
    customFields: {
      leadSource: 'Door Knock',
      preferredInspectionDate: daysAgo(-2), // 2 days in the future
    },
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
    customFields: {},
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
    customFields: {
      leadSource: 'Other',
      customerEmail: 'anderson@email.com',
      customerPhone: '(208) 555-9876',
    },
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

// ============================================================================
// Mock Contacts
// ============================================================================

export const MOCK_CONTACTS: Contact[] = [
  {
    id: 'contact-1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(208) 555-1234',
    type: 'customer',
    companyName: 'Smith Family',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(2),
  },
  {
    id: 'contact-2',
    name: 'Sarah Johnson',
    email: 'sarah.j@homeowner.com',
    phone: '(208) 555-5678',
    type: 'lead',
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
  },
  {
    id: 'contact-3',
    name: 'Mike Chen',
    email: 'mchen@suppliers.com',
    phone: '(208) 555-9012',
    type: 'vendor',
    companyName: 'Quality Supplies Inc',
    createdAt: daysAgo(60),
    updatedAt: daysAgo(15),
  },
];

// ============================================================================
// Mock Accounts
// ============================================================================

export const MOCK_ACCOUNTS: Account[] = [
  {
    id: 'account-1',
    name: 'Acme Property Management',
    type: 'property_manager',
    address: '123 Business Park Dr, Boise, ID 83702',
    phone: '(208) 555-0001',
    email: 'contact@acmepm.com',
    createdAt: daysAgo(90),
    updatedAt: daysAgo(10),
  },
  {
    id: 'account-2',
    name: 'Downtown Commercial Complex',
    type: 'commercial',
    address: '500 Main St, Boise, ID 83702',
    phone: '(208) 555-0002',
    email: 'facilities@dtcomplex.com',
    createdAt: daysAgo(45),
    updatedAt: daysAgo(5),
  },
  {
    id: 'account-3',
    name: 'Henderson Residential HOA',
    type: 'residential',
    address: '1000 Henderson Blvd, Boise, ID 83705',
    phone: '(208) 555-0003',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(2),
  },
];
