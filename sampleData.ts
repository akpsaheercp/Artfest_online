import { AppState, UserRole, ItemType, PerformanceType, ResultStatus, Category, Team, Item, Participant, Judge, User } from './types';
import { DEFAULT_PAGE_PERMISSIONS } from './constants';

const currentYear = new Date().getFullYear();

// Helper to generate a range of numbers
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

const CATEGORIES: Category[] = [
    { id: 'cat_01', name: 'Primary', maxOnStage: 2, maxOffStage: 2, maxCombined: 3 },
    { id: 'cat_02', name: 'Junior', maxOnStage: 3, maxOffStage: 3, maxCombined: 5 },
    { id: 'cat_03', name: 'Senior', maxOnStage: 3, maxOffStage: 3, maxCombined: 5 },
    { id: 'cat_04', name: 'Super Senior', maxOnStage: 4, maxOffStage: 4, maxCombined: 6 }
];

const TEAMS: Team[] = [
    { id: 'team_01', name: 'Alpha Squad' },
    { id: 'team_02', name: 'Beta Warriors' },
    { id: 'team_03', name: 'Gamma Raiders' },
    { id: 'team_04', name: 'Delta Force' },
    { id: 'team_05', name: 'Epsilon Elite' },
    { id: 'team_06', name: 'Zeta Zealots' }
];

const ITEM_NAMES = [
    'Pencil Drawing', 'Water Color', 'Oil Painting', 'Clay Modeling', 'Collage', 'Cartooning',
    'English Elocution', 'Malayalam Elocution', 'Arabic Elocution', 'Hindi Elocution',
    'English Versification', 'Malayalam Versification', 'Arabic Versification',
    'Light Music (Male)', 'Light Music (Female)', 'Classical Music', 'Instrumental Music',
    'Folk Dance', 'Classical Dance', 'Oppana', 'Duffmuttu', 'Margamkali', 'Group Dance',
    'Elocution', 'Debate', 'Quiz', 'Mime', 'Skit', 'Short Play', 'Mono Act', 'Mimicry',
    'Poster Designing', 'Embroidery', 'Fabric Painting', 'Digital Art', 'Photography',
    'Recitation English', 'Recitation Malayalam', 'Recitation Arabic', 'Recitation Hindi',
    'Spelling Bee', 'Eassy Writing', 'Story Writing', 'Map Drawing', 'Western Solo',
    'Beatboxing', 'Guitar Performance', 'Violin Solo', 'Keyboard', 'Tabla Performance'
];

const ITEMS: Item[] = ITEM_NAMES.map((name, i) => {
    const catIdx = i % CATEGORIES.length;
    const isGroup = i % 5 === 0;
    return {
        id: `item_${i + 1}`,
        name: isGroup ? `${name} (Group)` : name,
        description: `Exhibition of skill in ${name}.`,
        categoryId: CATEGORIES[catIdx].id,
        type: isGroup ? ItemType.GROUP : ItemType.SINGLE,
        performanceType: i % 2 === 0 ? PerformanceType.ON_STAGE : PerformanceType.OFF_STAGE,
        points: isGroup ? { first: 10, second: 7, third: 5 } : { first: 5, second: 3, third: 1 },
        maxParticipants: isGroup ? 8 : 1,
        medium: i % 3 === 0 ? 'English' : (i % 3 === 1 ? 'Malayalam' : 'Universal'),
        duration: isGroup ? 10 : 5
    };
});

const FIRST_NAMES = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah', 'Ibrahim', 'Julia', 'Kevin', 'Lana', 'Michael', 'Nora', 'Oscar', 'Paula', 'Quinn', 'Ryan', 'Sara', 'Tom', 'Uma', 'Victor', 'Wendy', 'Xander', 'Yara', 'Zack'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez'];

const PARTICIPANTS: Participant[] = range(100).map(i => {
    const teamIdx = i % TEAMS.length;
    const catIdx = i % CATEGORIES.length;
    const fName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lName = LAST_NAMES[(i + 5) % LAST_NAMES.length];
    
    // Assign 2-4 items to each participant
    const participantItems = [
        ITEMS[i % ITEMS.length].id,
        ITEMS[(i + 10) % ITEMS.length].id
    ];

    return {
        id: `p_${i + 1}`,
        chestNumber: (100 + i + 1).toString(),
        name: `${fName} ${lName}`,
        teamId: TEAMS[teamIdx].id,
        categoryId: CATEGORIES[catIdx].id,
        itemIds: participantItems
    };
});

const JUDGES: Judge[] = range(10).map(i => ({
    id: `j_${i + 1}`,
    name: `Judge ${FIRST_NAMES[i % FIRST_NAMES.length]}`,
    place: 'Professional Bureau',
    profession: i % 2 === 0 ? 'Senior Educator' : 'Artist'
}));

export const sampleData: AppState = {
  festId: 'sample_fest',
  settings: {
    organizingTeam: 'Excellence Fest Committee',
    heading: 'Grand Knowledge Fest',
    description: 'The official management terminal for orchestrating talent and intelligence.',
    eventDates: [`${currentYear}-05-10`, `${currentYear}-05-11`, `${currentYear}-05-12`],
    maxItemsPerParticipant: { onStage: 3, offStage: 3 },
    maxTotalItemsPerParticipant: 5,
    defaultParticipantsPerItem: 1,
    generalInstructions: 'Welcome to the Grand Knowledge Fest! Adhere to the schedule and rules.',
    rankingStrategy: 'highest_mark',
    autoCodeAssignment: true,
    enableFloatingNav: true,
    mobileSidebarMode: 'floating',
    showInPageInstructions: false,
    eventDays: ['Day 1', 'Day 2', 'Day 3'],
    stages: ['Main Stage', 'Mini Hall', 'Auditorium', 'Open Ground', 'Gallery'],
    timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'],
    scheduleDisplayPriority: 'TIME_FIRST',
    projector: {
        showResults: true,
        showLeaderboard: true,
        showStats: true,
        showUpcoming: true,
        resultsLimit: 5,
        pointsLimit: 10,
        rotationSpeed: 10000
    },
    defaultPoints: {
      single: { first: 5, second: 3, third: 1 },
      group: { first: 10, second: 7, third: 5 },
    },
    reportSettings: {
      heading: 'Festival Merit Report',
      description: 'Official Documentation',
      header: 'Festival Management Terminal',
      footer: 'Official Edition',
      defaultShowHeader: true,
      defaultShowFooter: true,
    },
    institutionDetails: { 
      name: 'Excellence Academy', 
      address: 'Innovation Park, Knowledge City', 
      email: 'info@academy.edu', 
      contactNumber: '+1 800 555 0199', 
      description: 'A hub for creative excellence.', 
      logoUrl: '' 
    },
    branding: { 
      eventName: 'Grand Knowledge Fest',
      description: 'The official management terminal for orchestrating talent and intelligence.',
      motto: 'Where Art Meets Orchestration',
      themeSubtitle: 'The Rooted Tree • Art Fest Edition',
      shortName: 'FEST',
      version: 'v6.5',
      typographyUrl: '', 
      teamLogoUrl: '' 
    }
  },
  instructions: {
    'Home': 'Welcome to the Knowledge Fest management system.',
    'Dashboard': 'Overview of the current festival status.'
  },
  lotPool: [],
  customFonts: {},
  generalCustomFonts: [], 
  customTemplates: [], 
  customFooters: [], 
  customBackgrounds: [], 
  categories: CATEGORIES,
  teams: TEAMS,
  items: ITEMS,
  gradePoints: { 
    single: [
      { id: 'g_1', name: 'A', lowerLimit: 80, upperLimit: 100, points: 5 },
      { id: 'g_2', name: 'B', lowerLimit: 60, upperLimit: 79, points: 3 },
      { id: 'g_3', name: 'C', lowerLimit: 40, upperLimit: 59, points: 1 }
    ], 
    group: [
      { id: 'g_4', name: 'A', lowerLimit: 80, upperLimit: 100, points: 10 },
      { id: 'g_5', name: 'B', lowerLimit: 60, upperLimit: 79, points: 6 },
      { id: 'g_6', name: 'C', lowerLimit: 40, upperLimit: 59, points: 2 }
    ] 
  },
  codeLetters: [
    { id: 'c_1', code: 'A', type: 'General' },
    { id: 'c_2', code: 'B', type: 'General' },
    { id: 'c_3', code: 'C', type: 'General' }
  ],
  participants: PARTICIPANTS,
  schedule: [
    { id: 's_01', itemId: 'item_1', categoryId: 'cat_01', date: `${currentYear}-05-10`, time: '09:00 AM', stage: 'Mini Hall' },
    { id: 's_02', itemId: 'item_2', categoryId: 'cat_02', date: `${currentYear}-05-10`, time: '10:00 AM', stage: 'Main Stage' },
    { id: 's_03', itemId: 'item_3', categoryId: 'cat_03', date: `${currentYear}-05-11`, time: '02:00 PM', stage: 'Auditorium' }
  ],
  judgeAssignments: [
    { id: 'ja_01', itemId: 'item_1', categoryId: 'cat_01', judgeIds: ['j_1', 'j_2'] },
    { id: 'ja_02', itemId: 'item_2', categoryId: 'cat_02', judgeIds: ['j_3'] }
  ],
  tabulation: range(20).map(i => ({ 
      id: `t_${i + 1}`, 
      itemId: ITEMS[i % ITEMS.length].id, 
      categoryId: ITEMS[i % ITEMS.length].categoryId, 
      participantId: PARTICIPANTS[i % PARTICIPANTS.length].id, 
      codeLetter: String.fromCharCode(65 + (i % 26)), 
      marks: { 'j_1': 80 + (i % 15), 'j_2': 85 + (i % 10) }, 
      finalMark: 82.5 + (i % 5), 
      position: (i % 3) + 1, 
      gradeId: i % 2 === 0 ? 'g_1' : 'g_2' 
  })),
  results: range(10).map(i => ({
      itemId: ITEMS[i].id,
      categoryId: ITEMS[i].categoryId,
      status: ResultStatus.DECLARED,
      winners: [
        { participantId: PARTICIPANTS[i].id, position: 1, mark: 90 + i, gradeId: 'g_1' },
        { participantId: PARTICIPANTS[i+10].id, position: 2, mark: 85 + i, gradeId: 'g_1' }
      ]
  })),
  judges: JUDGES,
  users: [
    { id: 'u_01', username: 'admin', password: 'Admin@123', role: UserRole.MANAGER },
    { id: 'u_02', username: 'leader', password: 'Leader1@123', role: UserRole.TEAM_LEADER, teamId: 'team_01' },
    { id: 'u_03', username: 'judge', password: 'Judge1@123', role: UserRole.JUDGE, judgeId: 'j_1' }
  ],
  permissions: DEFAULT_PAGE_PERMISSIONS,
};
