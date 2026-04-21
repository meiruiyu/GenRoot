import {
  type FamilyAnswer,
  type FamilyArchive,
  type InterestTag,
  type OnboardingPreference,
} from "@/lib/types";

export const interestOptions: InterestTag[] = [
  "Ethnic Dress",
  "Language & Songs",
  "Traditional Crafts",
  "Festivals & Rituals",
  "Food & Recipes",
  "Family Stories",
  "Architecture & Villages",
  "Beliefs & Ceremonies",
];

export const defaultPreference: OnboardingPreference = {
  role: "both",
  hometown: "Kaili, Guizhou",
  interests: ["Language & Songs", "Traditional Crafts", "Family Stories"],
};

export const demoArchive: FamilyArchive = {
  id: "mia-family",
  title: "Mia's Family Memory Archive",
  subtitle:
    "Mia is 25, from Kaili in Guizhou, and currently a graduate student in New York. She wants to preserve her grandmother's songs, wax-dye craft, and migration stories before they disappear.",
  homeRegion: "Kaili, Guizhou",
  theme: "A private family archive and public culture map centered on Mia, her grandmother, and Miao heritage in Kaili",
  members: [
    {
      id: "grandma-aqiao",
      name: "Grandma Aqiao",
      relation: "Grandmother",
      hometown: "Lushan Town, Kaili, Guizhou",
      generation: "Grandparent",
      bio: "At 85, she still remembers ancient Miao songs, wax-dye techniques, and how the family slowly settled in Guizhou after migrating from Hunan.",
      heritageLanguage: "Miao / Mandarin",
      avatar: "/demo-assets/grandma-portrait.jpg",
      storyCount: 4,
      position: { x: 16, y: 18 },
    },
    {
      id: "mother-lan",
      name: "Lan",
      relation: "Mother / Family Coordinator",
      hometown: "Kaili, Guizhou",
      generation: "Parent",
      bio: "She knows which old photos, songs, and family stories are still undocumented, and she is the most reliable bridge between Mia and Grandma Aqiao.",
      heritageLanguage: "Mandarin / Miao",
      avatar: "/demo-assets/grandma-speaking.jpg",
      storyCount: 2,
      position: { x: 27, y: 46 },
    },
    {
      id: "mia",
      name: "Mia",
      relation: "Granddaughter / Recorder",
      hometown: "Kaili, Guizhou",
      generation: "Next Generation",
      bio: "A 25-year-old graduate student in New York at Columbia. She is quietly afraid that one day a call will end and these stories will be gone forever.",
      heritageLanguage: "Mandarin / English",
      avatar: "/demo-assets/mia-portrait.png",
      storyCount: 3,
      position: { x: 27, y: 74 },
    },
  ],
  memories: [
    {
      id: "wax-dye-song",
      memberId: "grandma-aqiao",
      title: "Grandma Aqiao sings an old Miao song while working on wax dye",
      teaser:
        "What Mia is afraid of losing is not only the craft itself, but the way Grandma Aqiao naturally starts singing while she works.",
      duration: "03:42",
      date: "2026-04-07",
      location: "Lushan Town, Kaili, Guizhou",
      year: "1978",
      language: "Miao + Mandarin",
      privacy: "family",
      type: "craft",
      coverImage: "/demo-assets/grandma-wax-dye.png",
      audioLabel: "Grandma voice note · Mia remote recording · 03:42",
      transcript:
        "First you draw the wax, then you dye the cloth slowly. When we were young, we sang ancient songs at the festival grounds. No one taught us in a classroom. We heard them as children and simply knew them. Even now that you are in New York, remember this song traveled out of Kaili with you.",
      translation:
        "First the cloth is wax-drawn, then dyed slowly. When we were young, we sang ancient Miao songs at festivals. No one taught us formally; we simply grew up hearing them. Even in New York, remember this song traveled out of Kaili with you.",
      summary:
        "This memory ties together Miao wax-dye craft, festival songs, and the emotional connection between Mia in New York and her grandmother in Kaili.",
      tags: [
        { label: "Kaili", category: "Place" },
        { label: "Grandma Aqiao", category: "Person" },
        { label: "Festival Gathering", category: "Ritual" },
        { label: "Wax Dye", category: "Craft" },
        { label: "Fear of Loss", category: "Emotion" },
      ],
      entities: {
        people: ["Grandma Aqiao", "Mia"],
        locations: ["Kaili", "Lushan Town"],
        years: ["1978"],
        events: ["Miao festival gathering", "Wax-dye making", "Remote recording from New York"],
      },
      publicSafeVersion:
        "An elderly Miao woman from Kaili remembers singing while making wax-dyed textiles in her youth. Today, her granddaughter in New York is preserving those sounds remotely.",
    },
    {
      id: "migration-story",
      memberId: "grandma-aqiao",
      title: "Grandma Aqiao remembers how the family came from Hunan to Guizhou",
      teaser:
        "Mia has always wanted to understand why Kaili feels like home, and her grandmother's memory reaches even further back to the family's migration from Hunan.",
      duration: "04:10",
      date: "2026-04-06",
      location: "Kaili, Guizhou",
      year: "1959",
      language: "Miao + Mandarin",
      privacy: "private",
      type: "person",
      coverImage: "/demo-assets/grandma-storytelling.jpg",
      audioLabel: "Grandma migration story · 04:10",
      transcript:
        "When I was little, the elders always said our family had come from Hunan. They walked for a long time before settling in Guizhou. Later we made a life in Kaili, learned these roads and these mountains, and still carried the old ways of speaking with us.",
      translation:
        "When I was little, the elders always said our family came from Hunan and walked for a long time before settling in Guizhou. Later we made a home in Kaili, learned these roads and mountains, and carried our old expressions with us.",
      summary:
        "This is the first time Mia can connect her sense of home in Kaili with the deeper migration history that began in Hunan.",
      tags: [
        { label: "Hunan", category: "Place" },
        { label: "Grandma Aqiao", category: "Person" },
        { label: "Migration Memory", category: "Ritual" },
        { label: "Oral History", category: "Craft" },
        { label: "Searching for Origins", category: "Emotion" },
      ],
      entities: {
        people: ["Grandma Aqiao", "Family Elders"],
        locations: ["Hunan", "Guizhou", "Kaili"],
        years: ["1959"],
        events: ["Family migration", "Settlement in Kaili"],
      },
      publicSafeVersion:
        "A Miao elder in Kaili recalls how the family migrated from Hunan, built a new home in Guizhou, and carried language and memory with them.",
    },
    {
      id: "kaili-culture-notes",
      memberId: "mia",
      title: "Mia wants a clearer way to rediscover Kaili's festivals, language, and traditions",
      teaser:
        "Beyond her grandmother's personal memories, Mia realizes that her understanding of Kaili's culture is fragmented and hard to navigate.",
      duration: "02:16",
      date: "2026-04-05",
      location: "Kaili, Guizhou",
      year: "2026",
      language: "Mandarin / English",
      privacy: "public",
      type: "ritual",
      coverImage: "/demo-assets/mia-phone-call.jpg",
      audioLabel: "Mia research note · 02:16",
      transcript:
        "I know Kaili's festivals, language, and Miao traditions only in fragments. Every time I go back, it feels familiar, but when I try to explain it to friends I cannot tell the story clearly. That is why I want to connect our family archive to a public culture map.",
      translation:
        "I only know Kaili's festivals, language, and Miao traditions in fragments. Every time I return it feels familiar, but when I try to explain it to friends, I cannot do it clearly. I want to connect our family stories to a public culture map.",
      summary:
        "This memory represents the second product layer: Mia wants not only to preserve family memory, but also to use a map to understand Kaili's cultural fabric.",
      tags: [
        { label: "Kaili", category: "Place" },
        { label: "Mia", category: "Person" },
        { label: "Festivals & Rituals", category: "Ritual" },
        { label: "Cultural Discovery", category: "Craft" },
        { label: "Need for Structure", category: "Emotion" },
      ],
      entities: {
        people: ["Mia"],
        locations: ["Kaili"],
        years: ["2026"],
        events: ["Cultural research", "Public map exploration"],
      },
      publicSafeVersion:
        "A young person from Kaili studying in New York wants to connect family memory with a public culture map so festivals, language, and ethnic traditions are no longer scattered and hard to find.",
    },
  ],
  publicStories: [
    {
      id: "public-wax-dye-song",
      memoryId: "wax-dye-song",
      title: "A grandmother's wax dye and ancient songs in Kaili",
      summary:
        "Mia shares one part of Grandma Aqiao's wax-dye and singing memory so other people can encounter Miao culture through a real family voice.",
      country: "China",
      region: "Guizhou · Kaili",
      dialect: "Miao",
      type: "craft",
      coordinates: { x: 107.982, y: 26.583 },
      tags: ["Wax Dye", "Miao Song", "Kaili"],
      sourceFamily: "Mia's Family",
    },
    {
      id: "public-kaili-culture",
      memoryId: "kaili-culture-notes",
      title: "Entering Kaili's culture map through family memory",
      summary:
        "The map is not just for places. It gives people like Mia a structured entry point into the culture of home.",
      country: "China",
      region: "Guizhou · Kaili",
      dialect: "Mandarin / English",
      type: "ritual",
      coordinates: { x: 108.001, y: 26.578 },
      tags: ["Kaili", "Festivals", "Miao Traditions"],
      sourceFamily: "Mia's Family",
    },
    {
      id: "public-nyc-diaspora",
      memoryId: "migration-story",
      title: "Mia in New York asks how her family came to Kaili",
      summary:
        "While studying in New York, Mia reconstructs her family's path from Hunan to Guizhou through her grandmother's memory.",
      country: "United States",
      region: "New York",
      dialect: "Mandarin / English",
      type: "person",
      coordinates: { x: -74.006, y: 40.713 },
      tags: ["Migration", "Diaspora", "Family Origins"],
      sourceFamily: "Mia's Family",
    },
  ],
  timeline: [
    {
      year: "1950s",
      title: "Family elders pass down stories carried from Hunan into Guizhou",
      location: "Hunan -> Guizhou",
    },
    {
      year: "1978",
      title: "Grandma Aqiao keeps ancient songs and wax dye alive through festival life",
      location: "Lushan Town, Kaili",
    },
    {
      year: "2026",
      title: "Mia decides in New York to preserve her grandmother's voice and Kaili's cultural clues",
      location: "New York / Kaili",
    },
    {
      year: "2026",
      title: "Private memory begins to turn into a public culture map",
      location: "Kaili",
    },
  ],
};

export const featuredMemory = demoArchive.memories[0];

export const recommendedStories = demoArchive.publicStories.slice(0, 3);

export const sampleFamilyAnswers: Record<string, FamilyAnswer> = {
  "Why did our family move here?": {
    answer:
      "According to Grandma Aqiao's oral history, the family came from Hunan to Guizhou and gradually made a home in Kaili. For Mia, the answer matters not only as migration history, but as the first clear explanation of where her connection to Kaili begins.",
    citations: ["Grandma Aqiao remembers how the family came from Hunan to Guizhou", "Mia wants a clearer way to rediscover Kaili's festivals, language, and traditions"],
  },
  "What traditions has our family kept?": {
    answer:
      "The archive currently shows three traditions most clearly: Grandma Aqiao's wax-dye practice, the old Miao songs she still remembers, and the everyday festival and cultural knowledge tied to Kaili. These are exactly the things Mia feels she must preserve now, while she still can.",
    citations: ["Grandma Aqiao sings an old Miao song while working on wax dye", "Mia wants a clearer way to rediscover Kaili's festivals, language, and traditions"],
  },
};
