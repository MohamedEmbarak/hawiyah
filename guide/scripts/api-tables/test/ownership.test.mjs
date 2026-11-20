// Every component, directive and controller factory of the four installed
// adapters is documented by exactly one page, or is an entry of the lead's list
// UNOWNED_EXPORTS (lead decision L3 of milestone 5, stage 5a).
import { describe, expect, it } from 'vitest';
import { checkOwnership } from '../ownership.mjs';
import { UNOWNED_EXPORTS } from '../targets.mjs';
import { components, declarationContext } from './helpers.mjs';

const ids = () => [...components().keys()];

describe('the exports of the installed adapters', () => {
  it('are each documented by exactly one page or listed in UNOWNED_EXPORTS', () => {
    const result = checkOwnership(declarationContext(), ids(), UNOWNED_EXPORTS);
    expect(result.problems).toEqual([]);
    // What the check counts: controller factories without enhance(), components of React and Vue, Angular classes with a selector.
    expect(result.exports.vanilla).toContain('createSkipLink');
    expect(result.exports.vanilla).not.toContain('enhance');
    expect(result.exports.react).toContain('RatingDisplay');
    expect(result.exports.react).not.toContain('ButtonProps');
    expect(result.exports.vue).toContain('FileUploadList');
    expect(result.exports.vue).not.toContain('TabItem');
    expect(result.exports.angular).toContain('HwTooltipTriggerDirective');
    expect(result.exports.angular).not.toContain('HwNamedRoot');
  });
});

describe('the ownership check fails', () => {
  it('on an export no page documents', () => {
    const result = checkOwnership(declarationContext(), ids().filter((id) => id !== 'rating'), UNOWNED_EXPORTS);
    expect(result.problems).toContain('@hawiyah/react RatingDisplay is documented by no page: name it in targets.mjs (TARGET_OVERRIDES) or propose an UNOWNED_EXPORTS entry to the lead');
    expect(result.problems).toContain('@hawiyah/angular HwRatingDisplayComponent is documented by no page: name it in targets.mjs (TARGET_OVERRIDES) or propose an UNOWNED_EXPORTS entry to the lead');
  });
  it('on an export two pages document', () => {
    const result = checkOwnership(declarationContext(), [...ids(), 'rating'], UNOWNED_EXPORTS);
    expect(result.problems).toContain('@hawiyah/vue RatingDisplay is a target of 2 pages (rating, rating); one page documents it');
  });
  it('on an UNOWNED_EXPORTS entry that a page documents, that is no component, or that lacks approvedBy or a reason', () => {
    const result = checkOwnership(declarationContext(), ids(), [
      { framework: 'vue', name: 'Tabs', approvedBy: 'lead', reason: 'r' },
      { framework: 'react', name: 'TabItem', approvedBy: 'lead', reason: 'r' },
    ]);
    expect(result.problems).toEqual([
      'UNOWNED_EXPORTS lists @hawiyah/vue Tabs, which the page tabs documents',
      'UNOWNED_EXPORTS lists @hawiyah/react TabItem, which is not a component, directive or controller factory of the installed package',
    ]);
    const unowned = checkOwnership(declarationContext(), ids().filter((id) => id !== 'app-shell'), [{ framework: 'vanilla', name: 'createSkipLink', reason: 'r' }]);
    expect(unowned.problems.filter((problem) => problem.includes('createSkipLink'))).toEqual(['UNOWNED_EXPORTS entry vanilla createSkipLink needs approvedBy and a reason']);
  });
});
