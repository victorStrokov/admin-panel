import { BaseMaterial } from './base.types';

// материалы, допустимые для профилей
export type ProductMaterial = Extract<BaseMaterial, 'STEEL' | 'PVC' | 'ALUMINIUM' | 'PLASTIC' | 'RUBBER'>;

// поля, по которым строятся варианты профиля
export type VariantField = 'size' | 'length' | 'thickness' | 'color' | 'shape';

// конфигурация для функции buildVariants
export interface VariantConfig {
  field: VariantField; // какое поле берём из items
  prefix?: string; // текст перед значением (например "Размер ")
  suffix?: string; // текст после значения (например "мм")
}
