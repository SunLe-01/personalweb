export const sectionIds = ["home", "about", "projects", "contact"] as const;

export type SectionId = (typeof sectionIds)[number];

export function isSectionId(value: string | null | undefined): value is SectionId {
  return Boolean(value && sectionIds.includes(value as SectionId));
}
