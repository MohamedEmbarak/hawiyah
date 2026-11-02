<script setup lang="ts">
import { ref } from 'vue';
import { Checkbox, Radio, Card, Button, IconButton, InputGroup, TextField, Alert, Badge, ToastRegion, PortalHeader, PortalFooter } from '@nasaq/vue';
const statusMessages = ref<import('@nasaq/vue').ToastMessage[]>(['neutral','info','success','warning','danger'].map(tone => ({id:tone,tone: tone as 'neutral'|'info'|'success'|'warning'|'danger',title:tone,message:'تفاصيل الإشعار'})));
const choiceRadio = ref('a');
const buttonCount = ref(0);
const english = ref(false); const disabled = ref(true); const activations = ref(0);
const t = (ar: string, en: string) => english.value ? en : ar;
</script>
<template>
  <main class="nq-container nq-stack" data-testid="nic-showcase" data-nq-theme="dga" :lang="english ? 'en' : 'ar'" :dir="english ? 'ltr' : 'rtl'" style="padding-block:2rem;background:var(--nq-color-canvas);color:var(--nq-color-text)">
    <h1>{{ t('مرجع واجهة المركز', 'NIC UI reference') }}</h1>
    <button class="nq-button" @click="english = !english">{{ english ? 'العربية' : 'English' }}</button>
<section class="nq-stack" :aria-label="t('الأزرار', 'Buttons')" data-testid="button-showcase"><div class="nq-cluster"><span style="padding:4px;"><Button data-testid="button-primary" variant="primary" @click="buttonCount++">{{ t('أساسي', 'primary') }}</Button></span><span style="padding:4px;"><Button data-testid="button-default" variant="default" @click="buttonCount++">{{ t('داكن', 'default') }}</Button></span><span style="padding:4px;"><Button data-testid="button-secondary" variant="secondary" @click="buttonCount++">{{ t('ثانوي', 'secondary') }}</Button></span><span style="padding:4px;"><Button data-testid="button-outline" variant="outline" @click="buttonCount++">{{ t('بإطار', 'outline') }}</Button></span><span style="padding:4px;background:#14573a"><Button data-testid="button-outline-white" variant="outline-white" @click="buttonCount++">{{ t('إطار أبيض', 'outline-white') }}</Button></span><span style="padding:4px;background:#14573a"><Button data-testid="button-light" variant="light" @click="buttonCount++">{{ t('أبيض', 'light') }}</Button></span><span style="padding:4px;"><Button data-testid="button-danger" variant="danger" @click="buttonCount++">{{ t('خطر', 'danger') }}</Button></span><span style="padding:4px;"><Button data-testid="button-ghost" variant="ghost" @click="buttonCount++">{{ t('خفيف', 'ghost') }}</Button></span><span style="padding:4px;"><Button data-testid="button-soft" variant="soft" @click="buttonCount++">{{ t('هادئ', 'soft') }}</Button></span><span style="padding:4px;"><Button data-testid="button-link" variant="link" @click="buttonCount++">{{ t('رابط', 'link') }}</Button></span></div>
      <Button data-testid="button-disabled" disabled @click="buttonCount++">{{ t('غير متاح', 'Disabled') }}</Button>
      <Button data-testid="button-loading" loading @click="buttonCount++">{{ t('جارٍ الحفظ', 'Saving') }}</Button>
      <IconButton data-testid="button-icon" variant="default" :label="t('إضافة', 'Add')" @click="buttonCount++">+</IconButton>
      <output data-testid="button-count">{{ buttonCount }}</output></section>
<section class="nq-stack" data-testid="status-showcase" :aria-label="t('الحالات', 'Statuses')"><Alert data-testid="alert-neutral" tone="neutral" title="neutral" role="group"><p>{{ t('تفاصيل الحالة', 'Status details') }}</p></Alert><Badge tone="neutral" data-variant="dot">neutral</Badge><Alert data-testid="alert-info" tone="info" title="info" role="group"><p>{{ t('تفاصيل الحالة', 'Status details') }}</p></Alert><Badge tone="info" data-variant="dot">info</Badge><Alert data-testid="alert-success" tone="success" title="success" role="group"><p>{{ t('تفاصيل الحالة', 'Status details') }}</p></Alert><Badge tone="success" data-variant="dot">success</Badge><Alert data-testid="alert-warning" tone="warning" title="warning" role="group"><p>{{ t('تفاصيل الحالة', 'Status details') }}</p></Alert><Badge tone="warning" data-variant="dot">warning</Badge><Alert data-testid="alert-danger" tone="danger" title="danger" role="group"><p>{{ t('تفاصيل الحالة', 'Status details') }}</p></Alert><Badge tone="danger" data-variant="dot">danger</Badge><Alert data-testid="alert-outline" tone="success" variant="outline" title="Outline" role="group"><p>Details</p></Alert><Alert data-testid="alert-minimal" tone="warning" variant="minimal" title="Minimal" role="group"><p>Details</p></Alert>
      <ToastRegion data-testid="status-toasts" data-variant="inline" :messages="statusMessages" @dismiss="id => statusMessages = statusMessages.filter(item => item.id !== id)" />
    </section><section data-testid="chrome-showcase" @click="event => { if ((event.target as Element).closest('a[href]')) event.preventDefault(); }">
      <PortalHeader brand="نسق" home-href="/" main-id="nic-demo-main" :links="[{label:t('الخدمات','Services'),href:'/services',current:true},{label:t('طلباتي','My requests'),href:'/requests'}]"><template #actions><Button>{{ t('تسجيل الدخول','Sign in') }}</Button></template></PortalHeader>
      <section id="nic-demo-main" tabindex="-1"><h2>{{ t('محتوى الصفحة','Page content') }}</h2></section>
      <PortalFooter brand="نسق" :links="[{label:t('الخصوصية','Privacy'),href:'/privacy'},{label:t('تواصل معنا','Contact'),href:'/contact'}]" copyright="2026"><p>{{ t('منصة توضيحية','Example platform') }}</p></PortalFooter>
    </section>
    <section data-testid="choices-showcase" class="nq-stack">
      <Checkbox id="nic-check" label="Checkbox" /><Checkbox id="nic-mixed" label="Mixed" indeterminate />
      <Checkbox id="nic-disabled" label="Disabled" disabled :default-value="true" />
      <Checkbox id="nic-readonly" label="Read only" read-only :default-value="true" />
      <Radio id="nic-radio-a" name="nic-radio" value="a" label="First radio" v-model="choiceRadio" />
      <Radio id="nic-radio-b" name="nic-radio" value="b" label="Second radio" v-model="choiceRadio" />
      <Radio id="nic-radio-readonly" name="nic-radio" value="locked" label="Read only radio" read-only v-model="choiceRadio" />
    </section><section class="nq-field" data-testid="group-example"><label class="nq-label" for="group-email">{{ t('البريد الإلكتروني','Email') }}</label><InputGroup data-testid="group-field"><template #prefix>@</template><TextField id="group-email" name="group-email" type="email" default-value="ready@example.test" required /></InputGroup></section>
    <section class="nq-grid" style="--nq-layout-columns:1;--nq-layout-columns-md:2">
      <Card data-testid="base-card"><template #header><h2 class="nq-card-title">{{ t('بطاقة معلومات', 'Information card') }}</h2></template><p class="nq-card-description">{{ t('محتوى واضح بمسافات موحدة.', 'Clear content with consistent spacing.') }}</p><template #footer><span>{{ t('تفاصيل إضافية', 'Additional details') }}</span></template></Card>
      <Card data-testid="border-card" variant="outlined"><template #header><h2 class="nq-card-title">{{ t('بطاقة بإطار', 'Bordered card') }}</h2></template><p class="nq-card-description">{{ t('إطار دون ظل.', 'A border without a shadow.') }}</p></Card>
      <Card data-testid="action-card" href="#card-destination"><template #header><h2 class="nq-card-title">{{ t('عرض التفاصيل', 'View details') }}</h2></template><p class="nq-card-description">{{ t('الرابط يشمل البطاقة كاملة.', 'The complete card is a native link.') }}</p></Card>
      <Card data-testid="disabled-card" href="#disabled-destination" :disabled="disabled" @click="activations++"><template #header><h2 class="nq-card-title">{{ t('خدمة اختيارية', 'Optional service') }}</h2></template><p class="nq-card-description">{{ t('يمكن تغيير إتاحتها.', 'Availability can be changed.') }}</p></Card>
    </section>
    <button class="nq-button" data-testid="toggle-card" @click="disabled = !disabled">{{ t('تغيير الإتاحة', 'Toggle availability') }}</button>
    <output data-testid="card-activations">{{ activations }}</output>
    <h2 id="card-destination" tabindex="-1">{{ t('تفاصيل البطاقة', 'Card details') }}</h2>
    <h2 id="disabled-destination" tabindex="-1">{{ t('الخدمة الاختيارية', 'Optional service details') }}</h2>
  </main>
</template>
