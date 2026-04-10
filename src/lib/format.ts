export function formatResourceDate(dateStr: string, language: string): string {
  return new Date(dateStr).toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-US');
}
