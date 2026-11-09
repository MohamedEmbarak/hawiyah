import '@angular/compiler';
import {TestBed} from '@angular/core/testing';
import {BrowserTestingModule, platformBrowserTesting} from '@angular/platform-browser/testing';
import {HwAvatarComponent} from '../packages/angular/dist/fesm2022/hawiyah-angular.mjs';
import {act, createElement as r} from 'react';
import {createRoot} from 'react-dom/client';
import {createApp, h, nextTick, reactive} from 'vue';
import {afterEach, beforeAll, expect, it, vi} from 'vitest';
import {Avatar as ReactAvatar} from '../packages/react/src/display';
import {Avatar as VueAvatar} from '../packages/vue/src/display';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const cleanup: Array<() => void | Promise<void>> = [];
beforeAll(() => TestBed.initTestEnvironment(BrowserTestingModule, platformBrowserTesting()));
afterEach(async () => {for(const fn of cleanup.splice(0))await fn();TestBed.resetTestingModule();document.body.replaceChildren();});
async function mount(adapter: string) {
  const host=document.createElement('div');document.body.append(host);
  const state={src:'first.svg',name:'نورة أحمد',initials:undefined as string|undefined,size:'64',variant:'square'};
  const onError=vi.fn();let sync:()=>Promise<void>;
  if(adapter==='react') {
    const root=createRoot(host);sync=async()=>{await act(()=>root.render(r(ReactAvatar,{...state,size:state.size as '64',variant:state.variant as 'square',imageProps:{onError}})));};cleanup.push(async()=>{await act(()=>root.unmount());});
  } else if(adapter==='vue') {
    const props=reactive({...state});const app=createApp({render:()=>h(VueAvatar,props as any)});app.mount(host);sync=async()=>{Object.assign(props,state);await nextTick();};cleanup.push(()=>app.unmount());
  } else {
    const fixture=TestBed.createComponent(HwAvatarComponent);host.append(fixture.nativeElement);sync=async()=>{for(const [key,value] of Object.entries(state))fixture.componentRef.setInput(key,value);fixture.detectChanges();};cleanup.push(()=>fixture.destroy());
  }
  await sync();return {host,state,sync,onError,error:async()=>{await act(async()=>{host.querySelector('img')!.dispatchEvent(new Event('error'));await nextTick();});await sync();}};
}
for(const adapter of ['react','vue','angular']) {
  it(`${adapter}: failed image falls back to one named representation and retries changed sources`,async()=>{
    const m=await mount(adapter);const avatar=m.host.querySelector('.hw-avatar')!;
    expect(avatar.querySelector('img')?.getAttribute('alt')).toBe('نورة أحمد');expect(avatar.hasAttribute('role')).toBe(false);
    await m.error();expect(avatar.querySelector('img')).toBeNull();expect(avatar.getAttribute('role')).toBe('img');expect(avatar.getAttribute('aria-label')).toBe('نورة أحمد');expect(avatar.textContent).toBe('نأ');expect(avatar.firstElementChild?.getAttribute('aria-hidden')).toBe('true');
    if(adapter==='react')expect(m.onError).toHaveBeenCalledTimes(1);
    m.state.src='second.svg';await m.sync();expect(avatar.querySelector('img')?.getAttribute('src')).toBe('second.svg');expect(avatar.hasAttribute('aria-label')).toBe(false);
    m.state.src='first.svg';await m.sync();expect(avatar.querySelector('img')).not.toBeNull();await m.error();expect(avatar.querySelector('img')).toBeNull();
    expect(avatar.getAttribute('data-size')).toBe('64');expect(avatar.getAttribute('data-variant')).toBe('square');
  });
  it(`${adapter}: explicit initials survive failure and changing the name preserves full accessible identity`,async()=>{
    const m=await mount(adapter);m.state.initials='هو';await m.sync();await m.error();
    const avatar=m.host.querySelector('.hw-avatar')!;expect(avatar.textContent).toBe('هو');
    m.state.name='فريق هوية';await m.sync();expect(avatar.getAttribute('aria-label')).toBe('فريق هوية');expect(avatar.textContent).toBe('هو');
    m.state.src='';m.state.initials=undefined;m.state.name='🟢 فريق';await m.sync();expect(avatar.textContent).toBe('🟢ف');
  });
}
