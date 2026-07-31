export type InsightSeverity =
  | "positive"
  | "warning"
  | "info";

export interface LearningInsight {
  id: string;
  severity: InsightSeverity;
  title: string;
  description: string;
}

export interface LearningRecommendation {
  id: string;
  priority: number;
  title: string;
  description: string;
  actionPath?: string;
}

export interface LearningAchievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface LearningInsightsResult {
  insights: LearningInsight[];
  recommendations: LearningRecommendation[];
  achievements: LearningAchievement[];
}