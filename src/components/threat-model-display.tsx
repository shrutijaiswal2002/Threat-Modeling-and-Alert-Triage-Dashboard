"use client";

import type * as React from 'react';
import type { Threat } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, UserCircle, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
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

interface ThreatModelDisplayProps {
  threats: Threat[];
  loading: boolean;
  socAnalysts: string[]; // List of SOC analyst names
  onStatusChange: (threatId: string, newStatus: Threat['status']) => void;
  onAssigneeChange: (threatId: string, newAssignee: string | null) => void;
}

// Helper function to get status color and icon
const getStatusInfo = (status: Threat['status']) => {
  switch (status) {
    case 'Pending':
      return { color: 'bg-yellow-500', icon: <AlertTriangle className="h-4 w-4 mr-1" />, variant: 'destructive' as const };
    case 'Triaged':
      return { color: 'bg-blue-500', icon: <Activity className="h-4 w-4 mr-1" />, variant: 'secondary' as const };
    case 'In Progress':
      return { color: 'bg-orange-500', icon: <Activity className="h-4 w-4 mr-1" />, variant: 'secondary' as const };
    case 'Resolved':
      return { color: 'bg-green-500', icon: <CheckCircle className="h-4 w-4 mr-1" />, variant: 'default' as const };
    default:
      return { color: 'bg-gray-500', icon: <AlertTriangle className="h-4 w-4 mr-1" />, variant: 'outline' as const };
  }
};

export function ThreatModelDisplay({
  threats,
  loading,
  socAnalysts,
  onStatusChange,
  onAssigneeChange
}: ThreatModelDisplayProps) {
  return (
    <Card className="shadow-lg rounded-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle>Threat Triage Dashboard</CardTitle>
        <CardDescription>Manage and assign identified security threats.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden p-0"> {/* Remove default padding */}
        <ScrollArea className="h-full">
          {loading ? (
             <div className="space-y-4 p-6"> {/* Add padding for skeletons */}
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-md bg-secondary/30">
                   <Skeleton className="h-6 w-6 rounded-full bg-muted" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/3 bg-muted" />
                    <Skeleton className="h-4 w-full bg-muted" />
                  </div>
                  <Skeleton className="h-8 w-24 bg-muted" />
                   <Skeleton className="h-8 w-24 bg-muted" />
                </div>
              ))}
            </div>
          ) : threats.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Icon</TableHead>
                  <TableHead>Threat Name</TableHead>
                  <TableHead className="w-[150px]">Status</TableHead>
                  <TableHead className="w-[180px]">Assignee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {threats.map((threat) => {
                  const { variant: statusVariant } = getStatusInfo(threat.status);
                  return (
                    <TableRow key={threat.id} className="hover:bg-muted/10">
                      <TableCell>
                        <ShieldAlert className="h-5 w-5 text-destructive" aria-label="Threat Icon" />
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-primary">{threat.name}</p>
                        <p className="text-xs text-foreground/70 mt-1">{threat.description}</p>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={threat.status}
                          onValueChange={(value: Threat['status']) => onStatusChange(threat.id, value)}
                        >
                          <SelectTrigger className="w-full h-9 text-xs">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {(['Pending', 'Triaged', 'In Progress', 'Resolved'] as Threat['status'][]).map(status => (
                              <SelectItem key={status} value={status} className="text-xs">
                                <div className="flex items-center">
                                  {React.cloneElement(getStatusInfo(status).icon, { className: "mr-2 h-4 w-4" })}
                                  {status}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                         <Badge variant={statusVariant} className="mt-1 text-xs capitalize w-full justify-center">
                            {getStatusInfo(threat.status).icon}
                             {threat.status}
                         </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={threat.assignee ?? 'Unassigned'}
                          onValueChange={(value) => onAssigneeChange(threat.id, value)}
                        >
                          <SelectTrigger className="w-full h-9 text-xs">
                             <div className="flex items-center">
                                {threat.assignee ? <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" /> : <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" /> }
                                <SelectValue placeholder="Assign Analyst" />
                              </div>
                          </SelectTrigger>
                          <SelectContent>
                            {socAnalysts.map(analyst => (
                              <SelectItem key={analyst} value={analyst} className="text-xs">
                               {analyst === 'Unassigned' ? (
                                  <span className="text-muted-foreground italic">{analyst}</span>
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
            <div className="text-center text-muted-foreground p-10"> {/* Add padding */}
              <p>No threats suggested yet. Submit system details to begin analysis.</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
