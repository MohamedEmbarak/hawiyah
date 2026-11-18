import { describe, expect, it } from 'vitest';
import { routerUrl } from './link-navigation';

describe('routerUrl', () => {
  it('drops the trailing slash of a page path and keeps query and fragment', () => {
    expect(routerUrl('/en/components/')).toBe('/en/components');
    expect(routerUrl('/en/components/?x=1#usage')).toBe('/en/components?x=1#usage');
    expect(routerUrl('/')).toBe('/');
  });
});
