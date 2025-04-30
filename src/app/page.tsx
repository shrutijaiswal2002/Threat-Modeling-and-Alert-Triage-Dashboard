
"use client";

import * as React from 'react';
import { useState, useMemo } from 'react';
import { ThreatInputForm, type ThreatInputFormValues } from '@/components/threat-input-form';
import { ThreatTriageTable } from '@/components/threat-triage-table'; // Renamed from ThreatModelDisplay
import { DashboardView, type DashboardData } from '@/components/dashboard-view'; // New Dashboard component
import { suggestThreats, type SuggestThreatsOutput, type BaseThreat } from '@/ai/flows/suggest-threats';
import type { Threat } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, LayoutDashboard, ListChecks } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

// Mock SOC analysts for assignment
const SOC_ANALYSTS = ['Alice', 'Bob', 'Charlie', 'Dana', 'Unassigned'];

export default function Home() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("triage"); // State for active tab
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
        status: 'Pending', // Default status
        assignee: null, // Default assignee
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

  // Calculate data for the dashboard
  const dashboardData = useMemo((): DashboardData => {
    const totalThreats = threats.length;
    const pendingThreats = threats.filter(t => t.status === 'Pending').length;
    const triagedThreats = threats.filter(t => t.status === 'Triaged').length;
    const inProgressThreats = threats.filter(t => t.status === 'In Progress').length;
    const resolvedThreats = threats.filter(t => t.status === 'Resolved').length;

    const statusDistribution = [
        { name: 'Pending', value: pendingThreats, fill: "var(--chart-1)" },
        { name: 'Triaged', value: triagedThreats, fill: "var(--chart-2)" },
        { name: 'In Progress', value: inProgressThreats, fill: "var(--chart-3)" },
        { name: 'Resolved', value: resolvedThreats, fill: "var(--chart-4)" },
      ];

    const assigneeCounts = threats.reduce((acc, threat) => {
      const assignee = threat.assignee ?? 'Unassigned';
      acc[assignee] = (acc[assignee] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

     // Ensure all SOC analysts (including Unassigned) are present in the distribution
    const assigneeDistribution = SOC_ANALYSTS.map(analyst => ({
        name: analyst,
        value: assigneeCounts[analyst] || 0,
        // fill: `var(--chart-${(SOC_ANALYSTS.indexOf(analyst) % 5) + 1})` // Cycle through chart colors
    }));


    return {
      summary: {
        total: totalThreats,
        pending: pendingThreats,
        triaged: triagedThreats,
        inProgress: inProgressThreats,
        resolved: resolvedThreats,
      },
      statusDistribution,
      assigneeDistribution,
    };
  }, [threats]);


  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-12 lg:p-24 bg-secondary/30">
      <div className="container mx-auto max-w-7xl space-y-8"> {/* Increased max-width */}
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


        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8"> {/* Changed to 4 columns */}
          <div className="lg:col-span-1 flex flex-col">
             <ThreatInputForm onSubmit={handleFormSubmit} loading={loading} />
          </div>
          <div className="lg:col-span-3 flex flex-col min-h-[600px]"> {/* Adjusted span and min-height */}
             <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                <TabsList className="mb-4 self-start">
                   <TabsTrigger value="triage" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <ListChecks className="mr-2 h-4 w-4" />
                      Triage Table
                    </TabsTrigger>
                   <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </TabsTrigger>
                </TabsList>
                 <TabsContent value="triage" className="flex-grow">
                   <ThreatTriageTable
                     threats={threats}
                     loading={loading}
                     socAnalysts={SOC_ANALYSTS}
                     onStatusChange={handleStatusChange}
                     onAssigneeChange={handleAssigneeChange}
                   />
                 </TabsContent>
                 <TabsContent value="dashboard" className="flex-grow">
                    <DashboardView data={dashboardData} loading={loading}/>
                 </TabsContent>
             </Tabs>
          </div>
        </div>

        <footer className="text-center mt-12 text-sm text-muted-foreground">
          Powered by AI | ThreatWise &copy; {new Date().getFullYear()}
        </footer>
      </div>
    </main>
  );
}

    