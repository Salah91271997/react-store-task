import { z } from 'zod';

export const categorySchema = z.enum(['cameras', 'plan', 'sensors', 'accessories']);
export type Category = z.infer<typeof categorySchema>;

export const productIconSchema = z.enum([
  'camera',
  'cameraPan',
  'floodlight',
  'doorbell',
  'batteryCam',
  'motionSensor',
  'hub',
  'sdcard',
  'plan',
]);
export type ProductIcon = z.infer<typeof productIconSchema>;

export const stepIconSchema = z.enum(['cameras', 'plan', 'sensors', 'protection']);
export type StepIcon = z.infer<typeof stepIconSchema>;

export const variantSchema = z.object({
  id: z.string().min(1),
  label: z.string(),
  swatch: z.string(),
  price: z.number().nonnegative(),
  compareAt: z.number().nonnegative().nullable(),
  seedQty: z.number().int().nonnegative().default(0),
});
export type Variant = z.infer<typeof variantSchema>;

export const productSchema = z.object({
  id: z.string().min(1),
  category: categorySchema,
  title: z.string().min(1),
  description: z.string(),
  badge: z.string().nullable().default(null),
  icon: productIconSchema,
  learnMore: z.boolean().default(true),
  hasVariants: z.boolean(),
  hasStepper: z.boolean().default(true),
  required: z.boolean().default(false),
  minQty: z.number().int().nonnegative().default(0),
  priceSuffix: z.string().default(''),
  variants: z.array(variantSchema).min(1),
});
export type Product = z.infer<typeof productSchema>;

export const stepSchema = z.object({
  id: z.string().min(1),
  index: z.number().int().positive(),
  title: z.string().min(1),
  icon: stepIconSchema,
  category: categorySchema,
  nextLabel: z.string().nullable(),
});
export type Step = z.infer<typeof stepSchema>;

export const bundleSchema = z.object({
  reviewGroupOrder: z.array(categorySchema),
  groupLabels: z.record(categorySchema, z.string()),
  steps: z.array(stepSchema).min(1),
  products: z.array(productSchema).min(1),
  shipping: z.object({
    label: z.string(),
    price: z.number().nonnegative(),
    compareAt: z.number().nonnegative().nullable(),
  }),
  guarantee: z.object({
    sealText: z.string(),
    title: z.string(),
    body: z.string(),
  }),
  financingLabel: z.string(),
  content: z.object({
    pageHeading: z.string(),
    reviewEyebrow: z.string(),
    reviewTitle: z.string(),
    reviewSubtitle: z.string(),
    checkoutLabel: z.string(),
    saveForLaterLabel: z.string(),
    savingsTemplate: z.string(),
  }),
});
export type Bundle = z.infer<typeof bundleSchema>;

export function parseBundle(raw: unknown): Bundle {
  return bundleSchema.parse(raw);
}
