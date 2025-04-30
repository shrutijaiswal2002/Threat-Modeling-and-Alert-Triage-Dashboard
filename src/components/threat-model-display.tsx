"use client";

import type * as React from 'react';
import type { Threat } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert } from 'lucide-react';

interface ThreatModelDisplayProps {
  threats: Threat[];
  loading: boolean;
}

export function ThreatModelDisplay({ threats, loading }: ThreatModelDisplayProps) {
  return (
    <Card className="shadow-lg rounded-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle>Potential Threats</CardTitle>
        <CardDescription>Based on your system description, here are potential threats:</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 border rounded-md bg-secondary/30">
                   <Skeleton className="h-6 w-6 rounded-full bg-muted" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3 bg-muted" />
                    <Skeleton className="h-4 w-full bg-muted" />
                    <Skeleton className="h-4 w-4/5 bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ) : threats.length > 0 ? (
            <ul className="space-y-4">
              {threats.map((threat, index) => (
                <li key={index} className="flex items-start space-x-4 p-4 border rounded-md bg-secondary/30 shadow-sm hover:shadow-md transition-shadow duration-200">
                   <ShieldAlert className="h-6 w-6 text-destructive flex-shrink-0 mt-1" aria-hidden="true" />
                   <div className="flex-1">
                    <p className="font-semibold text-primary">{threat.name}</p>
                    <p className="text-sm text-foreground/80">{threat.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center text-muted-foreground py-10">
              <p>No threats suggested yet. Submit system details to begin analysis.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
