"use client";

import * as React from 'react';
import { useState } from 'react';
import { ThreatInputForm, type ThreatInputFormValues } from '@/components/threat-input-form';
import { ThreatModelDisplay } from '@/components/threat-model-display';
import { suggestThreats, type SuggestThreatsOutput } from '@/ai/flows/suggest-threats';
import type { Threat } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFormSubmit = async (values: ThreatInputFormValues) => {
    setLoading(true);
    setError(null); // Clear previous errors
    setThreats([]); // Clear previous threats while loading new ones

    try {
      const result: SuggestThreatsOutput = await suggestThreats({
        systemDetails: {
          description: values.description,
        },
      });
      setThreats(result.threats);
       toast({
          title: "Analysis Complete",
          description: "Potential threats have been identified.",
          variant: "default", // Use default variant for success
        });
    } catch (err) {
      console.error("Error fetching threats:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(`Failed to retrieve threat suggestions. ${errorMessage}`);
       toast({
          title: "Error",
          description: `Failed to retrieve threat suggestions. Please try again. Details: ${errorMessage}`,
          variant: "destructive",
        });
       setThreats([]); // Clear threats on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-12 lg:p-24 bg-background">
      <div className="container mx-auto max-w-6xl space-y-8">
         <header className="text-center mb-12">
           <h1 className="text-4xl font-bold text-primary mb-2">ThreatWise</h1>
           <p className="text-lg text-foreground/80">Proactive Risk Assessment through AI-Powered Threat Modeling</p>
         </header>

         {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}


        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col">
            <ThreatInputForm onSubmit={handleFormSubmit} loading={loading} />
          </div>
          <div className="flex flex-col h-[500px] md:h-auto"> {/* Set fixed height for mobile, auto for larger screens */}
            <ThreatModelDisplay threats={threats} loading={loading} />
          </div>
        </div>

        <footer className="text-center mt-12 text-sm text-muted-foreground">
          Powered by AI | ThreatWise &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </main>
  );
}
