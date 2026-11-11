// Static markup for the code and prose style checks (code-block.spec.ts and
// prose.spec.ts). It is what a vanilla consumer writes: package classes only,
// no adapter and no guide CSS. Arabic and English text are both present because
// direction and locale are independent in the contract.
const span=(role:string)=>(text:string)=>`<span class="hw-code-token-${role}">${text}</span>`;
const M=span('comment'),U=span('punctuation'),K=span('keyword'),P=span('property'),S=span('string'),C=span('constant'),A=span('attribute'),G=span('tag'),T=span('type'),F=span('function');
export const syntaxRoles=['comment','punctuation','keyword','property','string','constant','attribute','tag','type','function'] as const;
// One sample per language, tagged by hand with the ten roles.
export const samples={
  ts:[
    `${M('// النص يأتي من التطبيق: the application supplies every label')}`,
    `${K('import')} ${U('{')} createButton ${U('}')} ${K('from')} ${S(`'@hawiyah/vanilla'`)}${U(';')}`,
    ``,
    `${K('interface')} ${T('SubmitOptions')} ${U('{')} ${P('label')}${U(':')} ${T('string')}${U(';')} ${P('retries')}${U(':')} ${T('number')} ${U('}')}`,
    ``,
    `${K('export')} ${K('function')} ${F('mountSubmit')}${U('(')}root${U(':')} ${T('HTMLElement')}${U(',')} options${U(':')} ${T('SubmitOptions')}${U('):')} ${T('void')} ${U('{')}`,
    `  ${K('const')} button ${U('=')} ${F('createButton')}${U('({')} ${P('label')}${U(':')} options${U('.')}${P('label')}${U(',')} ${P('variant')}${U(':')} ${S(`'primary'`)} ${U('});')}`,
    `  ${K('if')} ${U('(')}options${U('.')}${P('retries')} ${U('&gt;')} ${C('3')}${U(')')} ${K('throw')} ${K('new')} ${T('Error')}${U('(')}${S(`'محاولات كثيرة'`)}${U(');')}`,
    `  root${U('.')}${F('append')}${U('(')}button${U(');')}`,
    `${U('}')}`,
    ``,
    `${F('mountSubmit')}${U('(')}document${U('.')}${P('body')}${U(',')} ${U('{')} ${P('label')}${U(':')} ${S(`'إرسال الطلب'`)}${U(',')} ${P('retries')}${U(':')} ${C('0')} ${U('});')}`,
  ].join('\n'),
  html:[
    `${M('&lt;!-- نموذج الطلب: request form --&gt;')}`,
    `${U('&lt;')}${G('form')} ${A('class')}${U('=')}${S('"hw-stack"')} ${A('action')}${U('=')}${S('"/requests"')} ${A('method')}${U('=')}${S('"post"')}${U('&gt;')}`,
    `  ${U('&lt;')}${G('label')} ${A('class')}${U('=')}${S('"hw-label"')} ${A('for')}${U('=')}${S('"name"')}${U('&gt;')}الاسم الكامل${U('&lt;/')}${G('label')}${U('&gt;')}`,
    `  ${U('&lt;')}${G('input')} ${A('class')}${U('=')}${S('"hw-input"')} ${A('id')}${U('=')}${S('"name"')} ${A('name')}${U('=')}${S('"name"')} ${A('required')}${U('&gt;')}`,
    `  ${U('&lt;')}${G('button')} ${A('class')}${U('=')}${S('"hw-button"')} ${A('data-variant')}${U('=')}${S('"primary"')} ${A('type')}${U('=')}${S('"submit"')}${U('&gt;')}إرسال${U('&lt;/')}${G('button')}${U('&gt;')}`,
    `${U('&lt;/')}${G('form')}${U('&gt;')}`,
  ].join('\n'),
  css:[
    `${M('/* Agency theme: ألوان الجهة */')}`,
    `${K('@media')} ${U('(')}${P('min-width')}${U(':')} ${C('48rem')}${U(')')} ${U('{')}`,
    `  ${G('.portal-hero')} ${U('&gt;')} ${G('h1')} ${U('{')}`,
    `    ${P('color')}${U(':')} ${F('var')}${U('(')}${P('--hw-color-primary-text')}${U(');')}`,
    `    ${P('margin-block')}${U(':')} ${C('0')} ${C('1.5rem')}${U(';')}`,
    `    ${P('font-family')}${U(':')} ${S('"IBM Plex Sans Arabic"')}${U(',')} ${C('sans-serif')}${U(';')}`,
    `  ${U('}')}`,
    `${U('}')}`,
    `${U('[')}${A('data-hw-mode')}${U('=')}${S('"dark"')}${U(']')} ${G('.portal-hero')} ${U('{')} ${P('background')}${U(':')} ${C('#111927')} ${K('!important')}${U(';')} ${U('}')}`,
  ].join('\n'),
};
export interface ListingOptions { id:string; title?:string; code:string; wrap?:boolean; actions?:string; label?:string }
// The proposal's markup. A scrolling listing is the only tab stop and has a name; a wrapped one has neither.
export function listing({id,title,code,wrap=false,actions='',label}:ListingOptions) {
  const header=title||actions?`<figcaption class="hw-code-block-header">${title?`<span class="hw-code-block-title" id="${id}-title"><bdi dir="ltr">${title}</bdi></span>`:''}${actions?`<div class="hw-code-block-actions">${actions}</div>`:''}</figcaption>`:'';
  const name=title?`aria-labelledby="${id}-title"`:`aria-label="${label||id}"`;
  return `<figure class="hw-code-block" id="${id}"${wrap?' data-wrap="true"':''}>${header}<pre class="hw-code-block-content" dir="ltr" translate="no"${wrap?'':` tabindex="0" role="group" ${name}`}><code>${code}</code></pre></figure>`;
}
export const copyAction=`<button type="button" class="hw-button hw-icon-button" data-variant="ghost" data-size="sm" aria-label="Copy app.ts"><span class="hw-icon" data-icon="copy-01" aria-hidden="true"></span></button>`;
const longLine=`${K('const')} endpoint ${U('=')} ${S(`'https://example.gov.sa/api/v1/requests?status=open&amp;sort=created&amp;direction=descending&amp;page=1&amp;pageSize=50'`)}${U(';')}`;
export const codeBody=`
  <p id="inline">Run <code class="hw-code" id="inline-code">pnpm add @hawiyah/styles</code> then press <kbd class="hw-kbd" id="key">Ctrl</kbd> + <kbd class="hw-kbd">K</kbd>.</p>
  <p id="inline-ar" dir="rtl" lang="ar">نفّذ <code class="hw-code" id="inline-code-ar">pnpm add @hawiyah/styles</code> ثم اضغط <kbd class="hw-kbd">Enter</kbd>.</p>
  <p><a href="#x" id="code-link">Read <code class="hw-code" id="linked-code">createButton</code></a></p>
  ${listing({id:'scroll',title:'app.ts',actions:copyAction,code:`${samples.ts}\n${longLine}`})}
  ${listing({id:'wrap',title:'app.ts',wrap:true,code:`${samples.ts}\n${longLine}`})}
  ${listing({id:'bare',label:'Request form markup',code:samples.html})}
  ${listing({id:'css',title:'theme.css',code:samples.css})}
  <figure class="hw-code-block" id="override"><pre class="hw-code-block-content" dir="ltr" tabindex="0" role="group" aria-label="Highlighter theme"><code><b class="hw-code-token-keyword" id="themed">let</b></code></pre></figure>`;

// Class-less content as a Markdown renderer emits it, with components between.
export const alert=`<div class="hw-alert" data-tone="info" role="note"><div><h3>Alert heading</h3><p>Alert text with <a href="#a">a link</a> and <code>code</code>.</p><ul><li>One</li><li>Two</li></ul></div></div>`;
export const components:[string,string][]=[
  ['alert',alert],
  ['card',`<article class="hw-card"><div class="hw-card-header"><h3>Card heading</h3></div><div class="hw-card-body"><p>Card text with <a href="#c">a link</a>.</p><blockquote>Quoted</blockquote><ol><li>First</li></ol><pre>pre in a card</pre><kbd>K</kbd><hr><table><thead><tr><th>Head</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table></div></article>`],
  ['table',`<div class="hw-table-wrap" tabindex="0" role="region" aria-label="Wide table"><table class="hw-table"><caption>Caption</caption><thead><tr><th>Name</th><th>Value</th></tr></thead><tbody><tr><td>One</td><td><a href="#t">Link</a></td></tr><tr><td>Two</td><td><code>2</code></td></tr></tbody></table></div>`],
  ['accordion',`<div class="hw-accordion"><details class="hw-accordion-item" open><summary class="hw-accordion-trigger">Question</summary><div class="hw-accordion-content"><p>Answer with <a href="#q">a link</a>.</p><ul><li>Point</li></ul></div></details></div>`],
  ['breadcrumb',`<nav class="hw-breadcrumb" aria-label="Breadcrumb"><ol><li><a href="#h">Home</a></li><li><a href="#s">Section</a></li><li><span aria-current="page">Page</span></li></ol></nav>`],
  ['list',`<ul class="hw-list-icon"><li>Icon item <a href="#l">link</a></li><li>Second<ul><li>Nested</li></ul></li></ul>`],
  ['type',`<p class="hw-type" data-scale="body-sm" data-tone="muted">Muted caption <a href="#m">link</a> <small>small</small></p>`],
  ['code-block',listing({id:'nested-listing',title:'nested.ts',code:samples.ts})],
  ['empty',`<section class="hw-empty"><h2>Nothing here</h2><p>Empty state text.</p><dl><dt>Term</dt><dd>Detail</dd></dl><figure><img alt="" width="40" height="20" src="data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA="><figcaption>Caption</figcaption></figure></section>`],
];
export const proseBody=`<article class="hw-prose" id="prose">
  <h1 id="title">Request service <span lang="ar" dir="rtl">خدمة الطلبات</span></h1>
  <p id="lead">Paragraph with <a href="#api" id="link">an internal link</a>, <a href="https://example.gov.sa" target="_blank" rel="noopener" id="external">an external one</a>, <strong>strong</strong> text, <code id="p-code">hw-prose</code> and <kbd id="p-kbd">Tab</kbd>. <small id="small">Small print.</small></p>
  <h2 id="api">API</h2>
  <p id="after-heading">The second paragraph is long enough to reach the paragraph measure on a wide page, so that the check can tell a limited block from an unlimited one without depending on the viewport of the test run that happens to execute it.</p>
  <ul id="ul"><li id="li-1">First item</li><li id="li-2">Second item<ul id="ul-nested"><li>Nested item</li></ul></li></ul>
  <ol id="ol"><li>Step one</li><li><p>Step two</p><p id="li-p">Second paragraph in a step</p></li></ol>
  <dl id="dl"><dt id="dt">Term</dt><dd id="dd">Definition</dd><dt id="dt-2">Second term</dt><dd>Second definition</dd></dl>
  <blockquote id="quote"><p>Quoted paragraph.</p><p id="quote-p">Second quoted paragraph.</p></blockquote>
  <h3 id="h3">Heading three</h3>
  <h4 id="h4">Heading four</h4>
  <h5 id="h5">Heading five</h5>
  <h6 id="h6">Heading six</h6>
  <pre id="pre"><code class="language-ts">const value = 'a long class-less listing line that has to scroll inside its own box and never widen the page around it, whatever the viewport is';</code></pre>
  <hr id="hr">
  <table id="table"><caption>Bare table</caption><thead><tr><th id="th">Property</th><th>Description</th></tr></thead><tbody><tr><td id="td">labelHidden</td><td>AVeryLongUnbrokenIdentifierThatWouldOtherwiseWidenTheTableBeyondTheContainerAtThreeHundredAndTwentyPixels</td></tr><tr><td id="td-last">size</td><td>Second row</td></tr></tbody></table>
  <figure id="figure"><img id="img" alt="Wide diagram" width="1600" height="400" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='400'%3E%3Crect width='1600' height='400' fill='%23888'/%3E%3C/svg%3E"><figcaption id="figcaption">Figure caption</figcaption></figure>
  <p class="app-own" id="classed">A paragraph with a class is the application's.</p>
  ${alert.replace('class="hw-alert"','class="hw-alert" id="alert"')}
  ${listing({id:'prose-listing',title:'app.ts',code:samples.ts})}
  <p id="last">Last paragraph.</p>
</article>`;
// Three controls in the header actions, as the guide shell has them.
export const portalHeader=(actionsClass:string,text:{brand:string;menu:string;search:string;language:string;mode:string;links:string[]})=>`<header class="hw-portal-header" id="header">
  <a class="hw-portal-brand" href="#" id="brand">${text.brand}</a>
  <button type="button" class="hw-button hw-portal-menu-toggle" data-variant="ghost" aria-expanded="false" aria-controls="portal-nav" id="menu">${text.menu}</button>
  <nav id="portal-nav" data-open="false" aria-label="${text.menu}"><ul>${text.links.map(link=>`<li><a href="#">${link}</a></li>`).join('')}</ul></nav>
  <div class="${actionsClass}" id="actions">
    <button type="button" class="hw-button" data-variant="outline" id="search"><span class="hw-icon" data-icon="search-01" aria-hidden="true"></span>${text.search}</button>
    <button type="button" class="hw-button" data-variant="ghost" id="language"><span class="hw-icon" data-icon="translate" aria-hidden="true"></span>${text.language}</button>
    <button type="button" class="hw-button" data-variant="ghost" id="mode"><span class="hw-icon" data-icon="moon-02" aria-hidden="true"></span>${text.mode}</button>
  </div>
</header>`;
