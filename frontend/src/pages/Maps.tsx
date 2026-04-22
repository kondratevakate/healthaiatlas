import { motion } from 'framer-motion';
import { Layout } from '@/components/layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { SystemMapOverview } from '@/components/home/SystemMapOverview';

const Maps = () => {
  const { t, language } = useLanguage();

  return (
    <Layout>
      <div className="container py-16 md:py-24">
        <motion.div
          className="max-w-3xl mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="heading-display section-marker mb-6">{t('nav.systemMaps')}</h1>
          <p className="text-body text-muted-foreground">
            {language === 'en'
              ? 'Explore the UAE Healthcare AI ecosystem through an interactive anatomy map. Click categories to filter; hover nodes for details.'
              : 'استكشف منظومة الذكاء الاصطناعي الصحي في الإمارات من خلال خريطة تشريحية تفاعلية. انقر على الفئات للتصفية، ومرر الماوس على العقد لرؤية التفاصيل.'}
          </p>
        </motion.div>

        <SystemMapOverview />
      </div>
    </Layout>
  );
};

export default Maps;
