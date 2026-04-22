import { Tool } from '@/types';

export const analysisTools: Tool[] = [
  {
    id: 'anatomy-of-infrastructures',
    name: {
      en: 'Anatomy of Infrastructures',
      ar: 'تشريح البنى التحتية'
    },
    shortDescription: {
      en: 'Map system layers from goals to features',
      ar: 'رسم خريطة طبقات النظام من الأهداف إلى الميزات'
    },
    description: {
      en: 'A visual framework for understanding systems through concentric layers: Goals at the center, surrounded by Impacts, Affordances, and Features. This methodology helps reveal how infrastructure components relate to intended outcomes.',
      ar: 'إطار عمل بصري لفهم الأنظمة من خلال طبقات متحدة المركز: الأهداف في المركز، محاطة بالتأثيرات والإمكانيات والميزات. تساعد هذه المنهجية في الكشف عن كيفية ارتباط مكونات البنية التحتية بالنتائج المقصودة.'
    },
    steps: [
      {
        id: 'identify-goals',
        title: { en: 'Identify Core Goals', ar: 'تحديد الأهداف الأساسية' },
        description: {
          en: 'Define the fundamental purposes the system serves. What outcomes does it aim to achieve?',
          ar: 'حدد الأغراض الأساسية التي يخدمها النظام. ما هي النتائج التي يهدف إلى تحقيقها؟'
        },
        tips: [
          { en: 'Focus on human-centered outcomes', ar: 'ركز على النتائج المتمحورة حول الإنسان' },
          { en: 'Consider multiple stakeholder perspectives', ar: 'اعتبر وجهات نظر أصحاب المصلحة المتعددين' }
        ]
      },
      {
        id: 'map-impacts',
        title: { en: 'Map System Impacts', ar: 'رسم خريطة تأثيرات النظام' },
        description: {
          en: 'Identify the broader effects the system has on communities, economies, and environments.',
          ar: 'حدد التأثيرات الأوسع للنظام على المجتمعات والاقتصادات والبيئات.'
        }
      },
      {
        id: 'identify-affordances',
        title: { en: 'Identify Affordances', ar: 'تحديد الإمكانيات' },
        description: {
          en: 'What actions does the system enable? How do people interact with it?',
          ar: 'ما هي الإجراءات التي يمكّنها النظام؟ كيف يتفاعل الناس معه؟'
        }
      },
      {
        id: 'catalog-features',
        title: { en: 'Catalog Features', ar: 'فهرسة الميزات' },
        description: {
          en: 'List the tangible products, services, and technologies that make up the system.',
          ar: 'قم بإدراج المنتجات والخدمات والتقنيات الملموسة التي تشكل النظام.'
        }
      }
    ],
    examples: [
      {
        id: 'uae-health-example',
        title: { en: 'UAE AI Health Ecosystem', ar: 'منظومة الذكاء الاصطناعي الصحي الإماراتية' },
        context: {
          en: 'Applying AOI to map the UAE\'s AI healthcare infrastructure.',
          ar: 'تطبيق AOI لرسم خريطة البنية التحتية للذكاء الاصطناعي في الرعاية الصحية الإماراتية.'
        },
        application: {
          en: 'Goals: Universal healthcare access, early disease detection. Impacts: Reduced healthcare costs, improved outcomes. Affordances: Telemedicine access, personalized treatment. Features: NABIDH platform, AI diagnostics, robotic surgery.',
          ar: 'الأهداف: الوصول الشامل للرعاية الصحية، الكشف المبكر عن الأمراض. التأثيرات: تخفيض تكاليف الرعاية الصحية، تحسين النتائج. الإمكانيات: الوصول للطب عن بعد، العلاج الشخصي. الميزات: منصة نبض، التشخيص بالذكاء الاصطناعي، الجراحة الروبوتية.'
        }
      }
    ],
    color: 'coral',
  },
  {
    id: 'action-situation',
    name: {
      en: 'Action Situation',
      ar: 'موقف العمل'
    },
    shortDescription: {
      en: 'Analyze agent interactions in context',
      ar: 'تحليل تفاعلات الفاعلين في السياق'
    },
    description: {
      en: 'A framework for analyzing how agents (people, organizations, technologies) interact within socio-technical-ecological systems (SETS). Helps understand the rules, roles, and relationships that shape outcomes.',
      ar: 'إطار عمل لتحليل كيفية تفاعل الفاعلين (الأفراد، المنظمات، التقنيات) ضمن الأنظمة الاجتماعية-التقنية-البيئية. يساعد في فهم القواعد والأدوار والعلاقات التي تشكل النتائج.'
    },
    steps: [
      {
        id: 'identify-agents',
        title: { en: 'Identify Agents', ar: 'تحديد الفاعلين' },
        description: {
          en: 'Who are the key actors in this situation? Include humans, organizations, and technologies.',
          ar: 'من هم الفاعلون الرئيسيون في هذا الموقف؟ شمل البشر والمنظمات والتقنيات.'
        }
      },
      {
        id: 'map-rules',
        title: { en: 'Map the Rules', ar: 'رسم خريطة القواعد' },
        description: {
          en: 'What formal and informal rules govern agent behavior?',
          ar: 'ما هي القواعد الرسمية وغير الرسمية التي تحكم سلوك الفاعلين؟'
        }
      },
      {
        id: 'analyze-positions',
        title: { en: 'Analyze Positions', ar: 'تحليل المواقف' },
        description: {
          en: 'What roles do agents play? What power do they hold?',
          ar: 'ما الأدوار التي يلعبها الفاعلون؟ ما السلطة التي يمتلكونها؟'
        }
      }
    ],
    examples: [],
    color: 'gold',
  },
  {
    id: 'archetypes',
    name: {
      en: 'Archetypes',
      ar: 'الأنماط الأصلية'
    },
    shortDescription: {
      en: 'Identify recurring infrastructure patterns',
      ar: 'تحديد أنماط البنية التحتية المتكررة'
    },
    description: {
      en: 'Infrastructure systems often follow repeating patterns or archetypes. Understanding these patterns helps predict behaviors and identify opportunities for innovation.',
      ar: 'غالباً ما تتبع أنظمة البنية التحتية أنماطاً متكررة أو أنماطاً أصلية. يساعد فهم هذه الأنماط في التنبؤ بالسلوكيات وتحديد فرص الابتكار.'
    },
    steps: [
      {
        id: 'observe-patterns',
        title: { en: 'Observe Patterns', ar: 'ملاحظة الأنماط' },
        description: {
          en: 'Study how the system operates and identify recurring behaviors.',
          ar: 'ادرس كيف يعمل النظام وحدد السلوكيات المتكررة.'
        }
      },
      {
        id: 'compare-systems',
        title: { en: 'Compare with Known Archetypes', ar: 'المقارنة مع الأنماط المعروفة' },
        description: {
          en: 'Match observed patterns to established infrastructure archetypes.',
          ar: 'طابق الأنماط الملاحظة مع أنماط البنية التحتية المعروفة.'
        }
      }
    ],
    examples: [],
    color: 'sage',
  },
  {
    id: 'hotspots-dark-patterns',
    name: {
      en: 'Hotspots & Dark Patterns',
      ar: 'النقاط الساخنة والأنماط المظلمة'
    },
    shortDescription: {
      en: 'Reveal power imbalances and hidden mechanisms',
      ar: 'الكشف عن اختلالات القوة والآليات المخفية'
    },
    description: {
      en: 'A critical lens for identifying points of power imbalance, inequitable access, and hidden mechanisms within systems that perpetuate inequality or exclusion.',
      ar: 'عدسة نقدية لتحديد نقاط اختلال القوة والوصول غير العادل والآليات المخفية داخل الأنظمة التي تديم عدم المساواة أو الإقصاء.'
    },
    steps: [
      {
        id: 'identify-hotspots',
        title: { en: 'Identify Hotspots', ar: 'تحديد النقاط الساخنة' },
        description: {
          en: 'Where do power imbalances concentrate? Who benefits and who is excluded?',
          ar: 'أين تتركز اختلالات القوة؟ من يستفيد ومن يُستبعد؟'
        }
      },
      {
        id: 'uncover-dark-patterns',
        title: { en: 'Uncover Dark Patterns', ar: 'الكشف عن الأنماط المظلمة' },
        description: {
          en: 'What hidden mechanisms perpetuate inequality?',
          ar: 'ما هي الآليات المخفية التي تديم عدم المساواة؟'
        }
      }
    ],
    examples: [],
    color: 'sky',
  },
  {
    id: 'intersectional-narratives',
    name: {
      en: 'Intersectional Narratives',
      ar: 'السرديات التقاطعية'
    },
    shortDescription: {
      en: 'Surface stories of systemic inequality',
      ar: 'إظهار قصص عدم المساواة النظامية'
    },
    description: {
      en: 'Stories that reveal how systems affect people differently based on intersecting identities and circumstances. These narratives humanize system analysis and surface lived experiences.',
      ar: 'قصص تكشف كيف تؤثر الأنظمة على الناس بشكل مختلف بناءً على الهويات والظروف المتقاطعة. تضفي هذه السرديات طابعاً إنسانياً على تحليل النظام وتظهر التجارب المعاشة.'
    },
    steps: [
      {
        id: 'gather-stories',
        title: { en: 'Gather Stories', ar: 'جمع القصص' },
        description: {
          en: 'Collect personal experiences from diverse system users.',
          ar: 'اجمع التجارب الشخصية من مستخدمي النظام المتنوعين.'
        }
      },
      {
        id: 'identify-intersections',
        title: { en: 'Identify Intersections', ar: 'تحديد التقاطعات' },
        description: {
          en: 'How do multiple factors (identity, location, resources) compound experiences?',
          ar: 'كيف تتضافر عوامل متعددة (الهوية، الموقع، الموارد) في تشكيل التجارب؟'
        }
      }
    ],
    examples: [],
    color: 'amber',
  },
];

export function getToolById(id: string): Tool | undefined {
  return analysisTools.find(t => t.id === id);
}
