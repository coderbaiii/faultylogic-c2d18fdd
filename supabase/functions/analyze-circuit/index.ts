import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TruthTableRow {
  inputs: string;
  expectedOutput: string;
  observedOutput: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rows }: { rows: TruthTableRow[] } = await req.json();

    if (!rows || rows.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No truth table data provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Build the analysis prompt
    const mismatches = rows.filter(row => row.expectedOutput !== row.observedOutput);
    
    let prompt = `You are an expert digital electronics teacher helping students debug logic circuits.

Truth Table Analysis:
`;

    rows.forEach(row => {
      const mismatch = row.expectedOutput !== row.observedOutput ? " ❌ MISMATCH" : " ✓";
      prompt += `Inputs: ${row.inputs} | Expected: ${row.expectedOutput} | Observed: ${row.observedOutput}${mismatch}\n`;
    });

    prompt += `\n${mismatches.length} mismatches found out of ${rows.length} test cases.

Please provide:
1. A clear identification of the fault pattern
2. The most likely component issue (missing gate, incorrect gate type, short circuit, etc.)
3. An educational explanation of why this fault causes the observed behavior
4. Suggestions for fixing the circuit

Keep the explanation clear and educational, suitable for students learning digital electronics.`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Calling Lovable AI for circuit analysis...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert digital electronics teacher specializing in logic circuit debugging and fault analysis.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please add credits to your workspace.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    if (!analysis) {
      throw new Error('No analysis returned from AI');
    }

    console.log('Analysis completed successfully');

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-circuit function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: 'Please check your input and try again.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
