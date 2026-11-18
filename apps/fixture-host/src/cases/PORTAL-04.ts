// PORTAL-04: at 390px with the menu open, one press (a mouse click held 120 ms,
// or a touchscreen tap) on the second branch heading opens it and closes the
// first, in ar and en.
import { Component } from '@angular/core';
import { HwPortalHeaderComponent } from '@hawiyah/angular';
import { PortalHeader } from '@hawiyah/react';
import { enhance } from '@hawiyah/vanilla';
import { PortalHeader as VuePortalHeader } from '@hawiyah/vue';
import { h as vh } from 'vue';
import { h, html, mountAngular, mountReact, mountVue, type FixtureCase } from '../host';
import { branchLinks, headerTexts, vanillaList } from '../shared/portal';

const fixture: FixtureCase = {
  vanilla(root, { t }) {
    const text = headerTexts(t);
    html(
      root,
      `<header class="hw-portal-header" data-hw="portal-header"><a class="hw-portal-brand" href="#home">${text.brand}</a><button class="hw-button hw-portal-menu-toggle" type="button" data-hw-portal-toggle>${text.menuLabel}</button><nav aria-label="${text.navigationLabel}" data-hw-portal-navigation><ul>${vanillaList(branchLinks(t))}</ul></nav></header>`,
    );
    return enhance(root);
  },
  react(root, { t }) {
    return mountReact(root, h(PortalHeader, { ...headerTexts(t), homeHref: '#home', links: branchLinks(t) }));
  },
  vue(root, { t }) {
    return mountVue(root, { render: () => vh(VuePortalHeader, { ...headerTexts(t), homeHref: '#home', links: branchLinks(t) }) });
  },
  angular(root, { t }) {
    @Component({
      selector: 'fixture-portal-header',
      standalone: true,
      imports: [HwPortalHeaderComponent],
      template: `<hw-portal-header [brand]="text.brand" homeHref="#home" [links]="links" [navigationLabel]="text.navigationLabel" [menuLabel]="text.menuLabel" />`,
    })
    class FixturePortalHeader {
      text = headerTexts(t);
      links = branchLinks(t);
    }
    return mountAngular(root, FixturePortalHeader);
  },
};

export default fixture;
