import { useState, useRef } from "react";
import { Hero } from "@/components/Hero";
import { TruthTableInput, TruthTableRow } from "@/components/TruthTableInput";
import { FaultAnalysis } from "@/components/FaultAnalysis";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Cpu } from "lucide-react";

const Index = () => {
  const [rows, setRows] = useState<TruthTableRow[]>([
    { inputs: "00", expectedOutput: "0", observedOutput: "1" },
    { inputs: "01", expectedOutput: "1", observedOutput: "1" },
    { inputs: "10", expectedOutput: "1", observedOutput: "1" },
    { inputs: "11", expectedOutput: "0", observedOutput: "0" },
  ]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const analyzerRef = useRef<HTMLDivElement>(null);

  const handleGetStarted = () => {
    analyzerRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const analyzeCircuit = async () => {
    // Validate inputs
    const invalidRows = rows.filter(
      row => !row.inputs || !row.expectedOutput || !row.observedOutput
    );

    if (invalidRows.length > 0) {
      toast({
        title: "Incomplete Data",
        description: "Please fill in all truth table fields before analyzing.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('analyze-circuit', {
        body: { rows }
      });

      if (functionError) throw functionError;

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "Circuit fault analysis has been generated.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze circuit";
      setError(errorMessage);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Hero onGetStarted={handleGetStarted} />

      {/* Analyzer Section */}
      <section ref={analyzerRef} className="py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Cpu className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Circuit Analyzer</h2>
          </div>

          <div className="space-y-8">
            <TruthTableInput rows={rows} onRowsChange={setRows} />

            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={analyzeCircuit}
                disabled={isLoading || rows.length === 0}
                className="text-lg px-12 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_30px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_40px_hsl(var(--primary)/0.5)] transition-all"
              >
                {isLoading ? "Analyzing..." : "Analyze Circuit"}
              </Button>
            </div>

            <FaultAnalysis 
              analysis={analysis} 
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container text-center text-muted-foreground">
          <p>Built with AI-powered circuit analysis for educational purposes</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
