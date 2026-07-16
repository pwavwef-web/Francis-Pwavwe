// ============================================================================
//  Domain types — the single source of truth for every piece of content on the
//  site. Rendering modules consume these; nothing is hand-authored in markup.
// ============================================================================

export type ProjectCategory =
  | 'Education'
  | 'Tourism'
  | 'Technology'
  | 'Leadership'
  | 'Research'
  | 'Community';

export interface Project {
  readonly title: string;
  readonly category: string;
  readonly tags: readonly ProjectCategory[];
  readonly icon: string; // emoji or image path
  readonly iconIsImage?: boolean;
  readonly coverImage?: string;
  readonly description: string;
  readonly impact?: string;
  readonly status?: string;
  readonly year?: string;
  readonly link?: { readonly label: string; readonly href: string };
  readonly liveBadges?: readonly { readonly label: string; readonly src: string }[];
  readonly meta?: string;
  readonly featured?: boolean;
}

export interface Skill {
  readonly icon: string;
  readonly name: string;
  readonly description: string;
}

export interface ExperienceItem {
  readonly title: string;
  readonly company: string;
  readonly date: string;
  readonly description: string;
  readonly kind: 'work' | 'leadership' | 'education' | 'simulation';
}

export interface Certificate {
  readonly title: string;
  readonly issuer: string;
  readonly date: string;
  readonly href: string;
  readonly image?: string;
  readonly variant?: 'portrait';
}

export interface Stat {
  readonly value: number;
  readonly suffix: string;
  readonly label: string;
}

export interface SocialLink {
  readonly label: string;
  readonly href: string;
  readonly icon: string;
}

export interface NavItem {
  readonly id: string;
  readonly label: string;
}

// Firestore blog document shape (as stored by the admin tools).
export interface BlogDoc {
  id: string;
  title?: string;
  content?: string;
  url?: string;
  likes?: number;
  comments?: number;
  blogComments?: BlogComment[];
  timestamp?: { toDate(): Date } | null;
}

export interface BlogComment {
  text: string;
  timestamp: string;
  sessionId: string;
}

export interface BlogInteraction {
  liked: boolean;
  comments: unknown[];
}
