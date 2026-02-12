import { z } from 'zod';

export const productItemSchema = z.object({
  productId: z.number(),
  price: z.number().positive(),
  productMaterials: z.enum(['PVC', 'STEEL', 'ALUMINIUM']).optional(),
  productLength: z.number().optional(),
  productColor: z.number().optional(),
  productShape: z.number().optional(),
  productThickness: z.number().optional(),
  pvcSize: z.number().optional(),
  steelSize: z.number().optional(),
  productSizes: z.number().optional(),
});
