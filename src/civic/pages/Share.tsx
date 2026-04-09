// Share Page
// Public shareable risk assessment card

import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/civic/components/layout';
import { RiskScoreCard } from '@/civic/components/research';
import { RiskAssessment } from '@/civic/types/research';
import { Button } from '@/civic/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Share() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Try to load from localStorage
    const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
    if (id && assessments[id]) {
      const stored = assessments[id];
      // Reconstruct with Date object
      setAssessment({
        ...stored,
        generatedAt: new Date(stored.generatedAt)
      });
    } else {
      setNotFound(true);
    }
  }, [id]);

  if (notFound) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-semibold mb-4">
              Assessment not found
            </h1>
            <p className="text-muted-foreground mb-6">
              This assessment may have expired or the link is invalid.
            </p>
            <Button onClick={() => navigate('/')}>
              Take the test yourself
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!assessment) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-12 md:py-24">
        <div className="container flex flex-col items-center">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
              AI Health Navigator
            </p>
            <h1 className="text-2xl font-semibold">
              Risk Assessment Summary
            </h1>
            <div className="h-0.5 w-12 bg-primary mx-auto mt-4" />
          </div>

          {/* Card */}
          <RiskScoreCard
            assessment={assessment}
            onViewPath={() => navigate(`/path/${assessment.role}`)}
          />

          {/* CTA */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Want to assess your own situation?
            </p>
            <Button onClick={() => navigate('/')}>
              Take the test yourself
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

