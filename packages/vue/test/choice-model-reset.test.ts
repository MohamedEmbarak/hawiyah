import {afterEach, expect, it} from 'vitest';
import {createApp, h, nextTick, ref} from 'vue';
import {Checkbox,Radio,Switch} from '../src/forms.js';

afterEach(() => document.body.replaceChildren());

for (const preset of ['first','last',''] as const) {
  it('native radio reset restores the declared group default "' + preset + '" exactly once', async () => {
    const current = ref<string>(preset);
    const updates: string[] = [];
    const host = document.createElement('div');
    document.body.append(host);
    const app = createApp({render: () => h('form', {}, ['first','middle','last'].map(value => h(Radio, {
      name:'service', label:value, value,
      ...(value === preset ? {defaultValue:preset} : {}),
      modelValue:current.value,
      'onUpdate:modelValue': (next: string) => { updates.push(next); current.value=next; },
    })))});
    try {
      app.mount(host);
      const form=host.querySelector('form')!;
      const middle=form.querySelector<HTMLInputElement>('input[value="middle"]')!;
      middle.click(); await nextTick();
      expect(current.value).toBe('middle');
      expect(new FormData(form).get('service')).toBe('middle');
      updates.length=0;
      form.reset(); await Promise.resolve(); await nextTick();
      expect(updates).toEqual([preset]);
      expect(current.value).toBe(preset);
      expect(new FormData(form).get('service')).toBe(preset || null);
    } finally {app.unmount();}
  });
}

for (const component of [Checkbox,Switch]) {
  it(component.name + ' emits boolean checked state on changes and resets', async () => {
    const current=ref(false);
    const events:boolean[]=[];
    const app=createApp({render:()=>h('form',{},h(component,{
      label:'Enabled', modelValue:current.value,
      'onUpdate:modelValue':(next:boolean)=>{events.push(next);current.value=next;},
    }))});
    const host=document.createElement('div'); document.body.append(host);
    try {
      app.mount(host);
      host.querySelector('input')!.click(); await nextTick();
      host.querySelector('form')!.reset(); await Promise.resolve(); await nextTick();
      expect(events).toEqual([true,false]);
      expect(current.value).toBe(false);
    } finally {app.unmount();}
  });
}
