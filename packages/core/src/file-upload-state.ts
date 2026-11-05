/** Transfer status is supplied by the host that performs the upload. */
export interface FileUploadItem {
  id: string;
  name: string;
  status: 'selected' | 'uploading' | 'complete' | 'error';
  message?: string;
  progress?: number;
  removable?: boolean;
}

export function fileUploadProgress(value: number | undefined): number | undefined {
  return value === undefined || !Number.isFinite(value) ? undefined : Math.min(100, Math.max(0, value));
}

export const fileUploadLabels = {
  selected: 'جاهز للرفع', uploading: 'جارٍ الرفع', complete: 'اكتمل الرفع', error: 'تعذر الرفع', remove: 'إزالة الملف',
};
export type FileUploadLabels = typeof fileUploadLabels;
