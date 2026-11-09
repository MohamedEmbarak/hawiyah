import { version } from '../package.json';

/** Hawiyah release shown in the guide; kept in step with the library manifests. */
export const hawiyahVersion: string = version;
/** Major.minor label for compact badges, e.g. "0.2". */
export const hawiyahMinor: string = version.split('.').slice(0, 2).join('.');
