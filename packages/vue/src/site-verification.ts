import {defineComponent,h,mergeProps,ref} from 'vue';
import {needText} from './shared.js';

export const SiteVerification=defineComponent({
  name:'HwSiteVerification',inheritAttrs:false,
  props:{label:{type:String,required:true},detailsLabel:{type:String,required:true},domainLabel:{type:String,required:true},domainDescription:{type:String,required:true},httpsLabel:{type:String,required:true},httpsDescription:{type:String,required:true},registrationLabel:String,domain:String,registrationHref:String,registrationNumber:String,externalLabel:String,registrationExternal:{type:Boolean,default:true},open:{type:Boolean,default:undefined},defaultOpen:Boolean},
  emits:{'update:open':(_open:boolean)=>true},
  setup(props,{attrs,slots,emit}) {
    const localOpen=ref(props.defaultOpen);
    const icon=(name:string)=>h('span',{class:'hw-icon','data-icon':name,'aria-hidden':'true'});
    return ()=>{
      const expanded=props.open ?? localOpen.value,text=(name:'label'|'detailsLabel'|'domainLabel'|'domainDescription'|'httpsLabel'|'httpsDescription'|'registrationLabel'|'externalLabel',when?:string)=>needText('SiteVerification',name,props[name],when),label=text('label');
      const check=(name:string,title:string|undefined,value:string|undefined,description:string|undefined)=>h('section',{},[icon(name),h('div',{},[h('h2',{},value?[title,' ',h('bdi',{},value)]:title),h('p',{},description)])]);
      return h('aside',mergeProps(attrs,{class:'hw-site-verification','aria-label':attrs['aria-label'] ?? label}),h('details',{
        open:expanded,onToggle:(event:Event)=>{const next=(event.currentTarget as HTMLDetailsElement).open;if(next!==expanded){localOpen.value=next;emit('update:open',next);}},
      },[
        h('summary',{onClick:(event:MouseEvent)=>{if(props.open!==undefined){event.preventDefault();emit('update:open',!props.open);}}},[slots.mark && h('span',{class:'hw-verification-mark'},slots.mark()),h('span',{},label),h('span',{class:'hw-verification-toggle'},[text('detailsLabel'),icon('arrow-down-01')])]),
        h('div',{class:'hw-verification-content'},[
          h('div',{class:'hw-verification-checks'},[
            props.domain && check('link-04',text('domainLabel'),props.domain,text('domainDescription')),
            check('lock-password',text('httpsLabel'),undefined,text('httpsDescription')),
          ]),
          props.registrationHref && h('p',{class:'hw-verification-registration'},h('a',{href:props.registrationHref,target:props.registrationExternal?'_blank':undefined,rel:props.registrationExternal?'noopener noreferrer':undefined},[text('registrationLabel','registrationHref is set'),props.registrationNumber && [' ',h('bdi',{},props.registrationNumber)],props.registrationExternal && text('externalLabel','registrationHref is set and registrationExternal is on') && h('span',{class:'hw-sr-only'},' '+props.externalLabel)])),slots.default?.(),
        ]),
      ]));
    };
  },
});
