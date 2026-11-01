import { catalog, type ComponentId } from './data';
import type { ComponentGuide, GuideInput } from './component-guide-types';
import { nativeGuides } from './component-native-guides';
import { expandedGuides } from './component-expanded-guides';
import { layoutPlatformGuides } from './component-layout-guides';
import { mobileGuides } from './component-mobile-guides';

export type { ComponentGuide, GuideInput } from './component-guide-types';

const entries: Record<string, GuideInput> = {
  ...nativeGuides,
  ...expandedGuides,
  ...layoutPlatformGuides,
  ...mobileGuides,
};

/** Every public catalog entry has a source-backed guide and a live recipe. */
export const componentGuides = Object.fromEntries(catalog.map(([id, name]) => {
  const guide = entries[id];
  if (!guide) throw new Error(`Missing component guide: ${id}`);
  return [id, { ...guide, name, vanilla: guide.usage }];
})) as Record<ComponentId, ComponentGuide> & Partial<Record<string, ComponentGuide>>;

export const guideList = catalog.map(([id]) => ({ id, ...componentGuides[id] }));
