import { firebaseProject } from "./firebase-config.js";

const STORAGE_KEY = "velora-dr-archive-state";
const NAV_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "worldLore", label: "World Lore" },
  { id: "characters", label: "Characters" },
  { id: "familyTrees", label: "Family Trees" },
  { id: "timeline", label: "Timeline" },
  { id: "locations", label: "Locations" },
  { id: "map", label: "World Map" },
  { id: "gallery", label: "Gallery" },
  { id: "schoolCareer", label: "School & Career" },
  { id: "finance", label: "Bank & Wallet" },
  { id: "wardrobe", label: "Wardrobe" },
  { id: "interiors", label: "Interiors & Exteriors" },
  { id: "belongings", label: "Belongings" },
  { id: "appearance", label: "Appearance" },
  { id: "personality", label: "Personality" },
  { id: "media", label: "Media Collection" },
  { id: "transport", label: "Transportation" },
  { id: "health", label: "Health & Medical" },
  { id: "memorials", label: "Memorials" },
  { id: "diary", label: "Diary" }
];

const SECTION_DEFS = {
  characters: {
    label: "Characters",
    collection: "characters",
    empty: "Add your persona, side characters, family members, rivals, classmates, or love interests.",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "role", label: "Role", type: "text", placeholder: "Main character, best friend, rival, parent..." },
      { name: "pronouns", label: "Pronouns", type: "text" },
      { name: "age", label: "Age", type: "text" },
      { name: "relationshipLabel", label: "Relationship label", type: "text", placeholder: "Soulmate, sibling, coworker" },
      { name: "dynamic", label: "Dynamic", type: "textarea", rows: 3 },
      { name: "howMet", label: "How you met", type: "textarea", rows: 3 },
      { name: "platonicLevel", label: "Platonic level", type: "range", min: 0, max: 10, step: 1 },
      { name: "romanticLevel", label: "Romantic level", type: "range", min: 0, max: 10, step: 1 },
      { name: "personality", label: "Traits and quirks", type: "textarea", rows: 3 },
      { name: "likes", label: "Likes", type: "textarea", rows: 2 },
      { name: "dislikes", label: "Dislikes", type: "textarea", rows: 2 },
      { name: "hobbies", label: "Hobbies and interests", type: "textarea", rows: 2 },
      { name: "image", label: "Image URL or data URL", type: "textarea", rows: 2 }
    ],
    card(record) {
      return [
        imageMarkup(record.image, "avatar-thumb"),
        dataPoints([
          ["Role", record.role],
          ["Relationship", record.relationshipLabel],
          ["Dynamic", record.dynamic],
          ["How you met", record.howMet],
          ["Platonic", scoreLabel(record.platonicLevel)],
          ["Romantic", scoreLabel(record.romanticLevel)],
          ["Hobbies", record.hobbies]
        ])
      ].join("");
    }
  },
  locations: {
    label: "Locations",
    collection: "locations",
    empty: "Track homes, schools, workplaces, cities, fantasy areas, and the vibe of each location.",
    fields: [
      { name: "name", label: "Location name", type: "text", required: true },
      { name: "type", label: "Role in the world", type: "text", placeholder: "House, school, diner, city, hideout..." },
      { name: "relationToCharacter", label: "Relation to character", type: "text", placeholder: "Workplace, home, school, favorite spot" },
      { name: "address", label: "Address or region", type: "text" },
      { name: "atmosphere", label: "Atmosphere and vibes", type: "textarea", rows: 3 },
      { name: "description", label: "Description", type: "textarea", rows: 4 },
      { name: "image", label: "Image URL or data URL", type: "textarea", rows: 2 },
      { name: "mapX", label: "Map X position (%)", type: "number", min: 0, max: 100, step: 0.1 },
      { name: "mapY", label: "Map Y position (%)", type: "number", min: 0, max: 100, step: 0.1 }
    ],
    card(record) {
      return [
        imageMarkup(record.image, "cover-thumb"),
        dataPoints([
          ["Type", record.type],
          ["Relation", record.relationToCharacter],
          ["Address", record.address],
          ["Atmosphere", record.atmosphere],
          ["Description", record.description]
        ])
      ].join("");
    }
  },
  galleryAlbums: {
    label: "Albums & Visionboards",
    collection: "galleryAlbums",
    empty: "Create albums for characters, memories, aesthetics, rooms, outfits, or important eras.",
    fields: [
      { name: "title", label: "Album title", type: "text", required: true },
      { name: "type", label: "Type", type: "text", placeholder: "Visionboard, memory album, character archive" },
      { name: "focus", label: "Focus", type: "text", placeholder: "Character, place, event, mood" },
      { name: "coverImage", label: "Cover image URL or data URL", type: "textarea", rows: 2 },
      { name: "items", label: "Images or notes", type: "textarea", rows: 6, placeholder: "One item per line. Use: image url | caption" },
      { name: "notes", label: "Notes", type: "textarea", rows: 3 }
    ],
    titleKey: "title",
    card(record) {
      const items = parseLineItems(record.items);
      return [
        imageMarkup(record.coverImage || items[0]?.value, "cover-thumb"),
        dataPoints([
          ["Type", record.type],
          ["Focus", record.focus],
          ["Items", String(items.length)],
          ["Notes", record.notes]
        ])
      ].join("");
    }
  },
  diaryEntries: {
    label: "Diary",
    collection: "diaryEntries",
    empty: "Capture memories, dream scenes, turning points, school days, or quiet personal moments.",
    fields: [
      { name: "title", label: "Entry title", type: "text", required: true },
      { name: "entryDate", label: "Date", type: "date" },
      { name: "timeOfDay", label: "Time", type: "text", placeholder: "11:42 PM EST" },
      { name: "mood", label: "Mood", type: "text" },
      { name: "people", label: "People involved", type: "text" },
      { name: "summary", label: "Memory or event", type: "textarea", rows: 7 },
      { name: "tags", label: "Tags", type: "text", placeholder: "comma, separated, tags" }
    ],
    titleKey: "title",
    card(record) {
      return dataPoints([
        ["Date", formatDate(record.entryDate)],
        ["Time", record.timeOfDay],
        ["Mood", record.mood],
        ["People", record.people],
        ["Memory", record.summary]
      ]);
    }
  },
  timelineEvents: {
    label: "Timeline Events",
    collection: "timelineEvents",
    empty: "Track memories, school events, birthdays, deaths, moves, wars, romances, and turning points.",
    fields: [
      { name: "title", label: "Event title", type: "text", required: true },
      { name: "date", label: "Date", type: "date" },
      { name: "time", label: "Time and timezone", type: "text", placeholder: "7:30 PM PST" },
      { name: "category", label: "Category", type: "text", placeholder: "Memory, school event, lore event, family event" },
      { name: "season", label: "Season", type: "text" },
      { name: "dayOfWeek", label: "Day of week", type: "text" },
      { name: "details", label: "Details", type: "textarea", rows: 4 }
    ],
    titleKey: "title",
    card(record) {
      return dataPoints([
        ["Date", formatDate(record.date)],
        ["Time", record.time],
        ["Category", record.category],
        ["Season", record.season],
        ["Details", record.details]
      ]);
    }
  },
  familyTrees: {
    label: "Family Trees",
    collection: "familyTrees",
    empty: "Create multiple editable family trees for different characters or lineages.",
    fields: [
      { name: "title", label: "Tree title", type: "text", required: true },
      { name: "focusCharacter", label: "Focus character", type: "text", placeholder: "Who this family tree belongs to" },
      { name: "members", label: "Members", type: "textarea", rows: 8, placeholder: "One per line: Name | Relation | Parent names | Partner names | Image URL" },
      { name: "notes", label: "Notes", type: "textarea", rows: 3 }
    ],
    titleKey: "title",
    card(record) {
      const members = parseFamilyMembers(record.members);
      return dataPoints([
        ["Focus", record.focusCharacter],
        ["Members", String(members.length)],
        ["Notes", record.notes]
      ]);
    }
  },
  schoolCareerProfiles: {
    label: "School & Career",
    collection: "schoolCareerProfiles",
    empty: "Track school year, clubs, majors, grades, cliques, events, coworkers, salary, and duties.",
    fields: [
      { name: "character", label: "Character", type: "text", required: true },
      { name: "schoolYear", label: "School year", type: "text" },
      { name: "clubs", label: "Clubs and activities", type: "textarea", rows: 2 },
      { name: "major", label: "Major or focus", type: "text" },
      { name: "graduation", label: "Graduation or expected graduation date", type: "text" },
      { name: "futurePlans", label: "Future education plans", type: "textarea", rows: 2 },
      { name: "schoolSchedule", label: "School schedule and classes", type: "textarea", rows: 4 },
      { name: "grades", label: "Grades", type: "textarea", rows: 2 },
      { name: "friendGroups", label: "Clique, classmates, friend groups", type: "textarea", rows: 3 },
      { name: "schoolEvents", label: "School events", type: "textarea", rows: 4 },
      { name: "jobTitle", label: "Job title", type: "text" },
      { name: "employmentPlace", label: "Place of employment", type: "text" },
      { name: "coworkersBosses", label: "Coworkers and boss", type: "textarea", rows: 3 },
      { name: "workSchedule", label: "Work schedule", type: "textarea", rows: 2 },
      { name: "salary", label: "Salary", type: "text" },
      { name: "duties", label: "Job duties", type: "textarea", rows: 3 }
    ],
    titleKey: "character",
    card(record) {
      return dataPoints([
        ["School year", record.schoolYear],
        ["Major", record.major],
        ["Graduation", record.graduation],
        ["Job", [record.jobTitle, record.employmentPlace].filter(Boolean).join(" at ")],
        ["Salary", record.salary],
        ["Events", record.schoolEvents]
      ]);
    }
  },
  financeAccounts: {
    label: "Bank & Wallet",
    collection: "financeAccounts",
    empty: "Track accounts, cash, income, purchases, recurring expenses, and money memories.",
    fields: [
      { name: "name", label: "Account or wallet name", type: "text", required: true },
      { name: "owner", label: "Owner", type: "text" },
      { name: "type", label: "Type", type: "text", placeholder: "Checking, savings, wallet, allowance" },
      { name: "balance", label: "Current balance", type: "number", step: "0.01" },
      { name: "income", label: "Income sources", type: "textarea", rows: 2 },
      { name: "transactions", label: "Transactions", type: "textarea", rows: 6, placeholder: "One per line: 2004-09-01 | paycheck | 350 | incoming" },
      { name: "notes", label: "Notes", type: "textarea", rows: 3 }
    ],
    card(record) {
      const tx = parseTransactionLines(record.transactions);
      return dataPoints([
        ["Owner", record.owner],
        ["Type", record.type],
        ["Balance", formatCurrency(record.balance)],
        ["Transactions", String(tx.length)],
        ["Income", record.income]
      ]);
    }
  },
  wardrobeItems: {
    label: "Wardrobe",
    collection: "wardrobeItems",
    empty: "Catalog clothing, accessories, signature pieces, and complete outfits with imagery.",
    fields: [
      { name: "title", label: "Item or outfit", type: "text", required: true },
      { name: "category", label: "Category", type: "text", placeholder: "Top, dress, shoes, jewelry, full outfit" },
      { name: "owner", label: "Owner", type: "text" },
      { name: "colors", label: "Colors", type: "text" },
      { name: "occasion", label: "Occasion", type: "text" },
      { name: "image", label: "Image URL or data URL", type: "textarea", rows: 2 },
      { name: "details", label: "Details", type: "textarea", rows: 3 }
    ],
    titleKey: "title",
    card(record) {
      return [
        imageMarkup(record.image, "cover-thumb"),
        dataPoints([
          ["Owner", record.owner],
          ["Category", record.category],
          ["Colors", record.colors],
          ["Occasion", record.occasion],
          ["Details", record.details]
        ])
      ].join("");
    }
  },
  interiors: {
    label: "Interiors & Exteriors",
    collection: "interiors",
    empty: "Describe rooms, homes, workplaces, exteriors, and every sensory detail of those spaces.",
    fields: [
      { name: "title", label: "Room or space", type: "text", required: true },
      { name: "location", label: "Related location", type: "text" },
      { name: "type", label: "Interior or exterior", type: "text" },
      { name: "image", label: "Image URL or data URL", type: "textarea", rows: 2 },
      { name: "furniture", label: "Furniture and decor", type: "textarea", rows: 3 },
      { name: "colors", label: "Color scheme and aesthetic", type: "textarea", rows: 2 },
      { name: "layout", label: "Layout", type: "textarea", rows: 2 },
      { name: "temperatureSmell", label: "Temperature and smell", type: "textarea", rows: 2 },
      { name: "vibe", label: "Overall vibe", type: "textarea", rows: 3 }
    ],
    titleKey: "title",
    card(record) {
      return [
        imageMarkup(record.image, "cover-thumb"),
        dataPoints([
          ["Location", record.location],
          ["Type", record.type],
          ["Decor", record.furniture],
          ["Color scheme", record.colors],
          ["Vibe", record.vibe]
        ])
      ].join("");
    }
  },
  belongings: {
    label: "Belongings",
    collection: "belongings",
    empty: "Track what each character carries in bags, lockers, cars, bedrooms, attics, or hidden places.",
    fields: [
      { name: "owner", label: "Owner", type: "text", required: true },
      { name: "container", label: "Where it is kept", type: "text", placeholder: "Purse, backpack, locker, car, nightstand" },
      { name: "items", label: "Items", type: "textarea", rows: 6, placeholder: "One item per line" },
      { name: "notes", label: "Notes", type: "textarea", rows: 3 }
    ],
    titleKey: "owner",
    card(record) {
      const items = splitLines(record.items);
      return dataPoints([
        ["Container", record.container],
        ["Item count", String(items.length)],
        ["Items", items.slice(0, 8).join(", ")],
        ["Notes", record.notes]
      ]);
    }
  },
  appearanceLogs: {
    label: "Appearance",
    collection: "appearanceLogs",
    empty: "Note hairstyle changes, piercings, tattoos, surgeries, weight, scars, skin, and evolving looks.",
    fields: [
      { name: "character", label: "Character", type: "text", required: true },
      { name: "logDate", label: "Date", type: "date" },
      { name: "weight", label: "Weight", type: "text" },
      { name: "skin", label: "Skin", type: "textarea", rows: 2 },
      { name: "hair", label: "Hair cut, style, or dye", type: "textarea", rows: 2 },
      { name: "piercingsTattoos", label: "Piercings and tattoos", type: "textarea", rows: 2 },
      { name: "surgery", label: "Plastic surgery or treatments", type: "textarea", rows: 2 },
      { name: "notes", label: "Notes", type: "textarea", rows: 3 }
    ],
    titleKey: "character",
    card(record) {
      return dataPoints([
        ["Date", formatDate(record.logDate)],
        ["Weight", record.weight],
        ["Skin", record.skin],
        ["Hair", record.hair],
        ["Changes", [record.piercingsTattoos, record.surgery].filter(Boolean).join(" | ")]
      ]);
    }
  },
  personalityProfiles: {
    label: "Personality",
    collection: "personalityProfiles",
    empty: "Log hobbies, interests, likes, dislikes, personality traits, habits, and quirks.",
    fields: [
      { name: "character", label: "Character", type: "text", required: true },
      { name: "traits", label: "Traits", type: "textarea", rows: 3 },
      { name: "quirks", label: "Quirks", type: "textarea", rows: 3 },
      { name: "likes", label: "Likes", type: "textarea", rows: 2 },
      { name: "dislikes", label: "Dislikes", type: "textarea", rows: 2 },
      { name: "interests", label: "Interests and hobbies", type: "textarea", rows: 3 }
    ],
    titleKey: "character",
    card(record) {
      return dataPoints([
        ["Traits", record.traits],
        ["Quirks", record.quirks],
        ["Likes", record.likes],
        ["Dislikes", record.dislikes],
        ["Interests", record.interests]
      ]);
    }
  },
  mediaCollection: {
    label: "Media Collection",
    collection: "mediaCollection",
    empty: "Track books, records, CDs, VHS tapes, games, consoles, cameras, pagers, telephones, and computers.",
    fields: [
      { name: "title", label: "Item", type: "text", required: true },
      { name: "owner", label: "Owner", type: "text" },
      { name: "mediaType", label: "Type", type: "text", placeholder: "Book, CD, VHS, console, pager, camera" },
      { name: "format", label: "Format or edition", type: "text" },
      { name: "condition", label: "Condition", type: "text" },
      { name: "notes", label: "Notes", type: "textarea", rows: 3 }
    ],
    titleKey: "title",
    card(record) {
      return dataPoints([
        ["Owner", record.owner],
        ["Type", record.mediaType],
        ["Format", record.format],
        ["Condition", record.condition],
        ["Notes", record.notes]
      ]);
    }
  },
  transportProfiles: {
    label: "Transportation",
    collection: "transportProfiles",
    empty: "Describe cars, buses, trains, horses, spaceships, preferred travel styles, and modifications.",
    fields: [
      { name: "character", label: "Character", type: "text", required: true },
      { name: "preferredForm", label: "Preferred transportation", type: "text" },
      { name: "vehicle", label: "Vehicle year and model", type: "text" },
      { name: "image", label: "Image URL or data URL", type: "textarea", rows: 2 },
      { name: "modifications", label: "Modifications", type: "textarea", rows: 2 },
      { name: "notes", label: "Notes", type: "textarea", rows: 3 }
    ],
    titleKey: "character",
    card(record) {
      return [
        imageMarkup(record.image, "cover-thumb"),
        dataPoints([
          ["Preferred form", record.preferredForm],
          ["Vehicle", record.vehicle],
          ["Modifications", record.modifications],
          ["Notes", record.notes]
        ])
      ].join("");
    }
  },
  healthProfiles: {
    label: "Health & Medical",
    collection: "healthProfiles",
    empty: "Store weight, height, BMI, blood type, allergies, conditions, medications, treatment teams, and facilities.",
    fields: [
      { name: "character", label: "Character", type: "text", required: true },
      { name: "height", label: "Height", type: "text" },
      { name: "weight", label: "Weight", type: "text" },
      { name: "bmi", label: "BMI", type: "text" },
      { name: "bloodType", label: "Blood type", type: "text" },
      { name: "allergies", label: "Allergies", type: "textarea", rows: 2 },
      { name: "conditions", label: "Physical or mental health conditions", type: "textarea", rows: 3 },
      { name: "medications", label: "Medications and treatments", type: "textarea", rows: 3 },
      { name: "facilities", label: "Treatment facilities", type: "textarea", rows: 2 },
      { name: "careTeam", label: "Doctors, nurses, specialists", type: "textarea", rows: 3 }
    ],
    titleKey: "character",
    card(record) {
      return dataPoints([
        ["Height / Weight", [record.height, record.weight].filter(Boolean).join(" / ")],
        ["BMI", record.bmi],
        ["Blood type", record.bloodType],
        ["Allergies", record.allergies],
        ["Conditions", record.conditions],
        ["Medications", record.medications]
      ]);
    }
  },
  memorials: {
    label: "Memorials",
    collection: "memorials",
    empty: "Remember loved ones and important characters who have passed with timelines and life summaries.",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "age", label: "Age", type: "text" },
      { name: "birthDate", label: "Birth date", type: "date" },
      { name: "deathDate", label: "Death date", type: "date" },
      { name: "reason", label: "Circumstance", type: "textarea", rows: 3 },
      { name: "epitaph", label: "Epitaph", type: "text" },
      { name: "relation", label: "Relation to main character", type: "text" },
      { name: "summary", label: "Life summary or memories", type: "textarea", rows: 5 }
    ],
    card(record) {
      return dataPoints([
        ["Age", record.age],
        ["Dates", [formatDate(record.birthDate), formatDate(record.deathDate)].filter(Boolean).join(" - ")],
        ["Relation", record.relation],
        ["Circumstance", record.reason],
        ["Epitaph", record.epitaph],
        ["Summary", record.summary]
      ]);
    }
  }
};

const DEFAULT_WORLD = () => ({
  id: crypto.randomUUID(),
  name: "My Desired Reality",
  genre: "Modern fantasy",
  summary: "A beautiful place to organize your timeline, people, and lore.",
  coverImage: "",
  timeProfile: {
    decade: "",
    year: "",
    season: "",
    month: "",
    day: "",
    dayOfWeek: "",
    time: "",
    timezone: ""
  },
  lore: {
    timePeriod: "",
    racesEthnicities: "",
    location: "",
    currency: "",
    laws: "",
    notes: ""
  },
  map: {
    mode: "custom",
    customMapImage: "",
    realMapQuery: "",
    notes: ""
  },
  characters: [],
  locations: [],
  galleryAlbums: [],
  diaryEntries: [],
  timelineEvents: [],
  familyTrees: [],
  schoolCareerProfiles: [],
  financeAccounts: [],
  wardrobeItems: [],
  interiors: [],
  belongings: [],
  appearanceLogs: [],
  personalityProfiles: [],
  mediaCollection: [],
  transportProfiles: [],
  healthProfiles: [],
  memorials: []
});

const DEFAULT_STATE = {
  version: 1,
  activeSection: "overview",
  activeWorldId: null,
  profile: {
    email: "",
    authMode: "local",
    syncedAt: ""
  },
  worlds: [DEFAULT_WORLD()]
};

const dom = {
  navList: document.querySelector("#navList"),
  worldSelect: document.querySelector("#worldSelect"),
  worldMeta: document.querySelector("#worldMeta"),
  dashboardGrid: document.querySelector("#dashboardGrid"),
  sectionContainer: document.querySelector("#sectionContainer"),
  saveStatus: document.querySelector("#saveStatus"),
  syncBadge: document.querySelector("#syncBadge"),
  authStatus: document.querySelector("#authStatus"),
  authForm: document.querySelector("#authForm"),
  emailInput: document.querySelector("#emailInput"),
  passwordInput: document.querySelector("#passwordInput"),
  logoutBtn: document.querySelector("#logoutBtn"),
  saveBtn: document.querySelector("#saveBtn"),
  exportBtn: document.querySelector("#exportBtn"),
  importInput: document.querySelector("#importInput"),
  addWorldBtn: document.querySelector("#addWorldBtn"),
  duplicateWorldBtn: document.querySelector("#duplicateWorldBtn"),
  deleteWorldBtn: document.querySelector("#deleteWorldBtn"),
  installBtn: document.querySelector("#installBtn"),
  quickPersonaBtn: document.querySelector("#quickPersonaBtn"),
  quickMemoryBtn: document.querySelector("#quickMemoryBtn"),
  heroTitle: document.querySelector("#heroTitle"),
  heroCopy: document.querySelector("#heroCopy"),
  editorDialog: document.querySelector("#editorDialog"),
  editorForm: document.querySelector("#editorForm"),
  dialogEyebrow: document.querySelector("#dialogEyebrow"),
  dialogTitle: document.querySelector("#dialogTitle"),
  editorFields: document.querySelector("#editorFields"),
  closeDialogBtn: document.querySelector("#closeDialogBtn"),
  cancelDialogBtn: document.querySelector("#cancelDialogBtn"),
  mapDialog: document.querySelector("#mapDialog"),
  mapForm: document.querySelector("#mapForm"),
  closeMapBtn: document.querySelector("#closeMapBtn"),
  cancelMapBtn: document.querySelector("#cancelMapBtn"),
  recordTemplate: document.querySelector("#recordTemplate")
};

let state = loadState();
state.activeWorldId ||= state.worlds[0]?.id || null;
let pendingInstallPrompt = null;
let firebaseClient = null;
let dirty = false;
let editorContext = null;

init();

async function init() {
  renderNav();
  renderAll();
  attachEvents();
  registerServiceWorker();
  await setupFirebase();
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return structuredClone(DEFAULT_STATE);
    }
    const parsed = JSON.parse(raw);
    return mergeDefaults(parsed);
  } catch (error) {
    console.warn("Falling back to default state.", error);
    return structuredClone(DEFAULT_STATE);
  }
}

function mergeDefaults(existing) {
  const merged = structuredClone(DEFAULT_STATE);
  Object.assign(merged, existing);
  merged.worlds = (existing.worlds?.length ? existing.worlds : [DEFAULT_WORLD()]).map((world) => ({
    ...DEFAULT_WORLD(),
    ...world,
    timeProfile: { ...DEFAULT_WORLD().timeProfile, ...(world.timeProfile || {}) },
    lore: { ...DEFAULT_WORLD().lore, ...(world.lore || {}) },
    map: { ...DEFAULT_WORLD().map, ...(world.map || {}) }
  }));
  merged.activeWorldId ||= merged.worlds[0]?.id || null;
  return merged;
}

function getActiveWorld() {
  return state.worlds.find((world) => world.id === state.activeWorldId) || state.worlds[0];
}

function setDirty(message = "Changes not saved yet.") {
  dirty = true;
  dom.saveStatus.textContent = message;
}

function clearDirty(message = "All changes saved.") {
  dirty = false;
  dom.saveStatus.textContent = message;
}

function attachEvents() {
  dom.worldSelect.addEventListener("change", (event) => {
    state.activeWorldId = event.target.value;
    state.activeSection = "overview";
    renderAll();
    setDirty("World selection updated.");
  });

  dom.addWorldBtn.addEventListener("click", () => {
    const world = DEFAULT_WORLD();
    world.name = `Desired Reality ${state.worlds.length + 1}`;
    state.worlds.push(world);
    state.activeWorldId = world.id;
    setDirty("New world created.");
    renderAll();
  });

  dom.duplicateWorldBtn.addEventListener("click", () => {
    const world = structuredClone(getActiveWorld());
    world.id = crypto.randomUUID();
    world.name = `${world.name} Copy`;
    for (const key of Object.keys(world)) {
      if (Array.isArray(world[key])) {
        world[key] = world[key].map((record) => ({ ...record, id: crypto.randomUUID() }));
      }
    }
    state.worlds.push(world);
    state.activeWorldId = world.id;
    setDirty("World duplicated.");
    renderAll();
  });

  dom.deleteWorldBtn.addEventListener("click", () => {
    if (state.worlds.length === 1) {
      window.alert("Keep at least one world in the archive.");
      return;
    }
    const world = getActiveWorld();
    const confirmed = window.confirm(`Delete "${world.name}" and all of its records?`);
    if (!confirmed) {
      return;
    }
    state.worlds = state.worlds.filter((entry) => entry.id !== world.id);
    state.activeWorldId = state.worlds[0].id;
    setDirty("World deleted.");
    renderAll();
  });

  dom.saveBtn.addEventListener("click", () => {
    persistState({ cloud: true });
  });

  dom.exportBtn.addEventListener("click", exportBackup);
  dom.importInput.addEventListener("change", importBackup);

  dom.authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = dom.emailInput.value.trim();
    const password = dom.passwordInput.value;
    if (!email) {
      return;
    }
    if (!firebaseClient) {
      state.profile.email = email;
      state.profile.authMode = "local";
      setDirty("Local profile updated.");
      renderAuth();
      persistState({ cloud: false });
      return;
    }

    if (!password) {
      dom.authStatus.textContent = "Enter a password to log in or sign up with Firebase.";
      return;
    }

    try {
      dom.authStatus.textContent = "Connecting to Firebase...";
      await firebaseClient.login(email, password);
      state.profile.email = email;
      state.profile.authMode = "firebase";
      await loadCloudState();
      await persistState({ cloud: true });
      renderAll();
    } catch (error) {
      dom.authStatus.textContent = error.message || "Firebase login failed.";
    }
  });

  dom.logoutBtn.addEventListener("click", async () => {
    if (firebaseClient) {
      await firebaseClient.logout();
    }
    state.profile.authMode = "local";
    dom.passwordInput.value = "";
    renderAuth();
  });

  dom.quickPersonaBtn.addEventListener("click", () => openEditor("characters"));
  dom.quickMemoryBtn.addEventListener("click", () => openEditor("diaryEntries"));

  dom.closeDialogBtn.addEventListener("click", () => dom.editorDialog.close());
  dom.cancelDialogBtn.addEventListener("click", () => dom.editorDialog.close());
  dom.editorForm.addEventListener("submit", saveEditorRecord);

  dom.closeMapBtn.addEventListener("click", () => dom.mapDialog.close());
  dom.cancelMapBtn.addEventListener("click", () => dom.mapDialog.close());
  dom.mapForm.addEventListener("submit", saveMapSettings);

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    pendingInstallPrompt = event;
    dom.installBtn.hidden = false;
  });

  dom.installBtn.addEventListener("click", async () => {
    if (!pendingInstallPrompt) {
      return;
    }
    await pendingInstallPrompt.prompt();
    pendingInstallPrompt = null;
    dom.installBtn.hidden = true;
  });
}

function renderNav() {
  dom.navList.innerHTML = "";
  NAV_ITEMS.forEach((item) => {
    const button = document.createElement("button");
    button.className = `nav-btn ${state.activeSection === item.id ? "active" : ""}`;
    button.type = "button";
    button.textContent = item.label;
    button.addEventListener("click", () => {
      state.activeSection = item.id;
      renderAll();
    });
    dom.navList.append(button);
  });
}

function renderAll() {
  renderNav();
  renderWorldSwitcher();
  renderAuth();
  renderHero();
  renderDashboard();
  renderSection();
}

function renderWorldSwitcher() {
  const world = getActiveWorld();
  dom.worldSelect.innerHTML = state.worlds
    .map((entry) => `<option value="${entry.id}" ${entry.id === world.id ? "selected" : ""}>${escapeHtml(entry.name)}</option>`)
    .join("");

  dom.worldMeta.innerHTML = dataPoints([
    ["Genre", world.genre],
    ["Time period", world.lore.timePeriod],
    ["Setting", world.lore.location],
    ["Current timeline", [world.timeProfile.year, world.timeProfile.season, world.timeProfile.time].filter(Boolean).join(" | ")]
  ]);
}

function renderAuth() {
  dom.emailInput.value = state.profile.email || "";
  dom.syncBadge.textContent = firebaseClient && state.profile.authMode === "firebase" ? "Cloud Sync" : "Local";
  dom.authStatus.textContent = firebaseClient
    ? state.profile.email
      ? `Signed in as ${state.profile.email}. Cloud sync is ready.`
      : "Firebase is configured. Log in with email to sync across devices."
    : "Local profile mode is active until Firebase is configured.";
}

function renderHero() {
  const world = getActiveWorld();
  dom.heroTitle.textContent = world.name;
  dom.heroCopy.textContent =
    world.summary || "Shape the world, record your timeline, and keep every meaningful detail close.";
}

function renderDashboard() {
  const world = getActiveWorld();
  const metrics = [
    ["Characters", world.characters.length, "Personas, side characters, dynamics"],
    ["Places", world.locations.length, "Homes, schools, jobs, fantasy regions"],
    ["Memories", world.diaryEntries.length, "Diary entries and key moments"],
    ["Timeline", world.timelineEvents.length, "Events across seasons and years"],
    ["Albums", world.galleryAlbums.length, "Visionboards and photo archives"],
    ["Family Trees", world.familyTrees.length, "Lineages and relationships"],
    ["Finance", financeSummary(world), "Tracked total across accounts"],
    ["Memorials", world.memorials.length, "People remembered in the timeline"]
  ];

  dom.dashboardGrid.innerHTML = metrics
    .map(
      ([label, value, copy]) => `
        <article class="metric-card">
          <p class="metric-label">${escapeHtml(label)}</p>
          <p class="metric-value">${escapeHtml(String(value))}</p>
          <p class="meta-text">${escapeHtml(copy)}</p>
        </article>
      `
    )
    .join("");
}

function renderSection() {
  const sectionId = state.activeSection;
  if (sectionId === "overview") {
    renderOverview();
    return;
  }
  if (sectionId === "worldLore") {
    renderWorldLore();
    return;
  }
  if (sectionId === "timeline") {
    renderTimeline();
    return;
  }
  if (sectionId === "map") {
    renderMapSection();
    return;
  }
  if (sectionId === "gallery") {
    renderCollectionSection("galleryAlbums");
    return;
  }
  if (sectionId === "finance") {
    renderFinanceSection();
    return;
  }
  if (sectionId === "diary") {
    renderDiarySection();
    return;
  }
  if (sectionId === "schoolCareer") {
    renderCollectionSection("schoolCareerProfiles");
    return;
  }
  if (sectionId === "wardrobe") {
    renderCollectionSection("wardrobeItems");
    return;
  }
  if (sectionId === "interiors") {
    renderCollectionSection("interiors");
    return;
  }
  if (sectionId === "belongings") {
    renderCollectionSection("belongings");
    return;
  }
  if (sectionId === "appearance") {
    renderCollectionSection("appearanceLogs");
    return;
  }
  if (sectionId === "personality") {
    renderCollectionSection("personalityProfiles");
    return;
  }
  if (sectionId === "media") {
    renderCollectionSection("mediaCollection");
    return;
  }
  if (sectionId === "transport") {
    renderCollectionSection("transportProfiles");
    return;
  }
  if (sectionId === "health") {
    renderCollectionSection("healthProfiles");
    return;
  }
  if (sectionId === "memorials") {
    renderCollectionSection("memorials");
    return;
  }
  if (sectionId === "characters") {
    renderCollectionSection("characters");
    return;
  }
  if (sectionId === "locations") {
    renderCollectionSection("locations");
    return;
  }
  if (sectionId === "familyTrees") {
    renderFamilyTrees();
  }
}

function renderOverview() {
  const world = getActiveWorld();
  const upcoming = [...world.timelineEvents]
    .sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")))
    .slice(0, 5);
  const recentMemories = [...world.diaryEntries].slice(-4).reverse();

  dom.sectionContainer.innerHTML = `
    <section class="section-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">World Summary</p>
          <h2>Reality Hub</h2>
        </div>
        <button id="editWorldOverviewBtn" class="primary-btn" type="button">Edit World</button>
      </div>
      <div class="insight-grid">
        <article class="insight-card">
          <p class="metric-label">Lore</p>
          <h3>${escapeHtml(world.lore.timePeriod || "Set the time period")}</h3>
          <p class="meta-text">${escapeHtml(world.lore.notes || "Add races, currency, politics, and cultural details.")}</p>
        </article>
        <article class="insight-card">
          <p class="metric-label">Current Time</p>
          <h3>${escapeHtml(
            [world.timeProfile.decade, world.timeProfile.year, world.timeProfile.month, world.timeProfile.day].filter(Boolean).join(" ")
          ) || "Define the DR timeline"}</h3>
          <p class="meta-text">${escapeHtml(
            [world.timeProfile.dayOfWeek, world.timeProfile.time, world.timeProfile.timezone].filter(Boolean).join(" | ")
          )}</p>
        </article>
        <article class="insight-card">
          <p class="metric-label">Atmosphere</p>
          <h3>${escapeHtml(world.genre || "Choose a genre")}</h3>
          <p class="meta-text">${escapeHtml(world.summary)}</p>
        </article>
      </div>
    </section>

    <section class="section-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Timeline</p>
          <h2>Upcoming or Saved Events</h2>
        </div>
        <button id="addTimelineBtn" class="ghost-btn" type="button">Add Event</button>
      </div>
      <div class="timeline-list">
        ${
          upcoming.length
            ? upcoming.map((event) => timelineItemMarkup(event)).join("")
            : `<div class="empty-state">No events yet. Add birthdays, milestones, school events, or memories.</div>`
        }
      </div>
    </section>

    <section class="section-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Memory Vault</p>
          <h2>Recent Diary Entries</h2>
        </div>
        <button id="addDiaryBtn" class="ghost-btn" type="button">Add Entry</button>
      </div>
      <div class="record-grid">
        ${
          recentMemories.length
            ? recentMemories.map((entry) => renderRecordCard("diaryEntries", entry, true)).join("")
            : `<div class="empty-state">No diary entries yet. Start with a memory, scene, or moment in the timeline.</div>`
        }
      </div>
    </section>
  `;

  document.querySelector("#editWorldOverviewBtn").addEventListener("click", openWorldEditor);
  document.querySelector("#addTimelineBtn").addEventListener("click", () => openEditor("timelineEvents"));
  document.querySelector("#addDiaryBtn").addEventListener("click", () => openEditor("diaryEntries"));
  bindRecordCardActions();
}

function renderWorldLore() {
  const world = getActiveWorld();
  dom.sectionContainer.innerHTML = `
    <section class="section-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Lore Library</p>
          <h2>World Details</h2>
        </div>
        <button id="editWorldLoreBtn" class="primary-btn" type="button">Edit Lore</button>
      </div>
      <div class="record-grid">
        <article class="record-card subtle-panel">
          <div class="record-body">
            ${dataPoints([
              ["Time period", world.lore.timePeriod],
              ["Races and ethnicities", world.lore.racesEthnicities],
              ["General location", world.lore.location],
              ["Currency", world.lore.currency],
              ["Laws or social rules", world.lore.laws],
              ["Notes", world.lore.notes]
            ])}
          </div>
        </article>
        <article class="record-card subtle-panel">
          <div class="record-body">
            ${dataPoints([
              ["Decade", world.timeProfile.decade],
              ["Year", world.timeProfile.year],
              ["Season", world.timeProfile.season],
              ["Month", world.timeProfile.month],
              ["Day", world.timeProfile.day],
              ["Day of week", world.timeProfile.dayOfWeek],
              ["Time", world.timeProfile.time],
              ["Timezone", world.timeProfile.timezone]
            ])}
          </div>
        </article>
      </div>
    </section>
  `;
  document.querySelector("#editWorldLoreBtn").addEventListener("click", openWorldEditor);
}

function renderCollectionSection(sectionKey) {
  const def = SECTION_DEFS[sectionKey];
  const world = getActiveWorld();
  const items = world[def.collection];

  dom.sectionContainer.innerHTML = `
    <section class="section-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">${escapeHtml(def.label)}</p>
          <h2>${escapeHtml(def.label)}</h2>
        </div>
        <button id="addRecordBtn" class="primary-btn" type="button">Add ${escapeHtml(singularLabel(def.label))}</button>
      </div>
      <p class="meta-text">${escapeHtml(def.empty)}</p>
      <div class="record-grid">
        ${items.length ? items.map((record) => renderRecordCard(sectionKey, record)).join("") : `<div class="empty-state">${escapeHtml(def.empty)}</div>`}
      </div>
    </section>
  `;

  document.querySelector("#addRecordBtn").addEventListener("click", () => openEditor(sectionKey));
  bindRecordCardActions();
}

function renderTimeline() {
  const world = getActiveWorld();
  const events = [...world.timelineEvents].sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")));
  const current = world.timeProfile;
  dom.sectionContainer.innerHTML = `
    <section class="section-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Timekeeping</p>
          <h2>Timeline & Calendar</h2>
        </div>
        <div class="row gap-sm">
          <button id="editWorldTimeBtn" class="ghost-btn" type="button">Edit Current Time</button>
          <button id="addTimelineEventBtn" class="primary-btn" type="button">Add Event</button>
        </div>
      </div>
      <div class="insight-grid">
        <article class="insight-card">
          <p class="metric-label">Current DR Date</p>
          <h3>${escapeHtml([current.month, current.day, current.year].filter(Boolean).join(" ") || "Not set yet")}</h3>
          <p class="meta-text">${escapeHtml([current.dayOfWeek, current.time, current.timezone].filter(Boolean).join(" | "))}</p>
        </article>
        <article class="insight-card">
          <p class="metric-label">Season & Decade</p>
          <h3>${escapeHtml([current.season, current.decade].filter(Boolean).join(" | ") || "Not set yet")}</h3>
          <p class="meta-text">Use this to anchor diaries, memories, school schedules, and world events.</p>
        </article>
      </div>
      ${renderCalendar(events)}
      <div class="timeline-list">
        ${events.length ? events.map((event) => timelineItemMarkup(event, true)).join("") : `<div class="empty-state">No timeline events yet.</div>`}
      </div>
    </section>
  `;
  document.querySelector("#editWorldTimeBtn").addEventListener("click", openWorldEditor);
  document.querySelector("#addTimelineEventBtn").addEventListener("click", () => openEditor("timelineEvents"));
  bindRecordCardActions();
}

function renderFamilyTrees() {
  const world = getActiveWorld();
  const trees = world.familyTrees;
  dom.sectionContainer.innerHTML = `
    <section class="section-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Relationship Archive</p>
          <h2>Editable Family Trees</h2>
        </div>
        <button id="addTreeBtn" class="primary-btn" type="button">Add Family Tree</button>
      </div>
      ${
        trees.length
          ? trees
              .map((tree) => {
                const members = parseFamilyMembers(tree.members);
                return `
                  <article class="record-card subtle-panel" data-section="familyTrees" data-record-id="${tree.id}">
                    <div class="record-card-head">
                      <div>
                        <p class="record-tag">Family Tree</p>
                        <h3 class="record-title">${escapeHtml(tree.title || "Untitled tree")}</h3>
                      </div>
                      <div class="row gap-sm">
                        <button class="ghost-btn small-btn edit-btn" type="button">Edit</button>
                        <button class="ghost-btn small-btn delete-btn danger-btn" type="button">Delete</button>
                      </div>
                    </div>
                    ${dataPoints([
                      ["Focus", tree.focusCharacter],
                      ["Notes", tree.notes]
                    ])}
                    <div class="tree-grid">
                      ${
                        members.length
                          ? members
                              .map(
                                (member) => `
                                  <article class="tree-member">
                                    ${member.image ? `<img src="${escapeAttr(member.image)}" alt="${escapeAttr(member.name)}" class="avatar-thumb" />` : ""}
                                    <h4>${escapeHtml(member.name || "Unnamed member")}</h4>
                                    <div class="member-lines">
                                      <span>Relation: ${escapeHtml(member.relation || "Unknown")}</span>
                                      <span>Parents: ${escapeHtml(member.parents || "None listed")}</span>
                                      <span>Partner(s): ${escapeHtml(member.partners || "None listed")}</span>
                                    </div>
                                  </article>
                                `
                              )
                              .join("")
                          : `<div class="empty-state">No members yet. Add one member per line in the tree editor.</div>`
                      }
                    </div>
                  </article>
                `;
              })
              .join("")
          : `<div class="empty-state">No family trees yet. Create one for your main character, a dynasty, or a side family.</div>`
      }
    </section>
  `;
  document.querySelector("#addTreeBtn").addEventListener("click", () => openEditor("familyTrees"));
  bindRecordCardActions();
}

function renderDiarySection() {
  renderCollectionSection("diaryEntries");
}

function renderFinanceSection() {
  const world = getActiveWorld();
  const accounts = world.financeAccounts;
  const totals = accounts.reduce(
    (acc, account) => {
      acc.balance += Number(account.balance || 0);
      acc.transactions += parseTransactionLines(account.transactions).length;
      return acc;
    },
    { balance: 0, transactions: 0 }
  );
  dom.sectionContainer.innerHTML = `
    <section class="section-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Money Tracker</p>
          <h2>Bank & Wallet</h2>
        </div>
        <button id="addFinanceBtn" class="primary-btn" type="button">Add Account</button>
      </div>
      <div class="insight-grid">
        <article class="insight-card">
          <p class="metric-label">Tracked Balance</p>
          <h3>${escapeHtml(formatCurrency(totals.balance))}</h3>
        </article>
        <article class="insight-card">
          <p class="metric-label">Transactions</p>
          <h3>${escapeHtml(String(totals.transactions))}</h3>
        </article>
      </div>
      <div class="record-grid">
        ${accounts.length ? accounts.map((record) => renderRecordCard("financeAccounts", record)).join("") : `<div class="empty-state">No finances tracked yet.</div>`}
      </div>
    </section>
  `;
  document.querySelector("#addFinanceBtn").addEventListener("click", () => openEditor("financeAccounts"));
  bindRecordCardActions();
}

function renderMapSection() {
  const world = getActiveWorld();
  const locations = world.locations;
  dom.sectionContainer.innerHTML = `
    <section class="section-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Map Studio</p>
          <h2>World Map</h2>
        </div>
        <div class="row gap-sm">
          <button id="editMapBtn" class="ghost-btn" type="button">Map Settings</button>
          <button id="addLocationBtn" class="primary-btn" type="button">Add Location</button>
        </div>
      </div>
      <div class="map-layout">
        <div class="map-canvas" id="mapCanvas">
          ${
            world.map.customMapImage
              ? `<img src="${escapeAttr(world.map.customMapImage)}" alt="World map" class="map-thumb" />`
              : `<div class="empty-state">Add a custom map image or switch to real-world map mode.</div>`
          }
          ${locations
            .filter((location) => location.mapX !== "" && location.mapY !== "")
            .map(
              (location) => `
                <button
                  class="map-pin"
                  type="button"
                  data-location-id="${location.id}"
                  title="${escapeAttr(location.name)}"
                  style="left:${Number(location.mapX)}%; top:${Number(location.mapY)}%;"
                ></button>
              `
            )
            .join("")}
        </div>
        <aside class="map-sidebar">
          <p class="metric-label">Mode</p>
          <h3>${escapeHtml(world.map.mode === "real" ? "Real Place Links" : "Custom Map")}</h3>
          <p class="meta-text">${escapeHtml(world.map.notes || "Pin location cards onto your custom image map or store a real-world place query.")}</p>
          ${
            world.map.realMapQuery
              ? `<p><a class="link-btn" href="https://www.openstreetmap.org/search?query=${encodeURIComponent(world.map.realMapQuery)}" target="_blank" rel="noreferrer">Open ${escapeHtml(world.map.realMapQuery)} in OpenStreetMap</a></p>`
              : ""
          }
          <div class="gallery-list">
            ${
              locations.length
                ? locations
                    .map(
                      (location) => `
                        <article class="timeline-item">
                          <strong>${escapeHtml(location.name)}</strong>
                          <p class="meta-text">${escapeHtml(location.relationToCharacter || location.type || "Location")}</p>
                          <p>${escapeHtml(location.atmosphere || location.description || "")}</p>
                        </article>
                      `
                    )
                    .join("")
                : `<div class="empty-state">Add locations to connect them with your world map.</div>`
            }
          </div>
        </aside>
      </div>
    </section>
  `;

  document.querySelector("#editMapBtn").addEventListener("click", openMapEditor);
  document.querySelector("#addLocationBtn").addEventListener("click", () => openEditor("locations"));

  document.querySelectorAll(".map-pin").forEach((pin) => {
    pin.addEventListener("click", () => {
      const recordId = pin.dataset.locationId;
      openEditor("locations", recordId);
    });
  });
}

function renderCalendar(events) {
  const baseDate = getCalendarAnchor(events);
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const offset = (firstOfMonth.getDay() + 6) % 7;
  const calendarStart = new Date(year, month, 1 - offset);
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const cells = [];

  for (let index = 0; index < 35; index += 1) {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    const iso = date.toISOString().slice(0, 10);
    const matching = events.filter((event) => event.date === iso);
    cells.push(`
      <div class="calendar-cell ${date.getMonth() !== month ? "is-muted" : ""}">
        <div class="calendar-row">
          <span>${date.getDate()}</span>
          <span class="calendar-label">${dayLabels[(index % 7)]}</span>
        </div>
        <div class="calendar-events">
          ${matching.map((event) => `<div class="calendar-event">${escapeHtml(event.title)}</div>`).join("")}
        </div>
      </div>
    `);
  }

  return `
    <div class="section-panel">
      <div class="section-head">
        <div>
          <p class="eyebrow">Calendar</p>
          <h2>${baseDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h2>
        </div>
      </div>
      <div class="calendar-grid">${cells.join("")}</div>
    </div>
  `;
}

function openWorldEditor() {
  const world = getActiveWorld();
  editorContext = { type: "world" };
  dom.dialogEyebrow.textContent = "World Settings";
  dom.dialogTitle.textContent = world.name;
  dom.editorFields.innerHTML = `
    ${renderField({ name: "name", label: "World name", type: "text", required: true }, world.name)}
    ${renderField({ name: "genre", label: "Genre", type: "text" }, world.genre)}
    ${renderField({ name: "summary", label: "Summary", type: "textarea", rows: 4 }, world.summary)}
    ${renderField({ name: "coverImage", label: "Cover image URL or data URL", type: "textarea", rows: 2 }, world.coverImage)}
    ${renderField({ name: "timePeriod", label: "Time period", type: "text" }, world.lore.timePeriod)}
    ${renderField({ name: "racesEthnicities", label: "Races and ethnicities", type: "textarea", rows: 2 }, world.lore.racesEthnicities)}
    ${renderField({ name: "location", label: "General location", type: "text" }, world.lore.location)}
    ${renderField({ name: "currency", label: "Currency", type: "text" }, world.lore.currency)}
    ${renderField({ name: "laws", label: "Social rules or laws", type: "textarea", rows: 2 }, world.lore.laws)}
    ${renderField({ name: "loreNotes", label: "Lore notes", type: "textarea", rows: 4 }, world.lore.notes)}
    ${renderField({ name: "decade", label: "Decade", type: "text" }, world.timeProfile.decade)}
    ${renderField({ name: "year", label: "Year", type: "text" }, world.timeProfile.year)}
    ${renderField({ name: "season", label: "Season", type: "text" }, world.timeProfile.season)}
    ${renderField({ name: "month", label: "Month", type: "text" }, world.timeProfile.month)}
    ${renderField({ name: "day", label: "Day", type: "text" }, world.timeProfile.day)}
    ${renderField({ name: "dayOfWeek", label: "Day of week", type: "text" }, world.timeProfile.dayOfWeek)}
    ${renderField({ name: "time", label: "Current time", type: "text" }, world.timeProfile.time)}
    ${renderField({ name: "timezone", label: "Timezone", type: "text" }, world.timeProfile.timezone)}
  `;
  dom.editorDialog.showModal();
}

function openMapEditor() {
  const world = getActiveWorld();
  dom.mapForm.mode.value = world.map.mode;
  dom.mapForm.realMapQuery.value = world.map.realMapQuery;
  dom.mapForm.customMapImage.value = world.map.customMapImage;
  dom.mapForm.notes.value = world.map.notes;
  dom.mapDialog.showModal();
}

function saveMapSettings(event) {
  event.preventDefault();
  const world = getActiveWorld();
  const data = new FormData(dom.mapForm);
  world.map = {
    mode: String(data.get("mode") || "custom"),
    realMapQuery: String(data.get("realMapQuery") || ""),
    customMapImage: String(data.get("customMapImage") || ""),
    notes: String(data.get("notes") || "")
  };
  setDirty("Map settings updated.");
  dom.mapDialog.close();
  renderAll();
}

function openEditor(sectionKey, recordId = null) {
  const def = SECTION_DEFS[sectionKey];
  const world = getActiveWorld();
  const collection = world[def.collection];
  const record = recordId ? collection.find((entry) => entry.id === recordId) : null;
  editorContext = { type: "record", sectionKey, recordId };
  dom.dialogEyebrow.textContent = def.label;
  dom.dialogTitle.textContent = record ? getRecordTitle(def, record) : `New ${singularLabel(def.label)}`;
  dom.editorFields.innerHTML = def.fields.map((field) => renderField(field, record?.[field.name] ?? "")).join("");
  dom.editorDialog.showModal();
}

function saveEditorRecord(event) {
  event.preventDefault();
  if (!editorContext) {
    return;
  }
  const world = getActiveWorld();
  const data = new FormData(dom.editorForm);

  if (editorContext.type === "world") {
    world.name = String(data.get("name") || world.name);
    world.genre = String(data.get("genre") || "");
    world.summary = String(data.get("summary") || "");
    world.coverImage = String(data.get("coverImage") || "");
    world.lore = {
      timePeriod: String(data.get("timePeriod") || ""),
      racesEthnicities: String(data.get("racesEthnicities") || ""),
      location: String(data.get("location") || ""),
      currency: String(data.get("currency") || ""),
      laws: String(data.get("laws") || ""),
      notes: String(data.get("loreNotes") || "")
    };
    world.timeProfile = {
      decade: String(data.get("decade") || ""),
      year: String(data.get("year") || ""),
      season: String(data.get("season") || ""),
      month: String(data.get("month") || ""),
      day: String(data.get("day") || ""),
      dayOfWeek: String(data.get("dayOfWeek") || ""),
      time: String(data.get("time") || ""),
      timezone: String(data.get("timezone") || "")
    };
    setDirty("World details updated.");
    dom.editorDialog.close();
    renderAll();
    return;
  }

  const { sectionKey, recordId } = editorContext;
  const def = SECTION_DEFS[sectionKey];
  const collection = world[def.collection];
  const nextRecord = recordId
    ? collection.find((entry) => entry.id === recordId)
    : { id: crypto.randomUUID(), createdAt: new Date().toISOString() };

  def.fields.forEach((field) => {
    nextRecord[field.name] = normalizeValue(field, data.get(field.name));
  });

  if (!recordId) {
    collection.push(nextRecord);
  }

  setDirty(`${def.label} updated.`);
  dom.editorDialog.close();
  renderAll();
}

function renderField(field, value) {
  const safeValue = value ?? "";
  if (field.type === "textarea") {
    return `
      <label>
        ${escapeHtml(field.label)}
        <textarea name="${escapeAttr(field.name)}" rows="${field.rows || 4}" placeholder="${escapeAttr(field.placeholder || "")}">${escapeHtml(
          String(safeValue)
        )}</textarea>
      </label>
    `;
  }
  if (field.type === "range") {
    return `
      <label>
        ${escapeHtml(field.label)}
        <input
          type="range"
          name="${escapeAttr(field.name)}"
          min="${field.min || 0}"
          max="${field.max || 10}"
          step="${field.step || 1}"
          value="${escapeAttr(String(safeValue || 0))}"
        />
      </label>
    `;
  }
  return `
    <label>
      ${escapeHtml(field.label)}
      <input
        type="${escapeAttr(field.type || "text")}"
        name="${escapeAttr(field.name)}"
        value="${escapeAttr(String(safeValue))}"
        placeholder="${escapeAttr(field.placeholder || "")}"
        ${field.required ? "required" : ""}
        ${field.min !== undefined ? `min="${field.min}"` : ""}
        ${field.max !== undefined ? `max="${field.max}"` : ""}
        ${field.step !== undefined ? `step="${field.step}"` : ""}
      />
    </label>
  `;
}

function bindRecordCardActions() {
  document.querySelectorAll(".record-card[data-section]").forEach((card) => {
    const sectionKey = card.dataset.section;
    const recordId = card.dataset.recordId;
    card.querySelector(".edit-btn")?.addEventListener("click", () => openEditor(sectionKey, recordId));
    card.querySelector(".delete-btn")?.addEventListener("click", () => deleteRecord(sectionKey, recordId));
  });
}

function deleteRecord(sectionKey, recordId) {
  const def = SECTION_DEFS[sectionKey];
  const world = getActiveWorld();
  const record = world[def.collection].find((entry) => entry.id === recordId);
  if (!record) {
    return;
  }
  const confirmed = window.confirm(`Delete "${getRecordTitle(def, record)}"?`);
  if (!confirmed) {
    return;
  }
  world[def.collection] = world[def.collection].filter((entry) => entry.id !== recordId);
  setDirty(`${def.label} updated.`);
  renderAll();
}

function renderRecordCard(sectionKey, record, compact = false) {
  const def = SECTION_DEFS[sectionKey];
  const fragment = dom.recordTemplate.content.cloneNode(true);
  const element = fragment.querySelector(".record-card");
  element.dataset.section = sectionKey;
  element.dataset.recordId = record.id;
  fragment.querySelector(".record-tag").textContent = def.label;
  fragment.querySelector(".record-title").textContent = getRecordTitle(def, record);
  fragment.querySelector(".record-body").innerHTML = def.card(record);
  if (compact) {
    element.classList.add("memory-card");
  }
  const wrapper = document.createElement("div");
  wrapper.append(fragment);
  return wrapper.innerHTML;
}

function getRecordTitle(def, record) {
  const key = def.titleKey || "name";
  return record[key] || record.title || record.character || record.owner || record.name || "Untitled record";
}

function normalizeValue(field, value) {
  if (field.type === "number") {
    return value === "" || value === null ? "" : Number(value);
  }
  return String(value || "");
}

function dataPoints(entries) {
  const filtered = entries.filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "");
  if (!filtered.length) {
    return `<div class="empty-state">Add details to bring this section to life.</div>`;
  }
  return `
    <div class="data-points">
      ${filtered
        .map(
          ([label, value]) => `
            <div class="data-point">
              <strong>${escapeHtml(label)}</strong>
              <span>${escapeHtml(String(value))}</span>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function imageMarkup(src, className) {
  return src ? `<img class="${className}" src="${escapeAttr(src)}" alt="" />` : "";
}

function splitLines(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseLineItems(value) {
  return splitLines(value).map((line) => {
    const [valuePart, captionPart] = line.split("|").map((entry) => entry.trim());
    return { value: valuePart || "", caption: captionPart || "" };
  });
}

function parseFamilyMembers(value) {
  return splitLines(value).map((line) => {
    const [name, relation, parents, partners, image] = line.split("|").map((entry) => entry.trim());
    return { name, relation, parents, partners, image };
  });
}

function parseTransactionLines(value) {
  return splitLines(value).map((line) => {
    const [date, label, amount, direction] = line.split("|").map((entry) => entry.trim());
    return { date, label, amount: Number(amount || 0), direction };
  });
}

function scoreLabel(value) {
  if (value === "" || value === undefined || value === null) {
    return "";
  }
  return `${value}/10`;
}

function formatDate(value) {
  if (!value) {
    return "";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function getCalendarAnchor(events) {
  const firstEvent = events.find((event) => event.date);
  return firstEvent ? new Date(firstEvent.date) : new Date();
}

function financeSummary(world) {
  return formatCurrency(world.financeAccounts.reduce((sum, account) => sum + Number(account.balance || 0), 0));
}

function singularLabel(label) {
  const irregular = {
    Characters: "Character",
    Locations: "Location",
    "Albums & Visionboards": "Album",
    Diary: "Diary Entry",
    "Timeline Events": "Timeline Event",
    "Family Trees": "Family Tree",
    "School & Career": "Profile",
    "Bank & Wallet": "Account",
    Wardrobe: "Wardrobe Item",
    "Interiors & Exteriors": "Space",
    Belongings: "Belongings Log",
    Appearance: "Appearance Log",
    Personality: "Personality Profile",
    "Media Collection": "Media Item",
    Transportation: "Transportation Profile",
    "Health & Medical": "Health Profile",
    Memorials: "Memorial"
  };
  return irregular[label] || label.replace(/s$/, "");
}

function timelineItemMarkup(event, withActions = false) {
  return `
    <article class="timeline-item ${withActions ? "record-card" : ""}" ${withActions ? `data-section="timelineEvents" data-record-id="${event.id}"` : ""}>
      <div class="timeline-row">
        <strong>${escapeHtml(event.title || "Untitled event")}</strong>
        <span class="pill">${escapeHtml(formatDate(event.date) || "No date")}</span>
      </div>
      <p class="meta-text">${escapeHtml([event.category, event.time, event.dayOfWeek].filter(Boolean).join(" | "))}</p>
      <p>${escapeHtml(event.details || "")}</p>
      ${withActions ? `<div class="row gap-sm"><button class="ghost-btn small-btn edit-btn" type="button">Edit</button><button class="ghost-btn small-btn delete-btn danger-btn" type="button">Delete</button></div>` : ""}
    </article>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function exportBackup() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "velora-backup.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function importBackup(event) {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || "{}"));
      state = mergeDefaults(parsed);
      setDirty("Backup imported. Save to keep it.");
      renderAll();
    } catch (error) {
      window.alert("That backup file could not be read.");
    }
  };
  reader.readAsText(file);
}

async function persistState({ cloud }) {
  state.profile.syncedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  clearDirty(firebaseClient && cloud && state.profile.authMode === "firebase" ? "Saved locally and synced to cloud." : "Saved locally.");
  if (firebaseClient && cloud && state.profile.authMode === "firebase") {
    try {
      await firebaseClient.saveState(state);
      renderAuth();
    } catch (error) {
      dom.saveStatus.textContent = "Saved locally, but cloud sync failed.";
      console.error(error);
    }
  }
}

async function loadCloudState() {
  if (!firebaseClient) {
    return;
  }
  const remote = await firebaseClient.loadState();
  if (remote?.worlds?.length) {
    const email = state.profile.email;
    const authMode = state.profile.authMode;
    state = mergeDefaults(remote);
    state.profile.email = email;
    state.profile.authMode = authMode;
    clearDirty("Loaded cloud archive.");
  }
}

async function setupFirebase() {
  if (!firebaseProject.enabled) {
    renderAuth();
    return;
  }
  try {
    const [{ initializeApp }, { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut }, { getFirestore, doc, getDoc, setDoc }] =
      await Promise.all([
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"),
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js")
      ]);

    const app = initializeApp(firebaseProject);
    const auth = getAuth(app);
    const db = getFirestore(app);

    firebaseClient = {
      async login(email, password) {
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch {
          await createUserWithEmailAndPassword(auth, email, password);
        }
      },
      async logout() {
        await signOut(auth);
      },
      async saveState(nextState) {
        const user = auth.currentUser;
        if (!user) {
          throw new Error("No Firebase user is logged in.");
        }
        await setDoc(doc(db, "veloraArchives", user.uid), nextState);
      },
      async loadState() {
        const user = auth.currentUser;
        if (!user) {
          return null;
        }
        const snapshot = await getDoc(doc(db, "veloraArchives", user.uid));
        return snapshot.exists() ? snapshot.data() : null;
      }
    };

    renderAuth();
  } catch (error) {
    console.error("Firebase setup failed.", error);
    dom.authStatus.textContent = "Firebase config exists, but setup failed. The app is still usable locally.";
  }
}

async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("./sw.js");
    } catch (error) {
      console.warn("Service worker registration failed.", error);
    }
  }
}
