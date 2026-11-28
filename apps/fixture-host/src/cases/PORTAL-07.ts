// PORTAL-07: the React header at 390px hides nav[data-open=false] and puts the
// open navigation on its own row; at 1280px it shows the links in one row. The
// authored vanilla markup with .hw-portal-header-main still lays out the same way.
import { PortalHeader } from '@hawiyah/react';
import { enhance } from '@hawiyah/vanilla';
import { h, html, mountReact, type FixtureCase } from '../host';
import { flatLinks, headerTexts, vanillaList } from '../shared/portal';

const fixture: FixtureCase = {
  vanilla(root, { t }) {
    const text = headerTexts(t);
    html(
      root,
      `<header class="hw-portal-header" data-hw="portal-header"><div class="hw-portal-header-main"><a class="hw-portal-brand" href="#home">${text.brand}</a><button class="hw-button hw-portal-menu-toggle" type="button" data-hw-portal-toggle>${text.menuLabel}</button><nav aria-label="${text.navigationLabel}" data-hw-portal-navigation><ul>${vanillaList(flatLinks(t))}</ul></nav></div></header>`,
    );
    return enhance(root);
  },
  react(root, { t }) {
    return mountReact(root, h(PortalHeader, { ...headerTexts(t), homeHref: '#home', links: flatLinks(t) }));
  },
};

export default fixture;
