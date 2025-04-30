
"use client";

import type * as React from 'react';
import type { Threat } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, UserCircle, AlertTriangle, CheckCircle, Activity, CircleHelp } from 'lucide-react'; // Added CircleHelp
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ThreatTriageTableProps {
  threats: Threat[];
  loading: boolean;
  socAnalysts: string[]; // List of SOC analyst names
  onStatusChange: (threatId: string, newStatus: Threat['status']) => void;
  onAssigneeChange: (threatId: string, newAssignee: string | null) => void;
}

// Helper function to get status info (icon, color, variant)
const getStatusInfo = (status: Threat['status']) => {
  switch (status) {
    case 'Pending':
      return { icon: <AlertTriangle className="h-4 w-4" />, variant: 'destructive' as const, colorClass: 'text-yellow-500'}; // Yellow/Destructive
    case 'Triaged':
      return { icon: <Activity className="h-4 w-4" />, variant: 'secondary' as const, colorClass: 'text-blue-500' }; // Blue/Secondary
    case 'In Progress':
      return { icon: <Activity className="h-4 w-4 animate-pulse" />, variant: 'secondary' as const, colorClass: 'text-orange-500' }; // Orange/Secondary + pulse
    case 'Resolved':
      return { icon: <CheckCircle className="h-4 w-4" />, variant: 'default' as const, colorClass: 'text-green-500' }; // Green/Default
    default:
      return { icon: <CircleHelp className="h-4 w-4" />, variant: 'outline' as const, colorClass: 'text-muted-foreground' }; // Gray/Outline
  }
};

export function ThreatTriageTable({
  threats,
  loading,
  socAnalysts,
  onStatusChange,
  onAssigneeChange
}: ThreatTriageTableProps) {
  return (
    <Card className="shadow-lg rounded-lg h-full flex flex-col border border-border">
      {/* CardHeader can be optional if title is handled by Tabs */}
      {/* <CardHeader>
        <CardTitle>Threat Triage Table</CardTitle>
        <CardDescription>Review, assign, and update the status of identified threats.</CardDescription>
      </CardHeader> */}
      <CardContent className="flex-grow overflow-hidden p-0"> {/* Remove default padding */}
        <ScrollArea className="h-full">
          {loading ? (
             <div className="space-y-4 p-6"> {/* Add padding for skeletons */}
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-md bg-card">
                  <Skeleton className="h-6 w-6 rounded-full bg-muted" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3 bg-muted" />
                    <Skeleton className="h-4 w-full bg-muted" />
                  </div>
                  <Skeleton className="h-9 w-32 bg-muted rounded-md" /> {/* Skeleton for Status Select */}
                  <Skeleton className="h-9 w-40 bg-muted rounded-md" /> {/* Skeleton for Assignee Select */}
                </div>
              ))}
            </div>
          ) : threats.length > 0 ? (
            <Table className="relative"> {/* Use relative for sticky header */}
              <TableHeader className="sticky top-0 bg-card z-10"> {/* Sticky Header */}
                <TableRow>
                  <TableHead className="w-[50px] pl-4">Icon</TableHead>
                  <TableHead>Threat Details</TableHead>
                  <TableHead className="w-[160px]">Status</TableHead> {/* Increased width */}
                  <TableHead className="w-[190px] pr-4">Assignee</TableHead> {/* Increased width */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {threats.map((threat) => {
                  const { icon: statusIcon, variant: statusVariant, colorClass: statusColor } = getStatusInfo(threat.status);
                  return (
                    <TableRow key={threat.id} className="hover:bg-muted/10">
                      <TableCell className="pl-4">
                        <ShieldAlert className={`h-5 w-5 ${threat.status === 'Resolved' ? 'text-green-600' : 'text-destructive'}`} aria-label="Threat Icon" />
                      </TableCell>
                      <TableCell>
                        <p className="font-semibold text-foreground">{threat.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{threat.description}</p>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={threat.status}
                          onValueChange={(value: Threat['status']) => onStatusChange(threat.id, value)}
                        >
                          <SelectTrigger className="w-full h-9 text-sm">
                             <div className="flex items-center">
                                {React.cloneElement(statusIcon, { className: `mr-2 h-4 w-4 ${statusColor}` })}
                                <SelectValue placeholder="Select status" />
                              </div>
                          </SelectTrigger>
                          <SelectContent>
                            {(['Pending', 'Triaged', 'In Progress', 'Resolved'] as Threat['status'][]).map(status => {
                              const {icon, colorClass} = getStatusInfo(status);
                              return (
                              <SelectItem key={status} value={status} className="text-sm">
                                <div className="flex items-center">
                                  {React.cloneElement(icon, { className: `mr-2 h-4 w-4 ${colorClass}` })}
                                  {status}
                                </div>
                              </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                         {/* Optional: Keep badge if desired, styled better */}
                         {/* <Badge variant={statusVariant} className={`mt-1 text-xs capitalize w-full justify-center ${statusColor.replace('text-', 'bg-')}/10 ${statusColor}`}>
                            {React.cloneElement(statusIcon, { className: "mr-1 h-3 w-3" })}
                             {threat.status}
                         </Badge> */}
                      </TableCell>
                      <TableCell className="pr-4">
                        <Select
                           value={threat.assignee ?? 'Unassigned'}
                           onValueChange={(value) => onAssigneeChange(threat.id, value === 'Unassigned' ? null : value)}
                        >
                          <SelectTrigger className="w-full h-9 text-sm">
                             <div className="flex items-center">
                                {threat.assignee ? <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" /> : <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" /> }
                                <SelectValue placeholder="Assign Analyst" />
                              </div>
                          </SelectTrigger>
                          <SelectContent>
                            {socAnalysts.map(analyst => (
                              <SelectItem key={analyst} value={analyst} className="text-sm">
                               {analyst === 'Unassigned' ? (
                                  <span className="text-muted-foreground italic flex items-center">
                                     <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500"/>
                                      {analyst}
                                  </span>
                                ) : (
                                  <div className="flex items-center">
                                    <UserCircle className="mr-2 h-4 w-4" />
                                    {analyst}
                                  </div>
                                )}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-10 h-full">
               <CircleHelp className="w-16 h-16 mb-4 text-muted-foreground/50"/>
              <p className="text-lg font-medium">No Threats Found</p>
              <p className="text-sm">Submit system details using the form to begin the threat analysis.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

    