<script setup lang="ts">
import { ref } from 'vue';
import { Checkbox, SearchField, PasswordField, Rating, Slider, Stepper, Switch } from '@hawiyah/vue';
const arabic = ref(true);
const t = (ar: string, en: string) => arabic.value ? ar : en;
</script>

<template>
  <main class="hw-container hw-stack" data-testid="input-controls" data-hw-theme="dga" :dir="arabic ? 'rtl' : 'ltr'" :lang="arabic ? 'ar' : 'en'" style="max-width:40rem;padding:1rem;--hw-layout-gap:1.5rem">
    <h1>{{ t('معاينة حقول هوية', 'Hawiyah input preview') }}</h1>
    <button class="hw-button" type="button" @click="arabic = !arabic">{{ arabic ? 'English' : 'العربية' }}</button>
    <form class="hw-stack" @submit.prevent>
      <SearchField name="query" :label="t('بحث', 'Search')" :clear-label="t('مسح البحث', 'Clear search')" default-value="Hawiyah" />
      <PasswordField name="password" :label="t('كلمة المرور', 'Password')" :show-label="t('إظهار كلمة المرور', 'Show password')" :hide-label="t('إخفاء كلمة المرور', 'Hide password')" autocomplete="new-password" />
      <PasswordField name="text-password" :label="t('كلمة المرور مع زر نصي', 'Password with text toggle')" toggle-variant="text" :show-label="t('إظهار', 'Show')" :hide-label="t('إخفاء', 'Hide')" autocomplete="new-password" />
      <Rating name="rating" :label="t('التقييم', 'Rating')" :default-value="3" :get-rating-label="(value, max) => t(`${value} من ${max}`, `${value} of ${max}`)" />
      <Slider name="readonly-slider" :label="t('نطاق للقراءة فقط', 'Read-only range')" :default-value="30" readonly />
      <Checkbox name="consent" :label="t('أوافق على الشروط', 'I agree to the terms')" />
      <button class="hw-button" type="reset">{{ t('إعادة ضبط', 'Reset') }}</button>
    </form>
    <section class="hw-stack" data-testid="mobile-switches" data-hw-density="mobile" :aria-label="t('أحجام مفاتيح التبديل', 'Switch sizing')">
      <Switch name="mobile-switch" :label="t('تبديل الجوال', 'Mobile switch')" />
      <Switch name="mobile-switch-disabled" :label="t('تبديل معطل', 'Disabled switch')" disabled />
      <div data-hw-density="comfortable"><Switch name="desktop-switch" :label="t('تبديل مريح', 'Comfortable switch')" /></div>
      <div data-hw-density="compact"><Switch name="compact-switch" :label="t('تبديل مضغوط', 'Compact switch')" /></div>
    </section>
    <Stepper :label="t('التقدم', 'Progress')" :active-index="1" style="--hw-step-current-background:#4f378b" :items="[{value:'details', label:t('البيانات','Details')}, {value:'review', label:t('المراجعة','Review')}, {value:'send', label:t('الإرسال','Submit')}]" />
  </main>
</template>
