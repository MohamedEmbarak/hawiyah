import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {createContentNavigation} from '../packages/vanilla/src/content-navigation';
import {enhance} from '../packages/vanilla/src/index';
const cleanups:Array<()=>void>=[];
const frame=async()=>{await vi.advanceTimersByTimeAsync(20);};
function number(element:object,key:string,value:number){Object.defineProperty(element,key,{configurable:true,get:()=>value});}
function rect(element:HTMLElement,top:()=>number,height=200){element.getBoundingClientRect=()=>({top:top(),bottom:top()+height,left:0,right:300,x:0,y:top(),height,width:300,toJSON(){}});}
beforeEach(()=>{vi.useFakeTimers();vi.stubGlobal('ResizeObserver',class{observe(){}unobserve(){}disconnect(){}});vi.stubGlobal('matchMedia',vi.fn(()=>({matches:false})));vi.spyOn(window,'scrollTo').mockImplementation(()=>{});});
afterEach(()=>{for(const cleanup of cleanups.splice(0))cleanup();document.body.replaceChildren();vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers();});
function setup(){
 document.body.innerHTML='<nav class="hw-content-nav" data-hw="content-navigation" data-hw-scroll-root="viewport" data-hw-offset="0" aria-label="Sections"><ol><li><a href="#one" aria-current="page">One</a><ol><li><a data-hw-section="two" href="#two">Two</a></li></ol></li><li><a href="#three" aria-disabled="true">Disabled</a></li></ol></nav><div id="viewport"><section id="one">One</section><section id="two">Two</section><section id="three">Three</section></div><button id="outside">Outside</button>';
 const navigation=document.querySelector<HTMLElement>('nav')!,viewport=document.getElementById('viewport')!,one=document.getElementById('one')!,two=document.getElementById('two')!,three=document.getElementById('three')!;
 number(viewport,'clientHeight',200);number(viewport,'scrollHeight',800);viewport.scrollTop=0;viewport.scrollTo=vi.fn();rect(viewport,()=>0);rect(one,()=>0-viewport.scrollTop);rect(two,()=>250-viewport.scrollTop);rect(three,()=>500-viewport.scrollTop);return{navigation,viewport,one,two,three};
}
function controller(root:HTMLElement,options:Parameters<typeof createContentNavigation>[1]={}){const result=createContentNavigation(root,options);cleanups.push(result.destroy);return result;}
const links=(nav:HTMLElement)=>[...nav.querySelectorAll<HTMLAnchorElement>('a')];
function click(link:HTMLAnchorElement,extra:MouseEventInit={}){const event=new MouseEvent('click',{bubbles:true,cancelable:true,button:0,detail:1,...extra});link.dispatchEvent(event);return event;}
it('enhances semantic nested anchors, tracks scroll, and emits only changed current IDs',async()=>{
 const {navigation,viewport}=setup(),change=vi.fn(),onCurrentChange=vi.fn();navigation.addEventListener('hw:change',change);const handle=controller(navigation,{onCurrentChange});await frame();expect(handle.current).toBe('one');expect(links(navigation)[0]!.getAttribute('aria-current')).toBe('location');expect(change.mock.calls[0]![0].detail).toEqual({current:'one'});expect(onCurrentChange).toHaveBeenCalledExactlyOnceWith('one');
 viewport.scrollTop=250;viewport.dispatchEvent(new Event('scroll'));await frame();expect(handle.current).toBe('two');expect(links(navigation)[1]!.getAttribute('aria-current')).toBe('location');expect(links(navigation)[0]!.hasAttribute('aria-current')).toBe(false);
 handle.refresh();await frame();expect(onCurrentChange).toHaveBeenCalledTimes(2);expect(viewport.scrollTo).not.toHaveBeenCalled();expect(window.scrollTo).not.toHaveBeenCalled();
});
it('intercepts ordinary activation without changing URL and focuses the section only for keyboard activation',async()=>{
 const {navigation,viewport,two}=setup();controller(navigation);await frame();const target=links(navigation)[1]!,hash=location.hash;target.focus();const pointer=click(target);expect(pointer.defaultPrevented).toBe(true);expect(viewport.scrollTo).toHaveBeenLastCalledWith({top:250,behavior:'smooth'});expect(document.activeElement).toBe(target);expect(location.hash).toBe(hash);
 const keyboard=click(target,{detail:0});expect(keyboard.defaultPrevented).toBe(true);expect(document.activeElement).toBe(two);expect(two.getAttribute('tabindex')).toBe('-1');document.querySelector<HTMLButtonElement>('#outside')!.focus();expect(two.hasAttribute('tabindex')).toBe(false);
});
it('preserves modifier and new-window links while preventing disabled activations',async()=>{
 const {navigation,viewport}=setup();const handle=controller(navigation);await frame();const target=links(navigation)[1]!;
 for(const extra of [{ctrlKey:true},{metaKey:true},{shiftKey:true},{altKey:true},{button:1}])expect(click(target,extra).defaultPrevented).toBe(false);
 target.target='_blank';expect(click(target).defaultPrevented).toBe(false);target.removeAttribute('target');target.download='';expect(click(target).defaultPrevented).toBe(false);target.removeAttribute('download');
 expect(click(links(navigation)[2]!).defaultPrevented).toBe(true);expect(handle.navigate('three')).toBe(false);expect(viewport.scrollTo).not.toHaveBeenCalled();expect(handle.current).toBe('one');
});
it('resolves encoded fragment IDs without selectors and observes changed href and disabled state',async()=>{
 const {navigation,two}=setup();two.id='two: quoted " section';const target=links(navigation)[1]!;target.removeAttribute('data-hw-section');target.href='#'+encodeURIComponent(two.id);const handle=controller(navigation);await frame();expect(click(target).defaultPrevented).toBe(true);expect(handle.current).toBe(two.id);expect(target.dataset.hwSection).toBe(two.id);
 target.setAttribute('href','#one');await frame();expect(target.dataset.hwSection).toBe('one');target.setAttribute('aria-disabled','true');await frame();expect(target.hasAttribute('aria-current')).toBe(false);expect(click(target).defaultPrevented).toBe(true);
});
it('does not process nested navigation, or scroll the host for a missing configured root',async()=>{
 const {navigation}=setup();navigation.insertAdjacentHTML('beforeend','<nav data-hw="content-navigation"><a href="#two">Nested navigation</a></nav>');const handle=controller(navigation);await frame();const nested=navigation.querySelector<HTMLAnchorElement>(':scope > nav a')!;expect(click(nested).defaultPrevented).toBe(false);expect(handle.current).toBe('one');
 navigation.dataset.hwScrollRoot='not-mounted';await frame();expect(handle.current).toBe('');expect(handle.navigate('one')).toBe(false);expect(click(links(navigation)[0]!).defaultPrevented).toBe(true);expect(window.scrollTo).not.toHaveBeenCalled();
 navigation.insertAdjacentHTML('beforeend','<a href="#missing">Missing</a><a href="https://example.test/path">External</a>');await frame();expect(click(navigation.querySelector<HTMLAnchorElement>('[href="#missing"]')!).defaultPrevented).toBe(true);expect(click(navigation.querySelector<HTMLAnchorElement>('[href="https://example.test/path"]')!).defaultPrevented).toBe(false);
});
it('restores original attributes and focus overrides and stops controller work on destroy',async()=>{
 const {navigation,two}=setup(),html=navigation.outerHTML,onCurrentChange=vi.fn();const handle=controller(navigation,{onCurrentChange});await frame();handle.navigate('two',{focus:true});expect(two.hasAttribute('tabindex')).toBe(true);handle.destroy();handle.destroy();expect(navigation.outerHTML).toBe(html);expect(two.hasAttribute('tabindex')).toBe(false);
 expect(handle.navigate('one')).toBe(false);const calls=onCurrentChange.mock.calls.length;handle.refresh();await frame();expect(onCurrentChange).toHaveBeenCalledTimes(calls);
});
it('registers with enhance and honors explicit scrollRoot/offset overrides',async()=>{
 const {navigation,viewport}=setup();const release=enhance(navigation);cleanups.push(release);await frame();expect(links(navigation)[0]!.getAttribute('aria-current')).toBe('location');release();expect(links(navigation)[0]!.getAttribute('aria-current')).toBe('page');
 const handle=controller(navigation,{scrollRoot:viewport,offset:30});await frame();handle.navigate('two');expect(viewport.scrollTo).toHaveBeenLastCalledWith({top:220,behavior:'smooth'});
});
