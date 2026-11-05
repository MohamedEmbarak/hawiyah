/** Local e-Participation export headings, referenced in docs/dga-participation.md. */
export const participationTopics = [
  {id: 'consultations', title: ['Consultations', 'الاستشارات الإلكترونية'], description: ['Review proposals and share your views before decisions are made.', 'اطلع على المقترحات وشارك رأيك قبل اتخاذ القرارات.'], route: 'feedback'},
  {id: 'ideas', title: ['Co-Creation and Ideas', 'التطوير المشترك والأفكار'], description: ['Contribute ideas to improve services and develop solutions together.', 'ساهم بأفكارك لتحسين الخدمات وتطوير الحلول بشكل مشترك.'], route: 'contact'},
  {id: 'open-data', title: ['Open Data', 'البيانات المفتوحة'], description: ['Explore available data, its usage policy and ways to request datasets.', 'استكشف البيانات المتاحة وسياسة استخدامها وطرق طلب مجموعات البيانات.'], route: 'content'},
  {id: 'policy', title: ['E-Participation Policy', 'سياسة المشاركة الإلكترونية'], description: ['Read the participation rules, responsibilities and moderation policy.', 'اطلع على ضوابط المشاركة والمسؤوليات وسياسة الإشراف.'], route: 'content'},
  {id: 'social', title: ['Social Media', 'وسائل التواصل الاجتماعي'], description: ['Find official communication channels and their usage guidelines.', 'تعرف على قنوات التواصل الرسمية وضوابط استخدامها.'], route: 'contact'},
  {id: 'feedback', title: ['Complaints and Suggestions', 'الشكاوى والمقترحات'], description: ['Submit a complaint or suggestion through the available support channels.', 'قدم شكوى أو مقترحًا عبر قنوات الدعم المتاحة.'], route: 'support'},
  {id: 'reports', title: ['Beneficiary Voice Reports', 'تقارير صوت المستفيد'], description: ['Review beneficiary feedback and the improvements informed by it.', 'اطلع على ملاحظات المستفيدين والتحسينات المبنية عليها.'], route: 'content'},
  {id: 'performance', title: ['Portal and Service Performance Statistics', 'إحصائيات أداء البوابة والخدمات'], description: ['Review published measures of service completion and beneficiary satisfaction.', 'اطلع على مؤشرات إنجاز الخدمات ورضا المستفيدين المنشورة.'], route: 'content'},
] as const;
