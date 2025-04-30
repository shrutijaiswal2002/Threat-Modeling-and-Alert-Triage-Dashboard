"use client";

import type * as React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  description: z.string().min(10, {
    message: "System description must be at least 10 characters.",
  }).max(5000, {
    message: "System description must not exceed 5000 characters.",
  }),
});

export type ThreatInputFormValues = z.infer<typeof formSchema>;

interface ThreatInputFormProps {
  onSubmit: (values: ThreatInputFormValues) => void;
  loading: boolean;
}

export function ThreatInputForm({ onSubmit, loading }: ThreatInputFormProps) {
  const form = useForm<ThreatInputFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
    },
  });

  return (
    <Card className="shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle>System Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Describe your system</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter details about your system architecture, technologies used, data flow, etc."
                      className="min-h-[150px] resize-y"
                      {...field}
                      aria-describedby="description-helper-text"
                      aria-required="true"
                    />
                  </FormControl>
                   <p id="description-helper-text" className="text-sm text-muted-foreground">
                    Provide enough detail for the AI to understand the potential attack surface.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Suggest Threats'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
