// Type fixture for react.feedback-content.test.tsx. It is compiled, never run: every element marked
// with @ts-expect-error must be rejected by the compiler (an unused marker is itself an error),
// and every unmarked element must compile.
import { Alert, ButtonGroup, CookieConsent, Feedback, Meter, NotificationList, Progress, Timeline } from '../src/index.js';
import type { ToastMessage } from '../src/index.js';

const feedbackTexts = { yesLabel: 'Yes', noLabel: 'No', commentLabel: 'Comment', submitLabel: 'Send', successMessage: 'Thanks' };
const consentTexts = { title: 'Cookies', description: 'Choose', acceptLabel: 'Accept', rejectLabel: 'Reject' };
const listTexts = { items: [], emptyMessage: 'None', unreadLabel: 'Unread' };

export const toast: ToastMessage = { id: 'saved', title: 'Draft saved', message: 'You can return later.' };

export const accepted = <>
  <Alert>Saved</Alert>
  <Alert onDismiss={() => undefined} closeLabel="Close">Saved</Alert>
  <Progress label="Upload" size="sm" />
  <Progress aria-labelledby="upload" value={10} />
  <Meter aria-label="Storage" value={40} />
  <ButtonGroup aria-label="Actions" variant="attached" />
  <Timeline label="Steps" items={[{ id: 'a', title: 'A', status: 'current' }]} />
  <NotificationList {...listTexts} label="Notifications" onRead={id => id} getMarkReadLabel={() => 'Mark read'} onDismiss={id => id} getDismissLabel={() => 'Dismiss'} />
  <NotificationList {...listTexts} aria-label="Notifications" />
  <Feedback {...feedbackTexts} label="Was this helpful?" defaultValue={{ helpful: null, comment: '' }} onFeedback={value => value.helpful === true} />
  <Feedback {...feedbackTexts} aria-label="Was this helpful?" />
  <CookieConsent {...consentTexts} variant="banner" open onOpenChange={open => open} onConsent={choice => choice === 'accepted'} />
</>;

export const rejected = <>
  {/* @ts-expect-error closeLabel is required with onDismiss */}
  <Alert onDismiss={() => undefined}>Saved</Alert>
  {/* @ts-expect-error Progress needs label, aria-label or aria-labelledby */}
  <Progress value={10} />
  {/* @ts-expect-error Meter needs label, aria-label or aria-labelledby */}
  <Meter value={10} />
  {/* @ts-expect-error TimelineItem.status 'active' is renamed 'current' */}
  <Timeline label="Steps" items={[{ id: 'a', title: 'A', status: 'active' }]} />
  {/* @ts-expect-error onMarkRead is renamed onRead */}
  <NotificationList {...listTexts} label="Notifications" onMarkRead={(id: string) => id} getMarkReadLabel={() => 'Mark read'} />
  {/* @ts-expect-error getDismissLabel is required with onDismiss */}
  <NotificationList {...listTexts} label="Notifications" onDismiss={id => id} />
  {/* @ts-expect-error FeedbackValue.helpful is boolean | null */}
  <Feedback {...feedbackTexts} label="Was this helpful?" defaultValue={{ helpful: 'yes', comment: '' }} />
  {/* @ts-expect-error value / onValueChange are replaced by open / onConsent */}
  <CookieConsent {...consentTexts} onValueChange={(choice: string) => choice} />
  {/* @ts-expect-error value is replaced by open */}
  <CookieConsent {...consentTexts} value="accepted" />
</>;

// @ts-expect-error ToastMessage.description is renamed message
export const oldToast: ToastMessage = { id: 'saved', description: 'Saved' };
