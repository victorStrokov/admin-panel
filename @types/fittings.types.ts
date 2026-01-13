import { BaseMaterial } from './base.types';

// материалы, допустимые для фурнитуры
export type FittingsMaterial = Extract<BaseMaterial, 'STEEL' | 'PLASTIC' | 'ALUMINIUM'>;
