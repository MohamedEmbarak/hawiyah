import {useCallback, useEffect, useId, useRef, useState} from 'react';
import {getSearchSuggestions, isDisabled, requestSearchDialogClose} from '@hawiyah/core';
import {Button, TextField} from './forms.js';
import type {TextFieldProps} from './forms.js';
import {assignRef, Field, text as copy, useControllable} from './shared.js';
import type {FieldName} from './shared.js';
import {useFormReset} from './expanded-shared.js';

interface SearchFieldBaseProps extends Omit<TextFieldProps, 'type' | 'value' | 'defaultValue' | 'onSearch' | 'label'> {
  value?: string; defaultValue?: string; onValueChange?: (value: string) => void;
  clearLabel: string; maxSuggestions?: number; onSearch?: (query: string) => void;
}
/** The field and its suggestion list are named by `label` (or aria-label / aria-labelledby).
 * `searchLabel` names the search button and is required with `showSearchButton`;
 * `getResultsMessage` announces the suggestion count and is required with `suggestions`. */
export type SearchFieldProps = SearchFieldBaseProps & FieldName
  & ({ showSearchButton?: false; searchLabel?: string } | { showSearchButton?: boolean; searchLabel: string })
  & ({ suggestions?: undefined; getResultsMessage?: (count: number) => string } | { suggestions?: readonly string[]; getResultsMessage: (count: number) => string });
export function SearchField({value, defaultValue = '', onValueChange, clearLabel, suggestions, maxSuggestions = 8, getResultsMessage, onSearch, showSearchButton = false, searchLabel, label, hint, error, ref, onChange, onKeyDown, onFocus, onBlur, onCompositionStart, onCompositionEnd, ...props}: SearchFieldProps) {
  const names = {clear: copy('SearchField', 'clearLabel', clearLabel), search: showSearchButton ? copy('SearchField', 'searchLabel', searchLabel, 'showSearchButton is on') : undefined, results: suggestions !== undefined ? copy('SearchField', 'getResultsMessage', getResultsMessage, 'suggestions are given') : undefined};
  if (!props['aria-label'] && !props['aria-labelledby']) copy('SearchField', 'label', label);
  const id = useId(), input = useRef<HTMLInputElement | null>(null), root = useRef<HTMLDivElement>(null);
  const [text, setText] = useControllable(value, defaultValue, onValueChange);
  const [opened, setOpened] = useState(false), [active, setActive] = useState(-1);
  const composing = useRef(false), expectedValue = useRef<string | undefined>(undefined);
  const close = () => {setOpened(false);setActive(-1);};
  const canEdit = () => !!input.current && !props.readOnly && !input.current.readOnly && !isDisabled(input.current);
  const matches = getSearchSuggestions(text, suggestions ?? [], maxSuggestions);
  const expanded = opened && suggestions !== undefined && !props.readOnly && !props.disabled && !composing.current && matches.length > 0;
  const listId = `${props.id ?? id}-suggestions`;
  const suggestionSignature = JSON.stringify(suggestions);
  const write = (next: string) => {expectedValue.current = next;setText(next);};
  const setInput = useCallback((node: HTMLInputElement | null) => {
    input.current = node;
    if (!node) {assignRef(ref, null);return;}
    const cleanup = typeof ref === 'function' ? ref(node) : (assignRef(ref, node), undefined);
    return () => {input.current = null;if(typeof cleanup === 'function')cleanup();else assignRef(ref,null);};
  }, [ref]);
  useFormReset(input, () => {close();composing.current=false;if(value === undefined)setText(defaultValue);}, props.form);
  useEffect(() => {setActive(-1);}, [text]);
  useEffect(() => {if(value !== expectedValue.current)close();expectedValue.current=undefined;}, [value]);
  useEffect(close, [suggestionSignature, maxSuggestions, props.readOnly, props.disabled]);
  useEffect(()=>{
    if(!expanded || active<0)return;const list=input.current?.ownerDocument.getElementById(listId),option=list?.children[active] as HTMLElement|undefined;
    if(!list || !option)return;const outer=list.getBoundingClientRect(),inner=option.getBoundingClientRect();
    if(inner.top<outer.top)list.scrollTop-=outer.top-inner.top;else if(inner.bottom>outer.bottom)list.scrollTop+=inner.bottom-outer.bottom;
  },[active,expanded,listId]);
  useEffect(() => {
    const node=input.current, container=root.current;if(!node || !container)return;
    const outside=(event:Event)=>{if(!container.contains(event.target as Node))close();};
    node.ownerDocument.addEventListener('pointerdown',outside);
    const Observer=node.ownerDocument.defaultView?.MutationObserver;
    const observer=Observer ? new Observer(()=>{if(node.readOnly || isDisabled(node))close();}) : undefined;
    observer?.observe(node,{attributes:true,attributeFilter:['readonly','disabled','aria-disabled']});
    for(let parent=node.parentElement;parent;parent=parent.parentElement)if(parent.localName==='fieldset')observer?.observe(parent,{attributes:true,attributeFilter:['disabled']});
    return()=>{observer?.disconnect();node.ownerDocument.removeEventListener('pointerdown',outside);};
  }, []);
  const choose=(index:number)=>{if(!canEdit() || composing.current)return;const match=matches[index];if(!match)return;write(match.value);input.current?.focus();close();};
  const search=()=>{if(!input.current || isDisabled(input.current) || composing.current)return;const query=text.trim();if(query)onSearch?.(query);close();};
  return <Field ref={root} label={label} hint={hint} error={error} required={props.required} controlId={props.id ?? id} className="hw-search-field">
    <div className="hw-input-group"><div className="hw-search-control">
      <TextField {...props} ref={setInput} type="search" value={text} autoComplete={props.autoComplete ?? (suggestions !== undefined ? 'off' : undefined)} role={suggestions !== undefined ? 'combobox' : props.role} aria-autocomplete={suggestions !== undefined ? 'list' : props['aria-autocomplete']} aria-expanded={suggestions !== undefined ? expanded : props['aria-expanded']} aria-controls={suggestions !== undefined ? listId : props['aria-controls']} aria-activedescendant={expanded && active >= 0 && active < matches.length ? `${listId}-${active}` : undefined}
        onChange={event=>{onChange?.(event);if(event.defaultPrevented || !canEdit())return;write(event.currentTarget.value);setActive(-1);setOpened(!composing.current);}}
        onFocus={event=>{onFocus?.(event);if(!event.defaultPrevented && canEdit() && !composing.current)setOpened(true);}}
        onBlur={event=>{onBlur?.(event);close();}}
        onCompositionStart={event=>{onCompositionStart?.(event);composing.current=true;close();}}
        onCompositionEnd={event=>{onCompositionEnd?.(event);composing.current=false;if(!event.defaultPrevented && canEdit())setOpened(true);}}
        onKeyDown={event=>{
          onKeyDown?.(event);if(event.defaultPrevented || composing.current || event.nativeEvent.isComposing || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || isDisabled(event.currentTarget))return;
          if(event.key==='Escape' && expanded){event.preventDefault();event.stopPropagation();close();return;}
          if(event.key==='Escape' && requestSearchDialogClose(event.currentTarget)){event.preventDefault();event.stopPropagation();return;}
          if(canEdit() && matches.length && (event.key==='ArrowDown' || event.key==='ArrowUp')){event.preventDefault();setOpened(true);setActive(index=>event.key==='ArrowDown'?(index+1)%matches.length:(index<=0?matches.length-1:index-1));return;}
          if(event.key==='Enter'){if(expanded && active>=0){event.preventDefault();choose(active);}else search();}
        }}/>
      <Button className="hw-search-clear" variant="ghost" hidden={!text || props.readOnly} disabled={props.disabled} aria-label={names.clear} aria-controls={props.id ?? id} onPointerDown={event=>{if(event.button===0)event.preventDefault();}} onMouseDown={event=>{if(event.button===0)event.preventDefault();}} onClick={()=>{if(canEdit()){write('');input.current?.focus();close();}}}><span className="hw-search-clear-icon" aria-hidden="true" /></Button>
      {suggestions !== undefined && <div className="hw-search-suggestions" id={listId} role="listbox" aria-label={props['aria-label'] || undefined} aria-labelledby={props['aria-label'] ? undefined : props['aria-labelledby'] ?? (label != null ? `${props.id ?? id}-label` : undefined)} hidden={!expanded}>{matches.map((match,index)=><div className="hw-search-option" dir="auto" key={match.value} id={`${listId}-${index}`} role="option" aria-selected={index===active} onPointerDown={event=>{if(event.button===0)event.preventDefault();}} onMouseDown={event=>{if(event.button===0)event.preventDefault();}} onClick={()=>choose(index)}>{match.segments.map((segment,i)=>segment.match?<strong key={i}>{segment.text}</strong>:segment.text)}</div>)}</div>}
    </div>{showSearchButton && <Button className="hw-search-submit" disabled={props.disabled} aria-label={names.search} onClick={search}><span className="hw-search-submit-icon" aria-hidden="true" /></Button>}</div>
    {suggestions !== undefined && <span className="hw-sr-only" role="status" aria-live="polite" aria-atomic="true">{opened && !props.readOnly && !props.disabled && !composing.current && text.trim() ? names.results?.(matches.length) : ''}</span>}
  </Field>;
}
