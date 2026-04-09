// Quick Reality Test Component
// Interactive 5-question test to assess risk and determine best path

import { useState, useCallback } from 'react';
import { PathRole, RiskAssessment, RiskLevel } from '@/civic/types/research';
import { testQuestions, bottleneckDescriptions, nextStepRecommendations } from '@/civic/data/tests';
import { cn } from '@/civic/lib/utils';
import { Button } from '@/civic/components/ui/button';
import { Card, CardContent, CardHeader } from '@/civic/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/civic/components/ui/radio-group';
import { Label } from '@/civic/components/ui/label';
import { ArrowRight, RotateCcw } from 'lucide-react';

interface QuickRealityTestProps {
  onComplete: (assessment: RiskAssessment) => void;
  className?: string;
}

function generateShareId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function calculateRisk(answers: Record<string, string>): {
  role: PathRole;
  riskLevel: RiskLevel;
  bottlenecks: string[];
  totalScore: number;
} {
  let totalScore = 0;
  const bottleneckSet = new Set<string>();
  let role: PathRole = 'founder';

  // Process each answer
  Object.entries(answers).forEach(([questionId, answerValue]) => {
    const question = testQuestions.find(q => q.id === questionId);
    if (!question) return;

    const selectedOption = question.options.find(o => o.value === answerValue);
    if (!selectedOption) return;

    totalScore += selectedOption.riskWeight;

    if (selectedOption.affectsBottlenecks) {
      selectedOption.affectsBottlenecks.forEach(b => bottleneckSet.add(b));
    }

    // Extract role from first question
    if (questionId === 'q1-role') {
      role = answerValue as PathRole;
    }
  });

  // Calculate risk level based on total score
  // Max possible score: 5 questions * 3 max weight = 15
  let riskLevel: RiskLevel;
  if (totalScore <= 4) {
    riskLevel = 'low';
  } else if (totalScore <= 8) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'high';
  }

  // Get bottleneck descriptions
  const bottlenecks = Array.from(bottleneckSet)
    .slice(0, 5)
    .map(key => bottleneckDescriptions[key]?.en || key);

  return { role, riskLevel, bottlenecks, totalScore };
}

export function QuickRealityTest({ onComplete, className }: QuickRealityTestProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);

  const currentQuestion = testQuestions[currentStep];
  const isLastQuestion = currentStep === testQuestions.length - 1;
  const canProceed = answers[currentQuestion?.id];

  const handleAnswer = useCallback((value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  }, [currentQuestion?.id]);

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      setIsCalculating(true);
      
      // Calculate results
      setTimeout(() => {
        const { role, riskLevel, bottlenecks } = calculateRisk(answers);
        const nextStep = nextStepRecommendations[role]?.[riskLevel]?.en || 
          'Review the full path guide for detailed recommendations.';

        const assessment: RiskAssessment = {
          id: generateShareId(),
          role,
          riskLevel,
          bottlenecks,
          bestNextStep: nextStep,
          generatedAt: new Date(),
          shareId: generateShareId()
        };

        onComplete(assessment);
        setIsCalculating(false);
      }, 500);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  }, [isLastQuestion, answers, onComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setAnswers({});
  }, []);

  return (
    <Card className={cn('border-2 max-w-2xl', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Find Yourself
            </p>
            <div className="h-0.5 w-12 bg-primary mt-2" />
          </div>
          <div className="text-sm text-muted-foreground">
            {currentStep + 1} / {testQuestions.length}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress bar */}
        <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStep + 1) / testQuestions.length) * 100}%` }}
          />
        </div>

        {/* Question */}
        <div>
          <h3 className="text-xl font-semibold mb-4">
            {currentQuestion.question.en}
          </h3>

          <RadioGroup
            value={answers[currentQuestion.id] || ''}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {currentQuestion.options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  'flex items-center space-x-3 p-4 border rounded-sm cursor-pointer transition-colors',
                  answers[currentQuestion.id] === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
                onClick={() => handleAnswer(option.value)}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <Label 
                  htmlFor={option.value} 
                  className="flex-1 cursor-pointer font-normal"
                >
                  {option.label.en}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <Button 
            onClick={handleNext} 
            disabled={!canProceed || isCalculating}
          >
            {isCalculating ? (
              'Finding your place...'
            ) : isLastQuestion ? (
              <>
                Find My Place
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

