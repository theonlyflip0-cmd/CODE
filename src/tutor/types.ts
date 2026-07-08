import type { ComponentType, ReactNode } from "react";

export interface GradeResult {
  passed: boolean;
  praise: string;
  gaps: string[];
  reteach: string;
  followUp: string;
  /** true when produced by the offline keyword grader, not Claude */
  offline?: boolean;
}

export interface Attempt {
  student: string;
  result: GradeResult;
}

export interface KeyIdea {
  idea: string;
  /** regexes that count as the student expressing this idea (offline grader) */
  patterns: RegExp[];
  /** one-sentence reteach used by the offline grader when the idea is missing */
  hint: string;
}

export interface Concept {
  id: string;
  title: string;
  shortTitle: string;
  tagline: string;
  explanation: ReactNode;
  /** what a passing explanation must contain — shown to the AI teacher as the rubric */
  rubric: string;
  /** common misconceptions the AI teacher should actively check for */
  misconceptions: string;
  keyIdeas: KeyIdea[];
  recallPrompt: string;
  offlineFollowUp: string;
  Visual: ComponentType;
}
