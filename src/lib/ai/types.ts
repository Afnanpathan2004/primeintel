import { z } from 'zod';

export type FactSource = 'EXPLICIT' | 'INFERRED' | 'DEFAULT' | 'NOT_PROVIDED';
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export interface ExtractedField<T> {
  value: T;
  source: FactSource;
  confidence: ConfidenceLevel;
  notes?: string;
}

export interface MissingInformationItem {
  field: string;
  description: string;
  affectsPricing: boolean;
  isCritical: boolean;
  suggestedQuestion: string;
}

export interface StructuredRequirement {
  summary: string;
  serviceKeys: ExtractedField<string[]>;
  primaryServiceKey: ExtractedField<string>;
  currentEnvironment: ExtractedField<string>;
  targetEnvironment: ExtractedField<string>;
  environmentCode: ExtractedField<'aws' | 'azure' | 'gcp' | 'hybrid' | 'on_premise'>;
  workloadCount: ExtractedField<number | null>;
  applicationCount: ExtractedField<number | null>;
  scaleCode: ExtractedField<'1_10' | '11_25' | '26_50' | '51_100' | '101_plus'>;
  storageEstimate: ExtractedField<string | null>;
  databaseDetails: ExtractedField<string | null>;
  complexity: ExtractedField<'low' | 'medium' | 'high' | 'enterprise'>;
  complexityCode: ExtractedField<'low' | 'medium' | 'high' | 'enterprise'>;
  timeline: ExtractedField<string>;
  timelineCode: ExtractedField<'flexible' | 'standard' | 'accelerated' | 'urgent'>;
  detectedAddOnCodes: ExtractedField<string[]>;
  technicalRequirements: string[];
  securityRequirements: string[];
  availabilityRequirements: string[];
  drRequirements: string[];
  devopsRequirements: string[];
  supportRequirements: string[];
  assumptions: string[];
  unknowns: MissingInformationItem[];
}

// Zod schemas for runtime validation
export const ExtractedFieldSchema = <T extends z.ZodTypeAny>(valSchema: T) =>
  z.object({
    value: valSchema,
    source: z.enum(['EXPLICIT', 'INFERRED', 'DEFAULT', 'NOT_PROVIDED']),
    confidence: z.enum(['HIGH', 'MEDIUM', 'LOW', 'NONE']),
    notes: z.string().optional(),
  });

export const MissingInformationItemSchema = z.object({
  field: z.string(),
  description: z.string(),
  affectsPricing: z.boolean(),
  isCritical: z.boolean(),
  suggestedQuestion: z.string(),
});

export const StructuredRequirementSchema = z.object({
  summary: z.string(),
  serviceKeys: ExtractedFieldSchema(z.array(z.string())),
  primaryServiceKey: ExtractedFieldSchema(z.string()),
  currentEnvironment: ExtractedFieldSchema(z.string()),
  targetEnvironment: ExtractedFieldSchema(z.string()),
  environmentCode: ExtractedFieldSchema(z.enum(['aws', 'azure', 'gcp', 'hybrid', 'on_premise'])),
  workloadCount: ExtractedFieldSchema(z.number().nullable()),
  applicationCount: ExtractedFieldSchema(z.number().nullable()),
  scaleCode: ExtractedFieldSchema(z.enum(['1_10', '11_25', '26_50', '51_100', '101_plus'])),
  storageEstimate: ExtractedFieldSchema(z.string().nullable()),
  databaseDetails: ExtractedFieldSchema(z.string().nullable()),
  complexity: ExtractedFieldSchema(z.enum(['low', 'medium', 'high', 'enterprise'])),
  complexityCode: ExtractedFieldSchema(z.enum(['low', 'medium', 'high', 'enterprise'])),
  timeline: ExtractedFieldSchema(z.string()),
  timelineCode: ExtractedFieldSchema(z.enum(['flexible', 'standard', 'accelerated', 'urgent'])),
  detectedAddOnCodes: ExtractedFieldSchema(z.array(z.string())),
  technicalRequirements: z.array(z.string()),
  securityRequirements: z.array(z.string()),
  availabilityRequirements: z.array(z.string()),
  drRequirements: z.array(z.string()),
  devopsRequirements: z.array(z.string()),
  supportRequirements: z.array(z.string()),
  assumptions: z.array(z.string()),
  unknowns: z.array(MissingInformationItemSchema),
});
