import { arabicVerificationGuides } from './component-verification-guide';
import { catalog, type ComponentId } from './data';
import type { ComponentGuide, GuideInput } from './component-guide-types';
import { arabicNativeGuides } from './component-native-guides.ar';
import { arabicExpandedGuides } from './component-expanded-guides.ar';
import { arabicLayoutPlatformGuides } from './component-layout-guides.ar';
import { arabicMobileGuides } from './component-mobile-guides';
import { arabicSupportGuides } from './component-support-guides';

const entries: Record<string, GuideInput> = {
  ...arabicVerificationGuides,
  ...arabicNativeGuides,
  ...arabicExpandedGuides,
  ...arabicLayoutPlatformGuides,
  ...arabicMobileGuides,
  ...arabicSupportGuides,
};

/** Complete Arabic reference; technical identifiers and component behavior stay shared. */
export const arabicComponentGuides = Object.fromEntries(catalog.map(([id, , name]) => {
  const guide = entries[id];
  if (!guide) throw new Error(`Missing Arabic component guide: ${id}`);
  return [id, { ...guide, name, vanilla: guide.usage }];
})) as Record<ComponentId, ComponentGuide> & Partial<Record<string, ComponentGuide>>;

export const arabicGuideList = catalog.map(([id]) => ({ id, ...arabicComponentGuides[id] }));
