<script setup lang="ts">
import { ref } from 'vue';
import { Card } from '@nasaq/vue';
const english = ref(false); const disabled = ref(true); const activations = ref(0);
const t = (ar: string, en: string) => english.value ? en : ar;
</script>
<template>
  <main class="nq-container nq-stack" data-testid="nic-showcase" data-nq-theme="dga" :lang="english ? 'en' : 'ar'" :dir="english ? 'ltr' : 'rtl'" style="padding-block:2rem">
    <h1>{{ t('مرجع واجهة المركز', 'NIC UI reference') }}</h1>
    <button class="nq-button" @click="english = !english">{{ english ? 'العربية' : 'English' }}</button>
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
