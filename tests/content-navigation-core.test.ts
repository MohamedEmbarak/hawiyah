import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {observeContentNavigation,type ContentNavigationItem} from '../packages/core/src/content-navigation';
const cleanups:Array<()=>void>=[];
let viewportY=0;
const rootObservers:Array<{observe:ReturnType<typeof vi.fn>;unobserve:ReturnType<typeof vi.fn>;disconnect:ReturnType<typeof vi.fn>;callback:()=>void}>=[];
function number(element:object,key:string,value:number|(()=>number)){Object.defineProperty(element,key,{configurable:true,get:typeof value==='function'?value:()=>value});}
function rect(element:HTMLElement,top:()=>number,height=300){element.getBoundingClientRect=()=>({top:top(),bottom:top()+height,left:0,right:300,x:0,y:top(),height,width:300,toJSON(){}});}
beforeEach(()=>{vi.useFakeTimers();viewportY=0;vi.stubGlobal('ResizeObserver',class {observe=vi.fn();unobserve=vi.fn();disconnect=vi.fn();constructor(public callback:()=>void){rootObservers.push(this);}});vi.stubGlobal('matchMedia',vi.fn(()=>({matches:false})));vi.spyOn(window,'scrollTo').mockImplementation(()=>{});number(window,'scrollY',()=>viewportY);number(window,'innerHeight',600);number(document.documentElement,'scrollHeight',2000);number(document.body,'scrollHeight',2000);});
afterEach(()=>{for(const cleanup of cleanups.splice(0))cleanup();document.body.replaceChildren();rootObservers.splice(0);vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers();});
const frame=async()=>{await vi.advanceTimersByTimeAsync(20);};
function setup(){
 document.body.innerHTML='<nav><a href="#first" data-hw-section="first">First</a><a href="#nested" data-hw-section="nested">Nested</a><a href="#last" data-hw-section="last">Last</a></nav><section id="first">First</section><section id="nested">Nested</section><section id="last">Last</section><button id="outside">Outside</button>';
 const navigation=document.querySelector<HTMLElement>('nav')!,first=document.getElementById('first')!,nested=document.getElementById('nested')!,last=document.getElementById('last')!;
 rect(navigation,()=>0,100);rect(first,()=>200-viewportY,900);rect(nested,()=>600-viewportY,250);rect(last,()=>1800-viewportY,100);
 let items:readonly ContentNavigationItem[]=[{id:'first',label:'First',children:[{id:'nested',label:'Nested'}]},{id:'last',label:'Last'}],scrollRoot:HTMLElement|null=null;
 const onCurrentChange=vi.fn();
 const observer=observeContentNavigation({navigation,getItems:()=>items,getScrollRoot:()=>scrollRoot,offset:()=>80,onCurrentChange});cleanups.push(observer.destroy);
 return {navigation,first,nested,last,observer,onCurrentChange,setItems(value:readonly ContentNavigationItem[]){items=value;observer.refresh();},setRoot(root:HTMLElement|null){scrollRoot=root;observer.refresh();}};
}
it('follows nested targets deterministically across tall sections and gaps without page scroll or focus',async()=>{
 const {observer,onCurrentChange}=setup();await frame();expect(onCurrentChange).toHaveBeenLastCalledWith('first');
 viewportY=450;window.dispatchEvent(new Event('scroll'));await frame();expect(onCurrentChange).toHaveBeenCalledTimes(1);
 viewportY=520;window.dispatchEvent(new Event('scroll'));await frame();expect(onCurrentChange).toHaveBeenLastCalledWith('nested');
 viewportY=1000;window.dispatchEvent(new Event('scroll'));await frame();expect(onCurrentChange).toHaveBeenCalledTimes(2);
 observer.refresh();await frame();expect(onCurrentChange).toHaveBeenCalledTimes(2);expect(window.scrollTo).not.toHaveBeenCalled();expect(document.activeElement).toBe(document.body);
 viewportY=1400;window.dispatchEvent(new Event('scroll'));await frame();expect(onCurrentChange).toHaveBeenLastCalledWith('last');
});
it('does not choose the last item merely because the document fits the viewport',async()=>{
 const {onCurrentChange}=setup();number(document.documentElement,'scrollHeight',600);number(document.body,'scrollHeight',600);await frame();expect(onCurrentChange).toHaveBeenLastCalledWith('first');
});
it('navigates with offset and reduced motion without hashes, focusing only when requested',async()=>{
 const {observer,last,onCurrentChange}=setup(),hash=location.hash;await frame();const link=document.querySelector<HTMLAnchorElement>('nav a')!;link.focus();
 expect(observer.navigate('last')).toBe(true);expect(window.scrollTo).toHaveBeenLastCalledWith({top:1720,behavior:'smooth'});expect(document.activeElement).toBe(link);expect(onCurrentChange).toHaveBeenLastCalledWith('last');expect(location.hash).toBe(hash);
 vi.mocked(window.matchMedia).mockReturnValue({matches:true} as MediaQueryList);expect(observer.navigate('last',{focus:true})).toBe(true);expect(window.scrollTo).toHaveBeenLastCalledWith({top:1720,behavior:'instant'});expect(document.activeElement).toBe(last);expect(last.getAttribute('tabindex')).toBe('-1');link.focus();expect(last.hasAttribute('tabindex')).toBe(false);
});
it('preserves authored focus attributes and restores temporary focus targets on destroy',async()=>{
 const {observer,first,last}=setup();first.setAttribute('tabindex','0');await frame();observer.navigate('first',{focus:true});expect(first.getAttribute('tabindex')).toBe('0');observer.navigate('last',{focus:true});expect(last.getAttribute('tabindex')).toBe('-1');observer.destroy();expect(first.getAttribute('tabindex')).toBe('0');expect(last.hasAttribute('tabindex')).toBe(false);expect(observer.navigate('first')).toBe(false);
});
it('skips missing, hidden, disabled and duplicate IDs while retaining enabled nested children',async()=>{
 const {observer,onCurrentChange,setItems,nested}=setup();nested.hidden=true;setItems([{id:'missing',label:'Missing'},{id:'first',label:'Disabled',disabled:true,children:[{id:'nested',label:'Hidden child'}]},{id:'first',label:'Duplicate enabled'},{id:'last',label:'Last'}]);await frame();expect(onCurrentChange).toHaveBeenLastCalledWith('last');expect(observer.navigate('missing')).toBe(false);expect(observer.navigate('first')).toBe(false);expect(observer.navigate('nested')).toBe(false);
 nested.hidden=false;await frame();expect(onCurrentChange).toHaveBeenLastCalledWith('nested');expect(observer.navigate('nested')).toBe(true);
 nested.setAttribute('inert','');await frame();expect(observer.navigate('nested')).toBe(false);nested.removeAttribute('inert');
 const wrapper=document.createElement('div');nested.before(wrapper);wrapper.append(nested);wrapper.style.display='none';await frame();expect(observer.navigate('nested')).toBe(false);wrapper.style.display='';await frame();expect(observer.navigate('nested')).toBe(true);
});
it('tracks section insertion, ID changes and removal and does not reset resize observation every frame',async()=>{
 const {observer,onCurrentChange,setItems}=setup();setItems([{id:'later',label:'Later'}]);await frame();expect(onCurrentChange).toHaveBeenLastCalledWith('');
 const section=document.createElement('section');section.id='later';rect(section,()=>20);document.body.append(section);await frame();expect(onCurrentChange).toHaveBeenLastCalledWith('later');
 const resize=rootObservers[0]!,calls=resize.observe.mock.calls.length;observer.refresh();await frame();observer.refresh();await frame();expect(resize.observe).toHaveBeenCalledTimes(calls);
 section.id='renamed';await frame();expect(onCurrentChange).toHaveBeenLastCalledWith('');expect(resize.unobserve).toHaveBeenCalledWith(section);
 section.remove();await frame();observer.destroy();expect(resize.disconnect).toHaveBeenCalledTimes(1);
});
it('ignores closed details content despite measurable boxes and refreshes when open changes',async()=>{
 const {first,nested,observer,onCurrentChange,setItems}=setup();
 const details=document.createElement('details');details.innerHTML='<summary>Additional information</summary>';nested.before(details);details.append(nested);
 rect(nested,()=>50);setItems([{id:'first',label:'First'},{id:'nested',label:'Collapsed section'}]);await frame();
 expect(getComputedStyle(nested).display).not.toBe('none');expect(getComputedStyle(nested).visibility).toBe('visible');expect(nested.getBoundingClientRect().height).toBeGreaterThan(0);
 expect(onCurrentChange).toHaveBeenLastCalledWith('first');expect(observer.navigate('nested',{focus:true})).toBe(false);expect(window.scrollTo).not.toHaveBeenCalled();expect(nested.hasAttribute('tabindex')).toBe(false);
 // No refresh(), scroll or resize call: observing the native open attribute is required.
 details.open=true;await frame();expect(onCurrentChange).toHaveBeenLastCalledWith('nested');expect(observer.navigate('nested')).toBe(true);
 details.open=false;await frame();expect(onCurrentChange).toHaveBeenLastCalledWith('first');expect(observer.navigate('nested')).toBe(false);expect(first.isConnected).toBe(true);
});
it('allows the first direct summary and its descendants but excludes a later summary while closed',async()=>{
 const {first,nested,observer,setItems}=setup();
 const details=document.createElement('details'),summary=document.createElement('summary'),second=document.createElement('summary');
 summary.id='summary';summary.textContent='Visible summary';second.id='second-summary';second.textContent='Hidden later summary';
 first.before(details);summary.append(nested);details.append(summary,first,second);
 setItems([{id:'summary',label:'Summary'},{id:'nested',label:'Within summary'},{id:'first',label:'Body'},{id:'second-summary',label:'Later summary'}]);await frame();
 expect(observer.navigate('summary')).toBe(true);expect(observer.navigate('nested')).toBe(true);expect(observer.navigate('first')).toBe(false);expect(observer.navigate('second-summary')).toBe(false);
 details.open=true;await frame();expect(observer.navigate('first')).toBe(true);expect(observer.navigate('second-summary')).toBe(true);
});
it('applies each closed ancestor independently for nested details',async()=>{
 const {first,nested,last,observer,setItems}=setup();
 const outer=document.createElement('details'),outerSummary=document.createElement('summary'),inner=document.createElement('details'),innerSummary=document.createElement('summary');
 first.before(outer);outerSummary.append(first);innerSummary.append(nested);inner.append(innerSummary,last);outer.append(outerSummary,inner);
 setItems([{id:'first',label:'Outer summary'},{id:'nested',label:'Inner summary'},{id:'last',label:'Inner body'}]);await frame();
 expect(observer.navigate('first')).toBe(true);expect(observer.navigate('nested')).toBe(false);expect(observer.navigate('last')).toBe(false);
 inner.open=true;await frame();expect(observer.navigate('nested')).toBe(false);expect(observer.navigate('last')).toBe(false);
 outer.open=true;await frame();expect(observer.navigate('nested')).toBe(true);expect(observer.navigate('last')).toBe(true);
 inner.open=false;await frame();expect(observer.navigate('nested')).toBe(true);expect(observer.navigate('last')).toBe(false);
});
it('scrolls only a configured container, rebinding it after refresh and ignoring outside targets',async()=>{
 const {navigation,first,nested,last,observer,onCurrentChange,setRoot}=setup();const root=document.createElement('div');document.body.append(root);root.append(first,nested);rect(root,()=>50,300);number(root,'clientHeight',300);number(root,'clientTop',2);number(root,'scrollHeight',1000);root.scrollTop=0;root.scrollTo=vi.fn();rect(first,()=>72-root.scrollTop);rect(nested,()=>652-root.scrollTop);setRoot(root);await frame();expect(onCurrentChange).toHaveBeenLastCalledWith('first');expect(observer.navigate('last')).toBe(false);
 observer.navigate('nested');expect(root.scrollTo).toHaveBeenLastCalledWith({top:520,behavior:'smooth'});expect(window.scrollTo).not.toHaveBeenCalled();
 root.scrollTop=550;root.dispatchEvent(new Event('scroll'));await frame();expect(onCurrentChange).toHaveBeenLastCalledWith('nested');
 const oldRemove=vi.spyOn(root,'removeEventListener'),other=document.createElement('div');document.body.append(other);other.append(last);rect(other,()=>0,300);number(other,'clientHeight',300);number(other,'scrollHeight',1000);other.scrollTo=vi.fn();rect(last,()=>100);setRoot(other);await frame();expect(oldRemove).toHaveBeenCalledWith('scroll',expect.any(Function));expect(onCurrentChange).toHaveBeenLastCalledWith('last');expect(observer.navigate('first')).toBe(false);expect(observer.navigate('last')).toBe(true);expect(other.scrollTo).toHaveBeenCalled();expect(navigation.isConnected).toBe(true);
});
it('keeps the current link visible by scrolling only an overflowing navigation region',async()=>{
 const {navigation,observer}=setup(),link=navigation.querySelector<HTMLElement>('[data-hw-section="first"]')!;navigation.scrollTo=vi.fn();number(navigation,'clientHeight',100);number(navigation,'scrollHeight',100);rect(link,()=>250,40);await frame();expect(navigation.scrollTo).not.toHaveBeenCalled();
 number(navigation,'scrollHeight',500);observer.refresh();await frame();expect(navigation.scrollTo).toHaveBeenLastCalledWith({top:220,behavior:'instant'});expect(window.scrollTo).not.toHaveBeenCalled();
 rect(link,()=>20,40);vi.mocked(navigation.scrollTo).mockClear();observer.refresh();await frame();expect(navigation.scrollTo).not.toHaveBeenCalled();
});
it('requests instant scrolling for reduced motion even when the consumer declares smooth scrolling',async()=>{
 const {first,nested,observer,setRoot}=setup(),root=document.createElement('div');document.body.append(root);root.append(first,nested);
 root.style.scrollBehavior='smooth';root.scrollTo=vi.fn();rect(root,()=>0,300);number(root,'clientHeight',300);number(root,'scrollHeight',1000);rect(nested,()=>600);
 setRoot(root);await frame();vi.mocked(window.matchMedia).mockReturnValue({matches:true} as MediaQueryList);
 expect(observer.navigate('nested')).toBe(true);expect(root.style.scrollBehavior).toBe('smooth');expect(root.scrollTo).toHaveBeenLastCalledWith({top:520,behavior:'instant'});
});
it('cancels pending work and listeners on destroy',async()=>{
 const {observer,onCurrentChange}=setup();observer.destroy();await frame();expect(onCurrentChange).not.toHaveBeenCalled();window.dispatchEvent(new Event('scroll'));observer.refresh();await frame();expect(onCurrentChange).not.toHaveBeenCalled();expect(rootObservers[0]!.disconnect).toHaveBeenCalledTimes(1);
});
