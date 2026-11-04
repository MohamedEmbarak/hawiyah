import './foundation-examples.css';
import type { Locale } from './data';

const scales = ['display-2xl', 'display-xl', 'display-lg', 'display-md', 'display-sm', 'display-xs', 'heading-lg', 'heading-md', 'heading-sm', 'body-xl', 'body-lg', 'body-md', 'body-sm', 'body-xs'] as const;
const elevations = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

export function foundationExamples(locale: Locale): string {
  const t = (en: string, ar: string) => locale === 'ar' ? ar : en;
  const sample = t('Public services', 'الخدمات العامة');
  const passage = t('You can return to your service request at any time to review its details, add a supporting document, or check the status of your application.',
    'يمكنك العودة إلى طلب الخدمة في أي وقت لمراجعة تفاصيله أو إضافة مستند داعم أو متابعة حالة الطلب.');
  return `<section class="section foundation-recipes" aria-labelledby="type-scale-title">
    <h2 id="type-scale-title">${t('Typography and elevation', 'الخطوط والظلال')}</h2>
    <p>${t('Choose a visual scale independently of the HTML heading level.', 'اختر مقياس الخط المرئي بشكل مستقل عن مستوى العنوان.')}</p>
    <details><summary>${t('Compare all 14 type styles', 'مقارنة أنماط الخط الأربعة عشر')}</summary>
      <div class="foundation-scale-list">${scales.map(scale => `<div><code>${scale}</code><p class="nq-type" data-scale="${scale}">${sample}</p></div>`).join('')}</div>
    </details>
    <h3>${t('Two-line excerpt', 'مقتطف من سطرين')}</h3>
    <div class="foundation-excerpt"><p class="nq-type nq-line-clamp" data-scale="body-md" data-lines="2">${passage}</p>
      <details><summary>${t('Read the full text', 'قراءة النص الكامل')}</summary><p>${passage}</p></details></div>
    <h3>${t('Elevation levels', 'مستويات الظلال')}</h3>
    <div class="foundation-elevations">${elevations.map(level => `<div style="box-shadow:var(--nq-shadow-${level})"><code>--nq-shadow-${level}</code></div>`).join('')}</div>
  </section>`;
}
