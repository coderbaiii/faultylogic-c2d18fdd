import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Lightbulb, Loader2 } from "lucide-react";

interface FaultAnalysisProps {
  analysis: string | null;
  isLoading: boolean;
  error: string | null;
}

export const FaultAnalysis = ({ analysis, isLoading, error }: FaultAnalysisProps) => {
  if (isLoading) {
    return (
      <Card className="p-8 bg-card border-border">
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span>Analyzing circuit faults...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analysis) {
    return (
      <Card className="p-8 bg-card border-border/50">
        <div className="text-center text-muted-foreground">
          <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Enter truth table data and click "Analyze Circuit" to get AI-powered fault explanations.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-primary/20 shadow-[0_0_30px_hsl(var(--primary)/0.1)]">
      <div className="flex items-start gap-3 mb-4">
        <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">Fault Analysis Results</h3>
          <p className="text-sm text-muted-foreground">AI-powered diagnosis of your circuit</p>
        </div>
      </div>
      
      <div className="prose prose-invert prose-cyan max-w-none">
        <div className="p-4 rounded-lg bg-code-bg border border-border">
          <pre className="whitespace-pre-wrap font-mono text-sm text-foreground leading-relaxed">
            {analysis}
          </pre>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <strong className="text-foreground">Learning Tip:</strong> Compare the expected and observed outputs
            to understand how the fault affects the circuit behavior. The AI explanation highlights the most likely
            component issues.
          </div>
        </div>
      </div>
    </Card>
  );
};
