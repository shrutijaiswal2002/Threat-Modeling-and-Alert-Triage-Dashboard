/**
 * Represents a potential threat with tracking information.
 */
export interface Threat {
  /**
   * A unique identifier for the threat instance.
   */
  id: string;
  /**
   * The name of the threat.
   */
  name: string;
  /**
   * A description of the threat.
   */
  description: string;
  /**
   * The current triage status of the threat.
   */
  status: 'Pending' | 'Triaged' | 'In Progress' | 'Resolved';
  /**
   * The SOC analyst assigned to triage the threat, or null if unassigned.
   */
  assignee: string | null;
}
