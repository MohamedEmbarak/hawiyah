// FILEDROPZONE-12: a real file drag over a disabled vanilla zone delivers
// dragover and drop to the zone and the page does not navigate.
import { enhance } from '@hawiyah/vanilla';
import { html, type FixtureCase } from '../host';
import { vanillaDropzone } from './FILEDROPZONE-08';

const fixture: FixtureCase = {
  vanilla(root, { t }) {
    html(root, vanillaDropzone('vanilla-disabled-documents', t, true));
    return enhance(root);
  },
};

export default fixture;
