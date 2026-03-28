export interface Fandom {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  banner?: string;
  memberCount: number;
  onlineCount: number;
  tags: string[];
}

export interface Post {
  id: string;
  fandomId: string;
  fandomName: string;
  fandomIcon: string;
  author: string;
  authorAvatar: string;
  title: string;
  content: string;
  imageUrl?: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  tags: string[];
  createdAt: string;
  isUpvoted?: boolean;
  isDownvoted?: boolean;
}

export const fandoms: Fandom[] = [
  {
    id: "1",
    name: "JJK Fans",
    slug: "jjk-fans",
    description: "The ultimate community for Jujutsu Kaisen fans. Discuss cursed techniques, theories, and share your best fan art!",
    icon: "⚡",
    memberCount: 245000,
    onlineCount: 3420,
    tags: ["anime", "manga", "shonen"],
  },
  {
    id: "2",
    name: "Attack on Titan Theories",
    slug: "aot-theories",
    description: "Dive deep into the world of AoT. Unravel the mysteries of the walls, titans, and Eren's true plan.",
    icon: "🗡️",
    memberCount: 189000,
    onlineCount: 2100,
    tags: ["anime", "theories", "manga"],
  },
  {
    id: "3",
    name: "Marvel Multiverse",
    slug: "marvel-multiverse",
    description: "Everything Marvel — from the MCU to comics. Secret Wars, What If, and beyond.",
    icon: "🦸",
    memberCount: 520000,
    onlineCount: 8900,
    tags: ["movies", "comics", "superhero"],
  },
  {
    id: "4",
    name: "One Piece Grand Fleet",
    slug: "one-piece",
    description: "Set sail with the Straw Hats! Theories, chapter discussions, and nakama vibes.",
    icon: "🏴‍☠️",
    memberCount: 680000,
    onlineCount: 12000,
    tags: ["anime", "manga", "adventure"],
  },
  {
    id: "5",
    name: "Demon Slayer Corps",
    slug: "demon-slayer",
    description: "Breathing techniques, epic battles, and the beauty of Ufotable animation.",
    icon: "🔥",
    memberCount: 310000,
    onlineCount: 4500,
    tags: ["anime", "action"],
  },
  {
    id: "6",
    name: "Studio Ghibli Magic",
    slug: "studio-ghibli",
    description: "Celebrate the timeless magic of Miyazaki and Studio Ghibli films.",
    icon: "🌿",
    memberCount: 156000,
    onlineCount: 1800,
    tags: ["anime", "movies", "art"],
  },
];

export const posts: Post[] = [
  {
    id: "1",
    fandomId: "1",
    fandomName: "JJK Fans",
    fandomIcon: "⚡",
    author: "CursedEnergy99",
    authorAvatar: "CE",
    title: "Sukuna's Domain Expansion is the most terrifying ability in all of anime",
    content: "Think about it — Malevolent Shrine doesn't even need a barrier. It's an open domain that just slashes everything within 200 meters. The guaranteed hit combined with Cleave and Dismantle makes it virtually unstoppable. What other abilities come close?",
    upvotes: 2847,
    downvotes: 123,
    commentCount: 342,
    tags: ["discussion", "theory"],
    createdAt: "2h ago",
  },
  {
    id: "2",
    fandomId: "3",
    fandomName: "Marvel Multiverse",
    fandomIcon: "🦸",
    author: "StarkIndustries",
    authorAvatar: "SI",
    title: "Secret Wars casting leaked? Here's what we know so far",
    content: "Multiple sources are confirming some incredible casting choices for the upcoming Secret Wars film. The multiverse saga is about to reach its peak and I cannot contain my excitement.",
    upvotes: 5621,
    downvotes: 89,
    commentCount: 891,
    tags: ["news", "discussion"],
    createdAt: "4h ago",
  },
  {
    id: "3",
    fandomId: "4",
    fandomName: "One Piece Grand Fleet",
    fandomIcon: "🏴‍☠️",
    author: "GearFifth",
    authorAvatar: "G5",
    title: "Oda foreshadowed the final island 400 chapters ago and nobody noticed",
    content: "I was re-reading the Skypiea arc and found this incredible panel that basically tells us exactly what Laugh Tale is. Oda is the GOAT of long-form storytelling. Here's my breakdown...",
    upvotes: 8934,
    downvotes: 201,
    commentCount: 1203,
    tags: ["theory", "discussion"],
    createdAt: "6h ago",
  },
  {
    id: "4",
    fandomId: "2",
    fandomName: "Attack on Titan Theories",
    fandomIcon: "🗡️",
    author: "FreedomSeeker",
    authorAvatar: "FS",
    title: "The ending was perfect and here's why (unpopular opinion)",
    content: "I know the ending is divisive, but after re-reading it multiple times, I believe Isayama crafted a thematically consistent conclusion. Here's my deep-dive analysis on why the cycle of hatred theme was perfectly executed.",
    upvotes: 1456,
    downvotes: 892,
    commentCount: 2341,
    tags: ["discussion", "hot-take"],
    createdAt: "8h ago",
  },
  {
    id: "5",
    fandomId: "5",
    fandomName: "Demon Slayer Corps",
    fandomIcon: "🔥",
    author: "SunBreather",
    authorAvatar: "SB",
    title: "Ufotable's animation in the Infinity Castle arc will break the internet",
    content: "With the movie trilogy announced, can we talk about how Ufotable is about to deliver the most visually stunning anime content ever produced? The Infinity Castle fights are already incredible in manga form.",
    upvotes: 4521,
    downvotes: 67,
    commentCount: 567,
    tags: ["hype", "discussion"],
    createdAt: "12h ago",
  },
];

export const trendingFandoms = fandoms.slice(0, 4);

export function formatMemberCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}
