import { GuideFeature } from '../../core/feature';
import { FrameResult } from '../../examples/frame/frame-result';
import { EXAMPLE_FRAME_RESULT } from '../../examples/tokens';

/**
 * Registers the frame result of the page block: with this feature the vanilla,
 * React and Vue tabs show their own result in a sandboxed frame (editor.frame);
 * without it the native Angular result stays shown for every tab. No route.
 */
export const feature: GuideFeature = {
  id: 'frame-runtime',
  order: 90,
  routes: [],
  serverRoutes: () => [],
  providers: [{ provide: EXAMPLE_FRAME_RESULT, useValue: FrameResult }],
};
