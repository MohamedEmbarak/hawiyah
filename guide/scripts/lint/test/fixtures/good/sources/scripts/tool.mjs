import { readFileSync } from 'node:fs';

export const docs = '../docs/components';
export const read = (file) => readFileSync(file, 'utf8');
