import {afterEach,expect,it,vi} from 'vitest';
import {createPagination} from '../packages/vanilla/src/pagination';

const cleanups:Array<()=>void>=[];
afterEach(()=>{for(const cleanup of cleanups.splice(0))cleanup();document.body.replaceChildren();});
// The application's copy as template attributes: the strings the controller used to supply.
const copy='aria-label="ترقيم الصفحات" data-hw-page-label="الصفحة {page}" data-hw-gap-label="الصفحات {start} إلى {end}" data-hw-jump-label="الانتقال إلى صفحة" data-hw-go-label="انتقال"';
function mount(total=20,page=10,extra='',texts=copy){
 document.body.innerHTML=`<nav class="hw-pagination" data-hw="pagination" data-hw-total="${total}" data-hw-current="${page}" ${texts} ${extra}><button data-hw-page="previous">Previous</button><span data-hw-pagination-items><i>Authored fallback</i></span><button data-hw-page="next">Next</button></nav><button id="outside">Outside</button>`;
 return document.querySelector<HTMLElement>('nav')!;
}
function enhance(root:HTMLElement,options:Parameters<typeof createPagination>[1]={}){const controller=createPagination(root,options);cleanups.push(controller.destroy);return controller;}
const button=(root:HTMLElement,page:number|string)=>root.querySelector<HTMLButtonElement>(`[data-hw-page="${page}"]`)!;

it('generates bounded windows and jumps to omitted pages with one event and focus return',()=>{
 const root=mount(),callback=vi.fn(),event=vi.fn();root.addEventListener('hw:change',event);
 const controller=enhance(root,{onPageChange:callback});
 expect(root.querySelectorAll('details')).toHaveLength(2);
 expect(root.querySelector('summary')?.getAttribute('aria-label')).toBe('الصفحات 2 إلى 8');
 expect(root.querySelector('[aria-current="page"]')?.textContent).toBe('10');
 expect(root.querySelector('[aria-current="page"]')?.getAttribute('aria-label')).toBe('الصفحة 10');
 const gap=root.querySelector('details')!;gap.open=true;const destination=button(root,5);destination.focus();destination.click();
 expect(controller.page).toBe(5);expect(callback).toHaveBeenCalledExactlyOnceWith(5);expect(event).toHaveBeenCalledTimes(1);
 expect(document.activeElement).toBe(button(root,5));expect(root.querySelector('details[open]')).toBeNull();
 controller.select(5);controller.select(NaN);controller.select(21);controller.select(1.5);expect(callback).toHaveBeenCalledTimes(1);
});
it('renders no invented names when the application supplies no texts',()=>{
 const warn=vi.spyOn(console,'warn').mockImplementation(()=>{});
 try{
  const root=mount(20,10,'','');enhance(root);
  expect(root.querySelectorAll('details')).toHaveLength(2);
  expect(root.querySelector('summary')?.hasAttribute('aria-label')).toBe(false);
  expect(root.querySelector('[aria-current="page"]')?.hasAttribute('aria-label')).toBe(false);
  expect(root.querySelector('[aria-current="page"]')?.textContent).toBe('10');
  expect(root.textContent).not.toMatch(/الصفح|انتقال|Page|Go to/u);
 }finally{warn.mockRestore();}
});
it('closes disclosures with Escape, outside click and another opening',()=>{
 const root=mount();enhance(root);const gaps=[...root.querySelectorAll<HTMLDetailsElement>('details')];
 gaps[0]!.open=true;gaps[0]!.dispatchEvent(new Event('toggle'));
 gaps[1]!.open=true;gaps[1]!.dispatchEvent(new Event('toggle'));expect(gaps[0]!.open).toBe(false);
 const child=gaps[1]!.querySelector('button')!;child.focus();const escape=new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true});child.dispatchEvent(escape);
 expect(escape.defaultPrevented).toBe(true);expect(gaps[1]!.open).toBe(false);expect(document.activeElement).toBe(gaps[1]!.querySelector('summary'));
 gaps[0]!.open=true;document.querySelector<HTMLButtonElement>('#outside')!.click();expect(gaps[0]!.open).toBe(false);
});
it('uses a validated numeric jump for large gaps without allocating every page or nesting a form',()=>{
 const root=mount(10000,5000);const form=document.createElement('form');root.before(form);form.append(root);const controller=enhance(root);
 expect(root.querySelectorAll('[data-hw-page]').length).toBeLessThan(10);expect(root.querySelector('form')).toBeNull();
 const gap=root.querySelector('details')!;gap.open=true;const input=gap.querySelector<HTMLInputElement>('[data-hw-jump-input]')!;
 expect(input.name).toBe('');expect(input.form).toBeNull();expect(input.min).toBe('2');expect(input.max).toBe('4998');expect(input.dataset.hwFilled).toBe('true');expect(input.hasAttribute('aria-invalid')).toBe(false);
 input.value='';input.dispatchEvent(new Event('input',{bubbles:true}));expect(input.dataset.hwFilled).toBe('false');
 input.value='25';input.dispatchEvent(new Event('input',{bubbles:true}));expect(input.dataset.hwFilled).toBe('true');
 for(const invalid of ['', '1','4999','2.5']){input.value=invalid;gap.querySelector<HTMLButtonElement>('[data-hw-jump-submit]')!.click();expect(controller.page).toBe(5000);expect(form.checkValidity()).toBe(true);expect(input.getAttribute('aria-invalid')).toBe('true');}
 input.value='7000';input.dispatchEvent(new Event('input',{bubbles:true}));expect(input.getAttribute('aria-invalid')).toBe('true');
 input.value='25';input.dispatchEvent(new Event('input',{bubbles:true}));expect(input.hasAttribute('aria-invalid')).toBe(false);input.focus();input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true,cancelable:true}));
 expect(controller.page).toBe(25);expect(document.activeElement).toBe(button(root,25));
});
it('blocks disabled roots, preserves authored disabled controls, and reacts to root disabled changes',async()=>{
 const root=mount(20,10,'aria-disabled="true"');const callback=vi.fn(),controller=enhance(root,{onPageChange:callback});
 expect(root.querySelector('details')).toBeNull();expect(button(root,10).disabled).toBe(true);controller.select(11);expect(controller.page).toBe(10);
 root.removeAttribute('aria-disabled');await Promise.resolve();expect(root.querySelector('details')).not.toBeNull();button(root,'next').click();expect(controller.page).toBe(11);
 root.setAttribute('aria-disabled','true');await Promise.resolve();expect(button(root,'next').disabled).toBe(true);expect(callback).toHaveBeenCalledTimes(1);
});
it('blocks inherited disabled controls and supports explicit single-page hiding and label formatting',()=>{
 const root=mount(1,1);const wrapper=document.createElement('fieldset');wrapper.disabled=true;root.before(wrapper);wrapper.append(root);
 const controller=enhance(root,{hideOnSinglePage:true,getPageLabel:page=>`Page number ${page}`,formatPage:page=>`[${page}]`});
 expect(root.hidden).toBe(true);expect(button(root,1).disabled).toBe(true);expect(button(root,1).textContent).toBe('[1]');expect(button(root,1).getAttribute('aria-label')).toBe('Page number 1');controller.select(1);expect(controller.page).toBe(1);
});
it('closes and removes inherited-disabled disclosures when an ancestor fieldset changes',async()=>{
 const root=mount(),fieldset=document.createElement('fieldset');root.before(fieldset);fieldset.append(root);const controller=enhance(root);
 root.querySelector('details')!.open=true;fieldset.disabled=true;await Promise.resolve();
 expect(root.querySelector('details')).toBeNull();controller.select(11);expect(controller.page).toBe(10);
 fieldset.disabled=false;await Promise.resolve();expect(root.querySelectorAll('details')).toHaveLength(2);controller.select(11);expect(controller.page).toBe(11);
});
it('restores original nodes and attributes on teardown, retaining authored links and modifier behavior',()=>{
 document.body.innerHTML='<nav data-hw-total="3"><a href="#page-2" data-hw-page="2">Two</a><button data-hw-page="previous" disabled>Previous</button><button data-hw-page="3">Three</button><button data-hw-page="next">Next</button></nav>';
 const legacy=document.querySelector<HTMLElement>('nav')!,before=legacy.outerHTML;const controller=enhance(legacy);
 const event=new MouseEvent('click',{bubbles:true,cancelable:true,ctrlKey:true});legacy.querySelector('a')!.dispatchEvent(event);expect(event.defaultPrevented).toBe(false);expect(controller.page).toBe(1);
 controller.select(3);expect(button(legacy,'previous').disabled).toBe(true);controller.destroy();expect(legacy.outerHTML).toBe(before);
 const root=mount(),original=root.querySelector('i')!,html=root.outerHTML,generated=enhance(root);generated.select(20);generated.destroy();expect(root.outerHTML).toBe(html);expect(root.querySelector('i')).toBe(original);
 button(root,'next').click();expect(generated.page).toBe(20);
});
it('does not process a nested pagination action and rejects unsafe totals',()=>{
 const root=mount(10,1);const controller=enhance(root);root.insertAdjacentHTML('beforeend','<nav data-hw="pagination"><button data-hw-page="3">Nested</button></nav>');
 root.querySelector<HTMLButtonElement>('nav button')!.click();expect(controller.page).toBe(1);
 for(const total of [0,NaN,Infinity,1.5,Number.MAX_SAFE_INTEGER+1])expect(()=>createPagination(document.createElement('nav'),{totalPages:total})).toThrow('positive safe integer');
});
