import type { FamilyArchive } from "@/lib/types";
import type { Locale } from "./types";

type MemoryOverlay = {
  title?: string;
  teaser?: string;
  summary?: string;
  publicSafeVersion?: string;
};

type PublicStoryOverlay = {
  title?: string;
  summary?: string;
};

type MemberOverlay = {
  name?: string;
  relation?: string;
  bio?: string;
  generation?: string;
};

const memoryOverlays: Record<Locale, Record<string, MemoryOverlay>> = {
  en: {},
  zh: {
    "wax-dye-song": {
      title: "阿乔奶奶做蜡染时唱起古老苗族歌曲",
      teaser: "Mia 害怕失去的不只是手艺本身，还有阿乔奶奶工作时自然唱起歌的方式。",
      summary:
        "这段记忆将苗族蜡染、节日歌谣，以及纽约的 Mia 与凯里祖母之间的情感联结串联在一起。",
      publicSafeVersion:
        "一位来自凯里的苗族老人回忆年轻时做蜡染织物时唱歌的情景。如今，她在纽约的孙女正远程保存这些声音。",
    },
    "migration-story": {
      title: "阿乔奶奶回忆家族如何从湖南来到贵州",
      teaser:
        "Mia 一直想了解凯里为何像家，而祖母的记忆更追溯到从湖南迁徙的家族历史。",
      summary: "这是 Mia 第一次把对凯里的归属感与始于湖南的更深层迁徙史联系起来。",
      publicSafeVersion:
        "一位凯里苗族长者回忆家族从湖南迁来、在贵州安家，并带着语言与记忆一路前行。",
    },
    "kaili-culture-notes": {
      title: "Mia 希望更清晰地重新发现凯里的节日、语言与传统",
      teaser: "除了祖母的个人记忆，Mia 发现自己对凯里文化的理解零散而难以梳理。",
      summary:
        "这段记忆代表第二层产品诉求：Mia 不仅想保存家族记忆，还想通过地图理解凯里的文化结构。",
      publicSafeVersion:
        "一位在纽约求学的凯里年轻人，希望把家族记忆与公开文化地图连接，让节日、语言与民族传统不再零散难寻。",
    },
  },
};

const publicStoryOverlays: Record<Locale, Record<string, PublicStoryOverlay>> = {
  en: {},
  zh: {
    "public-wax-dye-song": {
      title: "凯里一位祖母的蜡染与古老歌谣",
      summary: "Mia 分享阿乔奶奶蜡染与歌唱记忆的一部分，让他人通过真实家族声音接触苗族文化。",
    },
    "public-kaili-culture": {
      title: "通过家族记忆进入凯里文化地图",
      summary: "地图不只是标记地点，也为像 Mia 这样的人提供理解家乡文化的结构化入口。",
    },
    "public-nyc-diaspora": {
      title: "在纽约的 Mia 追问家族如何来到凯里",
      summary: "在纽约求学期间，Mia 通过祖母的记忆重建从湖南到贵州的家族路径。",
    },
  },
};

const memberOverlays: Record<Locale, Record<string, MemberOverlay>> = {
  en: {},
  zh: {
    "grandma-aqiao": {
      name: "阿乔奶奶",
      relation: "祖母",
      generation: "祖辈",
      bio: "85 岁的她仍记得古老苗族歌曲、蜡染技艺，以及家族从湖南迁来后在贵州慢慢安家的经历。",
    },
    "mother-lan": {
      name: "兰",
      relation: "母亲 / 家族协调者",
      generation: "父母辈",
      bio: "她知道哪些老照片、歌谣和家族故事仍未被记录，也是 Mia 与阿乔奶奶之间最可靠的桥梁。",
    },
    mia: {
      name: "Mia",
      relation: "孙女 / 记录者",
      generation: "下一代",
      bio: "25 岁，哥伦比亚大学研究生。她默默害怕某天一通电话后，这些故事将永远消失。",
    },
  },
};

const archiveMeta: Record<Locale, { title: string; subtitle: string }> = {
  en: {
    title: "Mia's Family Memory Archive",
    subtitle:
      "Mia is 25, from Kaili in Guizhou, and currently a graduate student in New York. She wants to preserve her grandmother's songs, wax-dye craft, and migration stories before they disappear.",
  },
  zh: {
    title: "Mia 的家族记忆档案",
    subtitle:
      "25 岁的 Mia 来自贵州凯里，现于纽约读研。她想在祖母的歌谣、蜡染与迁徙故事消失之前，把它们保存下来。",
  },
};

export function getLocalizedArchive(locale: Locale, archive: FamilyArchive): FamilyArchive {
  if (locale === "en") return archive;

  const meta = archiveMeta[locale];

  return {
    ...archive,
    title: meta.title,
    subtitle: meta.subtitle,
    members: archive.members.map((member) => ({
      ...member,
      ...memberOverlays[locale][member.id],
    })),
    memories: archive.memories.map((memory) => ({
      ...memory,
      ...memoryOverlays[locale][memory.id],
    })),
    publicStories: archive.publicStories.map((story) => ({
      ...story,
      ...publicStoryOverlays[locale][story.id],
    })),
  };
}
