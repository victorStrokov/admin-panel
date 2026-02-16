import { z } from 'zod';

// Один ингредиент в заказе
export const orderItemIngredientSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
});

// Один товар в заказе (снимок CartItem + ProductItem + Product)
export const orderItemSchema = z.object({
  productItemId: z.number().int().positive(),
  productId: z.number().int().positive(),
  name: z.string().min(1),
  image: z.string().url().or(z.string().min(1)),
  price: z.number().int().nonnegative(),
  quantity: z.number().int().positive(),
  ingredients: z.array(orderItemIngredientSchema).optional(),
});

// Базовая схема заказа (то, что реально хранится в Order)
export const orderBaseSchema = z.object({
  status: z.enum(['PENDING', 'SUCCEEDED', 'CANCELLED']).default('PENDING'),
  totalAmount: z.number().int().nonnegative(),
  token: z.string().min(1),
  items: z.array(orderItemSchema),
  fullName: z.string().min(1).max(150),
  email: z.string().email().max(255),
  phone: z.string().min(5).max(20),
  address: z.string().min(1).max(255),
  comment: z.string().max(1000).optional(),
  paymentId: z.string().optional(),
});

// POST /api/orders — создание
export const orderCreateSchema = orderBaseSchema;

// PUT /api/orders — обновление (админ меняет только статус и сумму)
export const orderUpdateSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(['PENDING', 'SUCCEEDED', 'CANCELLED']),
  totalAmount: z.number().int().nonnegative(),
});

export type OrderCreateDto = z.infer<typeof orderCreateSchema>;
export type OrderUpdateDto = z.infer<typeof orderUpdateSchema>;
export type OrderItemDto = z.infer<typeof orderItemSchema>;
