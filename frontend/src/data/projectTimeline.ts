// projectTimeline.ts ─────────────────────────────────────────────────────────
//
// The Atlas's OWN change log — what changed in the project itself, one row per
// milestone. Every row is traceable to a commit in this repository:
//
//   git log -1 --date=short --pretty=format:'%h|%ad|%s' <commit>
//
// NOT to be confused with src/data/timeline.ts, which is the UAE-ECOSYSTEM
// timeline (1971 → 2030) rendered by Context / Stats. This file is the project
// history (2026-03 → today) rendered by the widget on /about.
//
// No version numbers are invented: the repository carries no tags and
// package.json stays at 0.1.0, so a milestone is identified by its date plus
// the short commit hash it was taken from. `kind` mirrors the
// conventional-commit type of that commit (feat → feature, data/zerotrust/
// routines → data, ui/perf/docs-palette → design, ci/build → infra).
//
// Rows are stored oldest-first; the widget renders newest-first.
// ─────────────────────────────────────────────────────────────────────────────

export type ProjectMilestoneKind = 'feature' | 'data' | 'design' | 'fix' | 'infra';

export interface ProjectMilestone {
  /** Sequential id — stable React key. */
  id: string;
  /** Real commit date, ISO `YYYY-MM-DD` (git log --date=short). */
  date: string;
  /** Short commit hash this row was derived from. */
  commit: string;
  kind: ProjectMilestoneKind;
  title: { en: string; ar: string };
  detail: { en: string; ar: string };
}

export const projectMilestones: ProjectMilestone[] = [
  {
    id: 'pt-01',
    date: '2026-03-23',
    commit: '8f05c6a',
    kind: 'infra',
    title: { en: 'Project start', ar: 'بداية المشروع' },
    detail: {
      en: 'Initial commit — the first healthcare-AI maps ship as a Next.js site.',
      ar: 'أول التزام — تنشر الخرائط الأولى للذكاء الاصطناعي الصحي كموقع Next.js.',
    },
  },
  {
    id: 'pt-02',
    date: '2026-03-24',
    commit: '83ca72f',
    kind: 'infra',
    title: { en: 'Automated deployment', ar: 'نشر آلي' },
    detail: {
      en: 'CI/CD workflow: every push to main builds and deploys the site.',
      ar: 'مسار CI/CD: كل دفع إلى main يبني الموقع وينشره.',
    },
  },
  {
    id: 'pt-03',
    date: '2026-04-22',
    commit: 'ad5d8cf',
    kind: 'infra',
    title: { en: 'Move to the Vite app', ar: 'الانتقال إلى تطبيق Vite' },
    detail: {
      en: 'Directory hubs, Events, Privacy and Contact reunified in one Vite app with shared page headers.',
      ar: 'تُجمع مراكز الدليل والفعاليات والخصوصية والتواصل في تطبيق Vite واحد بعناوين صفحات موحّدة.',
    },
  },
  {
    id: 'pt-04',
    date: '2026-05-03',
    commit: '060a51c',
    kind: 'feature',
    title: { en: 'UAE-first framing dropped', ar: 'إزالة إطار الإمارات أولاً' },
    detail: {
      en: 'Landing pages go multi-region; the clinician role is renamed to student.',
      ar: 'تصبح الصفحات الرئيسية متعددة المناطق؛ ويُعاد تسمية دور الطبيب إلى طالب.',
    },
  },
  {
    id: 'pt-05',
    date: '2026-05-17',
    commit: '07573a8',
    kind: 'data',
    title: { en: 'Sourced-claims data pipeline', ar: 'مسار بيانات بمراجع موثّقة' },
    detail: {
      en: 'xlsx → CSV → Airtable pipeline: every claim carries a source, nothing is hand-typed into the site.',
      ar: 'مسار xlsx → CSV → Airtable: كل معلومة تحمل مصدرها، ولا شيء يُكتب يدوياً في الموقع.',
    },
  },
  {
    id: 'pt-06',
    date: '2026-05-17',
    commit: 'e1fb5de',
    kind: 'data',
    title: { en: 'Daily Open Calls digest', ar: 'ملخّص يومي للدعوات المفتوحة' },
    detail: {
      en: 'A seed source list and a documented daily routine — Open Calls stop being a one-off edit.',
      ar: 'قائمة مصادر وروتين يومي موثّق — الدعوات المفتوحة لم تعد تعديلاً لمرة واحدة.',
    },
  },
  {
    id: 'pt-07',
    date: '2026-05-20',
    commit: 'e7f57fd',
    kind: 'feature',
    title: { en: 'Founder Toolkit and ⌘K search', ar: 'أدوات المؤسس وبحث ⌘K' },
    detail: {
      en: 'aisafety-style information architecture: the Founder Toolkit and global ⌘K search land.',
      ar: 'بنية معلومات على نمط aisafety: إطلاق أدوات المؤسس وبحث ⌘K العام.',
    },
  },
  {
    id: 'pt-08',
    date: '2026-05-25',
    commit: '49a88e6',
    kind: 'design',
    title: { en: 'Monochrome palette strategy', ar: 'استراتيجية اللون الأحادي' },
    detail: {
      en: 'Written decision: categories are separated by label, outline and weight — never by colour.',
      ar: 'قرار مدوّن: تُفصل الفئات بالنص والإطار والوزن — لا باللون.',
    },
  },
  {
    id: 'pt-09',
    date: '2026-05-26',
    commit: '0473193',
    kind: 'feature',
    title: { en: 'Healthcare AI Jobs', ar: 'وظائف الذكاء الاصطناعي الصحي' },
    detail: {
      en: 'The 2026 jobs board, fed by an extractor reading the same sourced pipeline.',
      ar: 'لوحة الوظائف 2026، تغذّيها أداة استخراج تقرأ المسار الموثّق نفسه.',
    },
  },
  {
    id: 'pt-10',
    date: '2026-05-27',
    commit: '512042b',
    kind: 'design',
    title: { en: 'Jobs and Open Calls aligned', ar: 'توحيد الوظائف والدعوات المفتوحة' },
    detail: {
      en: 'One card language, animated counters and load-more across both directories.',
      ar: 'لغة بطاقة واحدة وعدّادات متحركة وزر «عرض المزيد» في الدليلين.',
    },
  },
  {
    id: 'pt-11',
    date: '2026-06-09',
    commit: '722aae3',
    kind: 'fix',
    title: { en: 'Contrast fixed and guarded', ar: 'إصلاح التباين وحمايته' },
    detail: {
      en: 'Job badges failed light-mode contrast; fixed and pinned by a WCAG AA test in CI.',
      ar: 'فشلت شارات الوظائف في تباين الوضع الفاتح؛ أُصلحت وثُبّتت باختبار WCAG AA في CI.',
    },
  },
  {
    id: 'pt-12',
    date: '2026-07-23',
    commit: '5427c84',
    kind: 'design',
    title: { en: 'Scroll reveal, sticky hub tabs', ar: 'كشف عند التمرير وأشرطة تبويب ثابتة' },
    detail: {
      en: 'Shared scroll motion and pinned tab bars land across the domain hubs.',
      ar: 'حركة تمرير موحّدة وأشرطة تبويب مثبّتة في جميع مراكز المجالات.',
    },
  },
  {
    id: 'pt-13',
    date: '2026-07-31',
    commit: '86f710d',
    kind: 'design',
    title: { en: 'Una copilot, monochrome pass', ar: 'مساعد Una ومراجعة اللون الأحادي' },
    detail: {
      en: "Una's research copilot joins the workflow and the monochrome pass is applied site-wide.",
      ar: 'ينضم مساعد البحث Una إلى العمل وتُطبَّق المراجعة الأحادية على الموقع كله.',
    },
  },
  {
    id: 'pt-14',
    date: '2026-09-13',
    commit: '545efc5',
    kind: 'data',
    title: { en: 'Deadlines quoted as issued', ar: 'المواعيد كما يصيغها المُصدر' },
    detail: {
      en: "Open Calls keep the issuer's own deadline wording, enforced by an integrity test on every push.",
      ar: 'تحفظ الدعوات المفتوحة صياغة المُصدر للموعد، ويفرض ذلك اختبار سلامة عند كل دفع.',
    },
  },
  {
    id: 'pt-15',
    date: '2026-09-14',
    commit: '7065fd7',
    kind: 'feature',
    title: { en: 'Biosecurity hub', ar: 'مركز الأمن الحيوي' },
    detail: {
      en: 'A sixth domain hub — the Biosecurity World organisation landscape.',
      ar: 'مركز مجال سادس — مشهد منظمات الأمن الحيوي.',
    },
  },
  {
    id: 'pt-16',
    date: '2026-09-27',
    commit: 'cca1267',
    kind: 'feature',
    title: { en: 'Freshness notices', ar: 'إشعارات الحداثة' },
    detail: {
      en: 'Jobs and Open Calls state how old the data is, with update / join / support actions.',
      ar: 'توضح الوظائف والدعوات المفتوحة عمر البيانات مع إجراءات تحديث أو انضمام أو دعم.',
    },
  },
  {
    id: 'pt-17',
    date: '2026-10-10',
    commit: '1fb5cd2',
    kind: 'design',
    title: { en: 'Faster first load', ar: 'تحميل أولي أسرع' },
    detail: {
      en: 'Bundle split and a visible loader replace the white screen; budgets checked in CI.',
      ar: 'تقسيم الحزمة ومؤشر تحميل مرئي بدلاً من الشاشة البيضاء، مع ميزانيات في CI.',
    },
  },
  {
    id: 'pt-18',
    date: '2026-10-31',
    commit: 'ffc0ac2',
    kind: 'fix',
    title: { en: 'Airtable CTAs retired', ar: 'استبدال روابط Airtable' },
    detail: {
      en: 'Dead Airtable contribute links replaced by LinkedIn and the contact routes.',
      ar: 'استُبدلت روابط المساهمة الميتة في Airtable بـ LinkedIn وصفحات التواصل.',
    },
  },
  {
    id: 'pt-19',
    date: '2026-11-01',
    commit: 'a418667',
    kind: 'data',
    title: { en: "Una's scouts ingested", ar: 'استيعاب نتائج Una' },
    detail: {
      en: "Open Calls gain entries ingested from Una's local markdown — curated TS only, local sources never shipped.",
      ar: 'تضيف الدعوات المفتوحة مدخلات مستوعبة من ملفات Una المحلية — بيانات منقّحة فقط، والمصادر المحلية لا تُنشر.',
    },
  },
  {
    id: 'pt-20',
    date: '2026-11-02',
    commit: '4b246f1',
    kind: 'feature',
    title: { en: 'Events page, toolkit contents', ar: 'صفحة الفعاليات وفهرس الأدوات' },
    detail: {
      en: 'A dedicated /events page with verified conference data, plus a numbered contents index for the Founder Toolkit.',
      ar: 'صفحة /events مخصّصة ببيانات مؤتمرات متحقق منها، وفهرس مرقّم لأدوات المؤسس.',
    },
  },
];
