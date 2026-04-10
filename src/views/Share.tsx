'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { RiskScoreCard } from '@/components/research';
import { Button } from '@/components/ui/button';
import { RiskAssessment } from '@/types/research';

interface ShareProps {
  shareId: string;
}

export default function Share({ shareId }: ShareProps) {
  const router = useRouter();
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const assessments = JSON.parse(localStorage.getItem('assessments') || '{}');
    if (shareId && assessments[shareId]) {
      const stored = assessments[shareId];
      setAssessment({
        ...stored,
        generatedAt: new Date(stored.generatedAt),
      });
      return;
    }

    setNotFound(true);
  }, [shareId]);

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="mb-4 text-2xl font-semibold">Assessment not found</h1>
          <p className="mb-6 text-muted-foreground">
            This assessment may have expired or the link is invalid.
          </p>
          <Button onClick={() => router.push('/')}>
            Take the test yourself
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 md:py-24">
      <div className="container flex flex-col items-center">
        <div className="mb-8 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            AI Health Navigator
          </p>
          <h1 className="text-2xl font-semibold">Risk Assessment Summary</h1>
          <div className="mx-auto mt-4 h-0.5 w-12 bg-primary" />
        </div>

        <RiskScoreCard
          assessment={assessment}
          onViewPath={() => router.push(`/path/${assessment.role}`)}
        />

        <div className="mt-8 text-center">
          <p className="mb-4 text-muted-foreground">Want to assess your own situation?</p>
          <Button onClick={() => router.push('/')}>
            Take the test yourself
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
