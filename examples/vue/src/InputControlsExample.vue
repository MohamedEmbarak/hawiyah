<script setup lang="ts">
import { ref } from 'vue';
import { Checkbox, PasswordField, Rating, Slider, Stepper } from '@nasaq/vue';
const arabic = ref(true);
const t = (ar: string, en: string) => arabic.value ? ar : en;
</script>

<template>
  <main class="nq-container nq-stack" data-testid="input-controls" data-nq-theme="dga" :dir="arabic ? 'rtl' : 'ltr'" :lang="arabic ? 'ar' : 'en'" style="max-width:40rem;padding:1rem;--nq-layout-gap:1.5rem">
    <h1>{{ t('معاينة حقول نسق', 'Nasaq input preview') }}</h1>
    <button class="nq-button" type="button" @click="arabic = !arabic">{{ arabic ? 'English' : 'العربية' }}</button>
    <form class="nq-stack" @submit.prevent>
      <PasswordField name="password" :label="t('كلمة المرور', 'Password')" :show-label="t('إظهار كلمة المرور', 'Show password')" :hide-label="t('إخفاء كلمة المرور', 'Hide password')" autocomplete="new-password" />
      <PasswordField name="text-password" :label="t('كلمة المرور مع زر نصي', 'Password with text toggle')" toggle-variant="text" :show-label="t('إظهار', 'Show')" :hide-label="t('إخفاء', 'Hide')" autocomplete="new-password" />
      <Rating name="rating" :label="t('التقييم', 'Rating')" :default-value="3" :option-label="(value, max) => t(`${value} من ${max}`, `${value} of ${max}`)" />
      <Slider name="readonly-slider" :label="t('نطاق للقراءة فقط', 'Read-only range')" :default-value="30" readonly />
      <Checkbox name="consent" :label="t('أوافق على الشروط', 'I agree to the terms')" />
      <button class="nq-button" type="reset">{{ t('إعادة ضبط', 'Reset') }}</button>
    </form>
    <Stepper :label="t('التقدم', 'Progress')" :active-index="1" style="--nq-step-current-background:#4f378b" :items="[{value:'details', label:t('البيانات','Details')}, {value:'review', label:t('المراجعة','Review')}, {value:'send', label:t('الإرسال','Submit')}]" />
  </main>
</template>
