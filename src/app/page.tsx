"use client";

import * as React from 'react';
import { useState } from 'react';
import { ThreatInputForm, type ThreatInputFormValues } from '@/components/threat-input-form';
import { ThreatModelDisplay } from '@/components/threat-model-display';
import { suggestThreats, type SuggestThreatsOutput, type BaseThreat } from '@/ai/flows/suggest-threats';
import type { Threat } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Mock SOC analysts for assignment
const SOC_ANALYSTS = ['Alice', 'Bob', 'Charlie', 'Dana', 'Unassigned'];

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

      // Add initial status and assignee to the threats returned by the AI/service
      const initialThreats: Threat[] = result.threats.map((baseThreat: BaseThreat, index: number) => ({
        ...baseThreat,
        id: `threat-${Date.now()}-${index}`, // Simple unique ID generation
        status: 'Pending',
        assignee: null,
      }));

      setThreats(initialThreats);
       toast({
          title: "Analysis Complete",
          description: `${initialThreats.length} potential threats identified.`,
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

  // Handler to update the status of a specific threat
  const handleStatusChange = (threatId: string, newStatus: Threat['status']) => {
    setThreats(prevThreats =>
      prevThreats.map(threat =>
        threat.id === threatId ? { ...threat, status: newStatus } : threat
      )
    );
     toast({
          title: "Status Updated",
          description: `Threat status changed to ${newStatus}.`,
        });
  };

  // Handler to update the assignee of a specific threat
  const handleAssigneeChange = (threatId: string, newAssignee: string | null) => {
     const assigneeName = newAssignee === 'Unassigned' ? null : newAssignee;
     setThreats(prevThreats =>
      prevThreats.map(threat =>
        threat.id === threatId ? { ...threat, assignee: assigneeName } : threat
      )
    );
     toast({
          title: "Assignee Updated",
          description: `Threat assigned to ${assigneeName ?? 'Unassigned'}.`,
        });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-12 lg:p-24 bg-background">
      <div className="container mx-auto max-w-6xl space-y-8">
         <header className="text-center mb-12">
           <h1 className="text-4xl font-bold text-primary mb-2">ThreatWise SIEM</h1>
           <p className="text-lg text-foreground/80">Triage and Manage AI-Identified Security Threats</p>
         </header>

         {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col">
            <ThreatInputForm onSubmit={handleFormSubmit} loading={loading} />
          </div>
          <div className="lg:col-span-2 flex flex-col min-h-[500px]"> {/* Ensure display area has min height */}
            <ThreatModelDisplay
                threats={threats}
                loading={loading}
                socAnalysts={SOC_ANALYSTS}
                onStatusChange={handleStatusChange}
                onAssigneeChange={handleAssigneeChange}
             />
          </div>
        </div>

        <footer className="text-center mt-12 text-sm text-muted-foreground">
          Powered by AI | ThreatWise &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </main>
  );
}
