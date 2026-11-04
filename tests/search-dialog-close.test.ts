import {afterEach,expect,it,vi} from 'vitest';
import {requestSearchDialogClose} from '../packages/core/src/search-suggestions';
afterEach(()=>{document.body.replaceChildren();vi.restoreAllMocks();});
function modal(){
 const dialog=document.createElement('dialog'),input=document.createElement('input');input.type='search';input.value='Chosen search';dialog.open=true;dialog.returnValue='retained';dialog.append(input);document.body.append(dialog);
 vi.spyOn(dialog,'matches').mockImplementation(selector=>selector===':modal');
 const close=vi.fn(()=>{dialog.open=false;});Object.defineProperty(dialog,'close',{configurable:true,value:close});
 Object.defineProperty(dialog,'requestClose',{configurable:true,writable:true,value:undefined});
 return {dialog,input,close};
}
it('ignores absent, closed and nonmodal dialogs and unsupported modal selectors',()=>{
 const input=document.createElement('input');document.body.append(input);expect(requestSearchDialogClose(input)).toBe(false);
 const fixture=modal();fixture.dialog.open=false;expect(requestSearchDialogClose(fixture.input)).toBe(false);fixture.dialog.open=true;vi.mocked(fixture.dialog.matches).mockReturnValue(false);expect(requestSearchDialogClose(fixture.input)).toBe(false);
 vi.mocked(fixture.dialog.matches).mockImplementation(()=>{throw new DOMException('Unsupported selector','SyntaxError');});expect(requestSearchDialogClose(fixture.input)).toBe(false);expect(fixture.close).not.toHaveBeenCalled();expect(fixture.input.value).toBe('Chosen search');
});
it('uses requestClose without replacing the return value and reports a handled request even if canceled',()=>{
 const {dialog,input,close}=modal();const cancel=vi.fn((event:Event)=>event.preventDefault());dialog.addEventListener('cancel',cancel);
 const request=vi.fn(()=>{dialog.dispatchEvent(new window.Event('cancel',{cancelable:true}));});Object.defineProperty(dialog,'requestClose',{value:request});
 expect(requestSearchDialogClose(input)).toBe(true);expect(request).toHaveBeenCalledExactlyOnceWith();expect(cancel).toHaveBeenCalledTimes(1);expect(close).not.toHaveBeenCalled();expect(dialog.open).toBe(true);expect(dialog.returnValue).toBe('retained');expect(input.value).toBe('Chosen search');
});
it('does not request a close when closedby is none',()=>{
 const {dialog,input,close}=modal(),request=vi.fn();Object.defineProperty(dialog,'requestClose',{value:request});dialog.setAttribute('closedby','NONE');expect(requestSearchDialogClose(input)).toBe(false);expect(request).not.toHaveBeenCalled();expect(close).not.toHaveBeenCalled();expect(dialog.open).toBe(true);
});
it('falls back to a realm-correct cancelable event and preserves values when closing is allowed',()=>{
 const {dialog,input,close}=modal();const events:Event[]=[];dialog.addEventListener('cancel',event=>events.push(event));expect(requestSearchDialogClose(input)).toBe(true);expect(events).toHaveLength(1);expect(events[0]).toBeInstanceOf(window.Event);expect(events[0]!.cancelable).toBe(true);expect(events[0]!.bubbles).toBe(false);expect(close).toHaveBeenCalledExactlyOnceWith();expect(dialog.open).toBe(false);expect(dialog.returnValue).toBe('retained');expect(input.value).toBe('Chosen search');
});
it('honors fallback cancellation and avoids closing twice when a cancel handler closes the dialog',()=>{
 const {dialog,input,close}=modal();const cancel=(event:Event)=>event.preventDefault();dialog.addEventListener('cancel',cancel);expect(requestSearchDialogClose(input)).toBe(true);expect(close).not.toHaveBeenCalled();expect(dialog.open).toBe(true);
 dialog.removeEventListener('cancel',cancel);dialog.addEventListener('cancel',()=>dialog.close());expect(requestSearchDialogClose(input)).toBe(true);expect(close).toHaveBeenCalledTimes(1);
});
