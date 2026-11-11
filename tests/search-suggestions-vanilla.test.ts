import {afterEach,expect,it,vi} from 'vitest';
import {createSearchField,type SearchFieldOptions} from '../packages/vanilla/src/search-field';
const cleanups:Array<()=>void>=[];
afterEach(()=>{for(const cleanup of cleanups.splice(0))cleanup();document.body.replaceChildren();});
// The application's copy as root attributes; a test that checks missing text passes copy=''.
const copy='data-hw-clear-label="مسح البحث" data-hw-results-message="{count} اقتراحات متاحة"';
function setup(options:SearchFieldOptions={},attrs='',value='',texts=copy,clearText='Clear'){
 document.body.innerHTML=`<form><fieldset><div class="hw-search-field" ${texts} ${attrs}><label for="query">Search</label><div class="hw-search-control"><input id="query" type="search" name="query" value="${value}" data-hw-search-input><button hidden data-hw-search-clear>${clearText}</button></div></div></fieldset></form><button id="outside">Outside</button>`;
 const root=document.querySelector<HTMLElement>('.hw-search-field')!,input=root.querySelector<HTMLInputElement>('input')!,clear=root.querySelector<HTMLButtonElement>('button')!,form=document.querySelector('form')!,before=root.outerHTML;
 const controller=createSearchField(root,options);cleanups.push(controller.destroy);
 return {root,input,clear,form,controller,before};
}
const type=(input:HTMLInputElement,value:string,extra:InputEventInit={})=>{input.focus();input.value=value;input.dispatchEvent(new InputEvent('input',{bubbles:true,...extra}));};
const key=(input:HTMLInputElement,name:string,extra:KeyboardEventInit={})=>{const event=new KeyboardEvent('keydown',{key:name,bubbles:true,cancelable:true,...extra});input.dispatchEvent(event);return event;};
const list=(root:HTMLElement)=>root.querySelector<HTMLElement>('[role="listbox"]')!;
const options=(root:HTMLElement)=>[...root.querySelectorAll<HTMLElement>('[role="option"]')];
const matchesMarkup=(root:HTMLElement,html:string)=>{const template=document.createElement('template');template.innerHTML=html;return root.isEqualNode(template.content.firstElementChild);};

it('exposes optional labeled combobox semantics and highlights source-safe text without HTML injection',()=>{
 const {root,input}=setup({suggestions:['😀 إِدَارَةُ البيانات','<img src=x onerror=alert(1)>'],getResultsMessage:count=>`${count} local results`});
 expect(input.getAttribute('role')).toBe('combobox');expect(input.getAttribute('aria-controls')).toBe(list(root).id);expect(input.getAttribute('autocomplete')).toBe('off');expect(list(root).hidden).toBe(true);expect(list(root).parentElement).toBe(root.querySelector('.hw-search-control'));
 type(input,'ادارة');expect(options(root)).toHaveLength(1);expect(options(root)[0]!.querySelector('strong')!.textContent).toBe('إِدَارَةُ');expect(options(root)[0]!.textContent).toBe('😀 إِدَارَةُ البيانات');expect(root.querySelector('[role="status"]')!.textContent).toBe('1 local results');
 type(input,'img');expect(root.querySelector('img')).toBeNull();expect(options(root)[0]!.textContent).toBe('<img src=x onerror=alert(1)>');
});
it('wraps keyboard selection, retains input focus and prevents submission only when choosing an active option',()=>{
 const changed=vi.fn(),searched=vi.fn(),{root,input,controller}=setup({suggestions:['Search first','Search second'],onValueChange:changed,onSearch:searched});type(input,'search');
 expect(key(input,'ArrowUp').defaultPrevented).toBe(true);expect(options(root)[1]!.getAttribute('aria-selected')).toBe('true');expect(input.getAttribute('aria-activedescendant')).toBe(options(root)[1]!.id);
 key(input,'ArrowDown');expect(options(root)[0]!.getAttribute('aria-selected')).toBe('true');key(input,'ArrowDown');const selected=key(input,'Enter');expect(selected.defaultPrevented).toBe(true);expect(controller.value).toBe('Search second');expect(document.activeElement).toBe(input);expect(list(root).hidden).toBe(true);expect(input.hasAttribute('aria-activedescendant')).toBe(false);expect(searched).not.toHaveBeenCalled();expect(changed.mock.calls.map(call=>call[0])).toEqual(['search','Search second']);
 const submit=key(input,'Enter');expect(submit.defaultPrevented).toBe(false);expect(searched).toHaveBeenCalledExactlyOnceWith('Search second');
});
it('Escape closes only the suggestions and leaves a second Escape to an outer dialog',()=>{
 const {root,input}=setup({suggestions:['Search first']});const escaped=vi.fn();root.addEventListener('keydown',escaped);type(input,'search');
 const first=key(input,'Escape');expect(first.defaultPrevented).toBe(true);expect(escaped).not.toHaveBeenCalled();expect(list(root).hidden).toBe(true);const second=key(input,'Escape');expect(second.defaultPrevented).toBe(false);expect(escaped).toHaveBeenCalledTimes(1);
});
it('selects a pointer option without moving focus or submitting, and closes on blur or outside interaction',()=>{
 const {root,input}=setup({suggestions:['Search first']});type(input,'search');const option=options(root)[0]!;const down=new MouseEvent('pointerdown',{button:0,bubbles:true,cancelable:true});option.dispatchEvent(down);expect(down.defaultPrevented).toBe(true);expect(document.activeElement).toBe(input);option.click();expect(input.value).toBe('Search first');expect(document.activeElement).toBe(input);
 type(input,'search');document.getElementById('outside')!.dispatchEvent(new MouseEvent('pointerdown',{bubbles:true}));expect(list(root).hidden).toBe(true);type(input,'search');input.blur();expect(list(root).hidden).toBe(true);
});
it('ignores composition and modifier shortcuts, then searches a trimmed nonempty value without preventing native submission',()=>{
 const searched=vi.fn(),{root,input}=setup({suggestions:['Search first'],onSearch:searched});type(input,'  search  ');input.dispatchEvent(new CompositionEvent('compositionstart',{bubbles:true}));expect(list(root).hidden).toBe(true);key(input,'Enter');expect(searched).not.toHaveBeenCalled();
 type(input,'search',{isComposing:true});expect(list(root).hidden).toBe(true);input.dispatchEvent(new CompositionEvent('compositionend',{bubbles:true}));expect(list(root).hidden).toBe(false);
 for(const extra of [{isComposing:true},{ctrlKey:true},{metaKey:true},{altKey:true},{shiftKey:true},{keyCode:229}])expect(key(input,'Enter',extra).defaultPrevented).toBe(false);expect(searched).not.toHaveBeenCalled();
 type(input,'  search  ');expect(key(input,'Enter').defaultPrevented).toBe(false);expect(searched).toHaveBeenCalledExactlyOnceWith('search');type(input,'  ');key(input,'Enter');expect(searched).toHaveBeenCalledTimes(1);
});
it('suppresses edits and popups while disabled or readonly but allows searching readonly text',async()=>{
 const searched=vi.fn(),{root,input,clear,controller}=setup({suggestions:['Search first'],onSearch:searched});type(input,'search');input.readOnly=true;await Promise.resolve();expect(list(root).hidden).toBe(true);expect(clear.hidden).toBe(true);controller.clear();expect(input.value).toBe('search');key(input,'ArrowDown');expect(list(root).hidden).toBe(true);key(input,'Enter');expect(searched).toHaveBeenCalledExactlyOnceWith('search');
 const before=new InputEvent('beforeinput',{inputType:'insertText',data:'x',bubbles:true,cancelable:true});input.dispatchEvent(before);expect(before.defaultPrevented).toBe(true);
 input.readOnly=false;const fieldset=document.querySelector('fieldset')!;fieldset.disabled=true;await Promise.resolve();key(input,'Enter');expect(searched).toHaveBeenCalledTimes(1);expect(list(root).hidden).toBe(true);controller.clear();expect(input.value).toBe('search');
 fieldset.disabled=false;clear.click();expect(input.value).toBe('');await Promise.resolve();type(input,'search');expect(list(root).hidden).toBe(false);
 input.setAttribute('aria-disabled','true');await Promise.resolve();expect(list(root).hidden).toBe(true);input.removeAttribute('aria-disabled');await Promise.resolve();expect(list(root).hidden).toBe(false);
});
it('closes on clear, silent setValue and form reset, preserving canonical input/change events',async()=>{
 const changed=vi.fn(),{root,input,clear,controller,form}=setup({suggestions:['Search first','Second search'],onValueChange:changed},'','Search first');const native=vi.fn();input.addEventListener('change',native);type(input,'second');const down=new MouseEvent('pointerdown',{button:0,bubbles:true,cancelable:true});clear.dispatchEvent(down);expect(down.defaultPrevented).toBe(true);clear.click();expect(input.value).toBe('');expect(list(root).hidden).toBe(true);expect(native).toHaveBeenCalledTimes(1);
 controller.setValue('second');expect(list(root).hidden).toBe(true);expect(changed.mock.calls.map(call=>call[0])).toEqual(['second','']);type(input,'second');form.reset();await Promise.resolve();expect(input.value).toBe('Search first');expect(list(root).hidden).toBe(true);expect(changed.mock.calls.map(call=>call[0])).toEqual(['second','']);
});
it('supports safe declarative dictionaries, option precedence and replacement dictionaries',async()=>{
 const {root,input,controller}=setup({},'data-hw-suggestions="not-json" data-hw-max-suggestions="1"');type(input,'search');expect(options(root)).toHaveLength(0);expect(list(root).hidden).toBe(true);
 root.dataset.hwSuggestions=JSON.stringify({not:'array'});await Promise.resolve();expect(options(root)).toHaveLength(0);root.dataset.hwSuggestions=JSON.stringify(['Search one','Search two']);await Promise.resolve();expect(options(root)).toHaveLength(1);expect(options(root)[0]!.textContent).toBe('Search one');
 controller.setSuggestions(['Search replacement']);expect(options(root)[0]!.textContent).toBe('Search replacement');root.dataset.hwSuggestions=JSON.stringify(['Search ignored']);await Promise.resolve();expect(options(root)[0]!.textContent).toBe('Search replacement');
 controller.destroy();const explicit=createSearchField(root,{suggestions:['Search explicit','Search other'],maxSuggestions:2});cleanups.push(explicit.destroy);type(input,'search');expect(options(root)).toHaveLength(2);expect(options(root)[0]!.textContent).toBe('Search explicit');
});
it('leaves no-suggestion search fields unchanged and restores generated semantics and DOM on destroy',()=>{
 const plain=setup();expect(plain.input.hasAttribute('role')).toBe(false);expect(plain.root.querySelector('[role="listbox"]')).toBeNull();plain.controller.setValue('edited');plain.input.focus();plain.controller.setSuggestions(['Edited suggestion']);expect(options(plain.root)).toHaveLength(1);plain.controller.destroy();expect(matchesMarkup(plain.root,plain.before)).toBe(true);expect(plain.input.value).toBe('edited');plain.controller.setSuggestions(['No post-destroy work']);expect(plain.root.querySelector('[role="listbox"]')).toBeNull();
 const {root,input,controller,before}=setup({suggestions:['Search first']});type(input,'search');key(input,'ArrowDown');controller.destroy();controller.destroy();expect(matchesMarkup(root,before)).toBe(true);expect(input.value).toBe('search');input.dispatchEvent(new Event('focus'));expect(root.querySelector('[role="listbox"]')).toBeNull();
});
it('announces zero matches without displaying a popup and removes optional semantics when its declaration is removed',async()=>{
 const {root,input}=setup({},'data-hw-suggestions="[]"');type(input,'nothing');expect(list(root).hidden).toBe(true);expect(root.querySelector('[role="status"]')!.textContent).toBe('0 اقتراحات متاحة');root.removeAttribute('data-hw-suggestions');await Promise.resolve();expect(root.querySelector('[role="listbox"]')).toBeNull();expect(input.hasAttribute('role')).toBe(false);expect(input.hasAttribute('autocomplete')).toBe(false);
});
it('names the clear button from its authored text, which the icon then replaces',()=>{
 const warn=vi.spyOn(console,'warn').mockImplementation(()=>{});
 try{
  // Authored text wins over data-hw-clear-label on the root and needs no other source.
  const authored=setup();expect(authored.clear.getAttribute('aria-label')).toBe('Clear');expect(authored.clear.textContent).toBe('');expect(authored.clear.querySelector('.hw-search-clear-icon')).not.toBeNull();
  authored.controller.destroy();expect(authored.clear.hasAttribute('aria-label')).toBe(false);expect(authored.clear.textContent).toBe('Clear');
  const alone=setup({},'','','');expect(alone.clear.getAttribute('aria-label')).toBe('Clear');
  const attribute=setup({},'','',copy,'');expect(attribute.clear.getAttribute('aria-label')).toBe('مسح البحث');
  const option=setup({clearLabel:'Clear the query'});expect(option.clear.getAttribute('aria-label')).toBe('Clear the query');
  expect(warn).not.toHaveBeenCalled();
 }finally{warn.mockRestore();}
});
it('renders no invented clear name or announcement when the application supplies no texts',()=>{
 const warn=vi.spyOn(console,'warn').mockImplementation(()=>{});
 try{
  const {root,input,clear}=setup({suggestions:['Search first','Search second']},'','','','');
  type(input,'search');expect(options(root)).toHaveLength(2);expect(root.querySelector('[role="status"]')!.textContent).toBe('');
  expect(clear.hasAttribute('aria-label')).toBe(false);
  expect(root.textContent).not.toMatch(/اقتراحات|suggestions available|مسح البحث|Clear search/u);
 }finally{warn.mockRestore();}
});
it('routes the second Escape to an open native modal without clearing the chosen search text',()=>{
 const {root,input,form}=setup({suggestions:['Search first']});const dialog=document.createElement('dialog');dialog.open=true;form.before(dialog);dialog.append(form);vi.spyOn(dialog,'matches').mockImplementation(selector=>selector===':modal');const request=vi.fn();Object.defineProperty(dialog,'requestClose',{configurable:true,value:request});
 type(input,'search');expect(key(input,'Escape').defaultPrevented).toBe(true);expect(request).not.toHaveBeenCalled();expect(list(root).hidden).toBe(true);expect(key(input,'Escape').defaultPrevented).toBe(true);expect(request).toHaveBeenCalledExactlyOnceWith();expect(input.value).toBe('search');
});
