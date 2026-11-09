import { version } from '../package.json';

/** Nasaq release shown in the guide; kept in step with the library manifests. */
export const nasaqVersion: string = version;
/** Major.minor label for compact badges, e.g. "0.2". */
export const nasaqMinor: string = version.split('.').slice(0, 2).join('.');
