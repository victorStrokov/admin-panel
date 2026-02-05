// общий список всех возможных материалов
export type BaseMaterial = 'STEEL' | 'PVC' | 'ALUMINIUM' | 'PLASTIC' | 'RUBBER';

export type BaseMaterialName =
  | 'Сталь'
  | 'ПВХ'
  | 'Алюминий'
  | 'Пластик'
  | 'Резина';

export const BaseMaterialMap: Record<BaseMaterial, BaseMaterialName> = {
  STEEL: 'Сталь',
  PVC: 'ПВХ',
  ALUMINIUM: 'Алюминий',
  PLASTIC: 'Пластик',
  RUBBER: 'Резина',
};

// User types
export type UserRole = 'ADMIN' | 'MANAGER' | 'USER';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  tenantId: number;
  verified?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  banned: boolean;
  mustChangePassword: boolean;
}
