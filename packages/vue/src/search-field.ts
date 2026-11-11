import {computed, defineComponent, h, mergeProps, nextTick, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import type {PropType} from 'vue';
import {getSearchSuggestions, isDisabled, requestSearchDialogClose} from '@hawiyah/core';
import {Button, decorate} from './forms.js';
import {decorationProps, needText, optionalText, useField, useFormReset, useValue} from './shared.js';

export const SearchField = defineComponent({
  name: 'HwSearchField', inheritAttrs: false,
  props: {...decorationProps, modelValue: String, defaultValue:{type:String,default:''}, disabled:Boolean, readonly:Boolean,
    clearLabel:{type:String,required:true}, suggestions:Array as PropType<readonly string[]>, maxSuggestions:{type:Number,default:8},
    getResultsMessage:Function as PropType<(count:number)=>string>,
    showSearchButton:Boolean,searchLabel:String,
  },
  emits:{'update:modelValue':(_value:string)=>true,search:(_value:string)=>true},
  setup(props,{attrs,emit,expose}) {
    const field=useField(props,attrs),element=ref<HTMLInputElement>(),container=ref<HTMLElement>();
    const model=useValue(()=>props.modelValue,props.defaultValue,value=>emit('update:modelValue',value));
    const opened=ref(false),active=ref(-1),composing=ref(false);let expectedValue:string|undefined;
    const close=()=>{opened.value=false;active.value=-1;};
    const editable=()=>!!element.value && !props.readonly && !element.value.readOnly && !isDisabled(element.value);
    const matches=computed(()=>getSearchSuggestions(model.value.value,props.suggestions??[],props.maxSuggestions));
    const expanded=computed(()=>opened.value && props.suggestions!==undefined && !props.readonly && !props.disabled && !composing.value && matches.value.length>0);
    const listId=computed(()=>`${field.id.value}-suggestions`);
    const resultsMessage=(count:number)=>{const get=needText('SearchField','getResultsMessage',props.getResultsMessage,'suggestions are given');return get?optionalText(get(count)):undefined;};
    const write=(value:string)=>{expectedValue=value;model.set(value);};
    const search=()=>{if(!element.value || isDisabled(element.value) || composing.value)return;const query=model.value.value.trim();if(query)emit('search',query);close();};
    const choose=(index:number)=>{if(!editable() || composing.value)return;const match=matches.value[index];if(!match)return;write(match.value);element.value?.focus();close();};
    useFormReset(element,()=>{close();composing.value=false;model.set(props.defaultValue);});
    expose({element,focus:()=>{if(element.value && !isDisabled(element.value))element.value.focus();}});
    watch(model.value,()=>{active.value=-1;});
    watch(()=>props.modelValue,value=>{if(value!==expectedValue)close();expectedValue=undefined;});
    watch(()=>[JSON.stringify(props.suggestions),props.maxSuggestions,props.disabled,props.readonly],close);
    let observer:MutationObserver|undefined;
    const outside=(event:Event)=>{if(!container.value?.contains(event.target as Node))close();};
    onMounted(()=>{
      const input=element.value!;input.ownerDocument.addEventListener('pointerdown',outside);
      const Observer=input.ownerDocument.defaultView?.MutationObserver;
      observer=Observer?new Observer(()=>{if(input.readOnly || isDisabled(input))close();}):undefined;
      observer?.observe(input,{attributes:true,attributeFilter:['readonly','disabled','aria-disabled']});
      for(let parent=input.parentElement;parent;parent=parent.parentElement)if(parent.localName==='fieldset')observer?.observe(parent,{attributes:true,attributeFilter:['disabled']});
    });
    onBeforeUnmount(()=>{observer?.disconnect();element.value?.ownerDocument.removeEventListener('pointerdown',outside);});
    watch([active,expanded],async()=>{
      await nextTick();if(!expanded.value || active.value<0)return;
      const list=element.value?.ownerDocument.getElementById(listId.value),option=list?.children[active.value] as HTMLElement|undefined;
      if(!list || !option)return;const outer=list.getBoundingClientRect(),inner=option.getBoundingClientRect();
      if(inner.top<outer.top)list.scrollTop-=outer.top-inner.top;else if(inner.bottom>outer.bottom)list.scrollTop+=inner.bottom-outer.bottom;
    },{flush:'post'});
    return()=>{
      // The field name: `label`, an aria-label or aria-labelledby on the input, or a parent Field label.
      if(!field.controlAttrs.value['aria-labelledby'] && !optionalText(attrs['aria-label']))needText('SearchField','label',props.label);
      return decorate(props,field.id.value,[
      h('div',{class:'hw-input-group',ref:container},[
        h('div',{class:'hw-search-control'},[
          h('input',mergeProps(attrs,field.controlAttrs.value,{ref:element,class:'hw-input',type:'search',value:model.value.value,disabled:props.disabled,readonly:props.readonly,
            autocomplete:attrs.autocomplete??(props.suggestions!==undefined?'off':undefined),role:props.suggestions!==undefined?'combobox':attrs.role,
            'aria-autocomplete':props.suggestions!==undefined?'list':attrs['aria-autocomplete'],'aria-expanded':props.suggestions!==undefined?expanded.value:attrs['aria-expanded'],'aria-controls':props.suggestions!==undefined?listId.value:attrs['aria-controls'],'aria-activedescendant':expanded.value && active.value>=0 && active.value<matches.value.length?`${listId.value}-${active.value}`:undefined,
            onInput:(event:Event)=>{if(event.defaultPrevented || !editable())return;write((event.target as HTMLInputElement).value);active.value=-1;opened.value=!composing.value;},
            onFocus:(event:FocusEvent)=>{if(!event.defaultPrevented && editable() && !composing.value)opened.value=true;},onBlur:close,
            onCompositionstart:()=>{composing.value=true;close();},onCompositionend:(event:CompositionEvent)=>{composing.value=false;if(!event.defaultPrevented && editable())opened.value=true;},
            onKeydown:(event:KeyboardEvent)=>{
              if(event.defaultPrevented || composing.value || event.isComposing || event.ctrlKey || event.altKey || event.metaKey || event.shiftKey || !element.value || isDisabled(element.value))return;
              if(event.key==='Escape' && expanded.value){event.preventDefault();event.stopPropagation();close();return;}
              if(event.key==='Escape' && requestSearchDialogClose(element.value)){event.preventDefault();event.stopPropagation();return;}
              if(editable() && matches.value.length && (event.key==='ArrowDown' || event.key==='ArrowUp')){event.preventDefault();opened.value=true;active.value=event.key==='ArrowDown'?(active.value+1)%matches.value.length:(active.value<=0?matches.value.length-1:active.value-1);return;}
              if(event.key==='Enter'){if(expanded.value && active.value>=0){event.preventDefault();choose(active.value);}else search();}
            },
          })),
          h(Button,{class:'hw-search-clear',variant:'ghost',hidden:!model.value.value || props.readonly,disabled:props.disabled,'aria-label':needText('SearchField','clearLabel',props.clearLabel),'aria-controls':field.id.value,onPointerdown:(event:PointerEvent)=>{if(event.button===0)event.preventDefault();},onMousedown:(event:MouseEvent)=>{if(event.button===0)event.preventDefault();},onClick:()=>{if(editable()){write('');element.value?.focus();close();}}},()=>h('span',{class:'hw-search-clear-icon','aria-hidden':'true'})),
          props.suggestions!==undefined?h('div',{class:'hw-search-suggestions',id:listId.value,role:'listbox','aria-label':optionalText(props.label)??optionalText(attrs['aria-label'] as string|undefined),'aria-labelledby':optionalText(props.label)||optionalText(attrs['aria-label'])?undefined:attrs['aria-labelledby'],hidden:!expanded.value},matches.value.map((match,index)=>h('div',{class:'hw-search-option',dir:'auto',key:match.value,id:`${listId.value}-${index}`,role:'option','aria-selected':index===active.value,onPointerdown:(event:PointerEvent)=>{if(event.button===0)event.preventDefault();},onMousedown:(event:MouseEvent)=>{if(event.button===0)event.preventDefault();},onClick:()=>choose(index)},match.segments.map(segment=>segment.match?h('strong',segment.text):segment.text)))):null,
        ]),
        props.showSearchButton?h(Button,{class:'hw-search-submit',disabled:props.disabled,'aria-label':needText('SearchField','searchLabel',props.searchLabel,'showSearchButton is on'),onClick:search},()=>h('span',{class:'hw-search-submit-icon','aria-hidden':'true'})):null,
      ]),
      props.suggestions!==undefined?h('span',{class:'hw-sr-only',role:'status','aria-live':'polite','aria-atomic':'true'},opened.value && !props.readonly && !props.disabled && !composing.value && model.value.value.trim()?resultsMessage(matches.value.length):undefined):null,
    ],'hw-search-field');
    };
  },
});
