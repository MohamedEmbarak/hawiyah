import {defineComponent,h,mergeProps,ref} from 'vue';
import {getSiteVerificationLabels} from '@hawiyah/core';

export const SiteVerification=defineComponent({
  name:'HwSiteVerification',inheritAttrs:false,
  props:{locale:{type:String,default:'ar'},label:String,detailsLabel:String,domainLabel:String,domainDescription:String,httpsLabel:String,httpsDescription:String,registrationLabel:String,domain:String,registrationHref:String,registrationNumber:String,externalLabel:String,registrationExternal:{type:Boolean,default:true},open:{type:Boolean,default:undefined},defaultOpen:Boolean},
  emits:{'update:open':(_open:boolean)=>true},
  setup(props,{attrs,slots,emit}) {
    const localOpen=ref(props.defaultOpen);
    const icon=(name:string)=>h('span',{class:'hw-icon','data-icon':name,'aria-hidden':'true'});
    return ()=>{
      const copy=getSiteVerificationLabels(props.locale),expanded=props.open ?? localOpen.value;
      const check=(name:string,title:string,value:string,description:string)=>h('section',{},[icon(name),h('div',{},[h('h2',{},[title,' ',h('bdi',{},value)]),h('p',{},description)])]);
      return h('aside',mergeProps(attrs,{class:'hw-site-verification','aria-label':attrs['aria-label'] ?? props.label ?? copy.label}),h('details',{
        open:expanded,onToggle:(event:Event)=>{const next=(event.currentTarget as HTMLDetailsElement).open;if(next!==expanded){localOpen.value=next;emit('update:open',next);}},
      },[
        h('summary',{onClick:(event:MouseEvent)=>{if(props.open!==undefined){event.preventDefault();emit('update:open',!props.open);}}},[slots.mark && h('span',{class:'hw-verification-mark'},slots.mark()),h('span',{},props.label ?? copy.label),h('span',{class:'hw-verification-toggle'},[props.detailsLabel ?? copy.detailsLabel,icon('arrow-down-01')])]),
        h('div',{class:'hw-verification-content'},[
          h('div',{class:'hw-verification-checks'},[
            props.domain && check('link-04',props.domainLabel ?? copy.domainLabel,props.domain,props.domainDescription ?? copy.domainDescription),
            check('lock-password',props.httpsLabel ?? copy.httpsLabel,'HTTPS',props.httpsDescription ?? copy.httpsDescription),
          ]),
          props.registrationHref && h('p',{class:'hw-verification-registration'},h('a',{href:props.registrationHref,target:props.registrationExternal?'_blank':undefined,rel:props.registrationExternal?'noopener noreferrer':undefined},[props.registrationLabel ?? copy.registrationLabel,props.registrationNumber && [' ',h('bdi',{},props.registrationNumber)],props.registrationExternal && h('span',{class:'hw-sr-only'},' · '+(props.externalLabel ?? copy.externalLabel))])),slots.default?.(),
        ]),
      ]));
    };
  },
});
