import { z } from "zod";

export const BlueprintSectionSchema = z.object({
  title: z.string().max(120),
  body: z.string().max(6000),
});

export const StarterBlueprintSchema = z.object({
  business_snapshot: BlueprintSectionSchema,
  startup_requirements: BlueprintSectionSchema,
  licenses_and_compliance: BlueprintSectionSchema,
  tools_and_software: BlueprintSectionSchema,
  pricing_strategy: BlueprintSectionSchema,
  launch_plan_30_days: BlueprintSectionSchema,
  operations_plan_90_days: BlueprintSectionSchema,
  scale_plan_12_months: BlueprintSectionSchema,
  risk_flags: BlueprintSectionSchema,
  sources: BlueprintSectionSchema,
});

export function sanitizeStarterBlueprint(candidate) {
  const parsed = StarterBlueprintSchema.safeParse(candidate);
  if (parsed.success) return parsed.data;

  return null;
}
