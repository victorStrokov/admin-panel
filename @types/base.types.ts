// общий список всех возможных материалов
export type BaseMaterial = 'STEEL' | 'PVC' | 'ALUMINIUM' | 'PLASTIC' | 'RUBBER';

export type BaseMaterialName = 'Сталь' | 'ПВХ' | 'Алюминий' | 'Пластик' | 'Резина';

export const BaseMaterialMap: Record<BaseMaterial, BaseMaterialName> = {
  STEEL: 'Сталь',
  PVC: 'ПВХ',
  ALUMINIUM: 'Алюминий',
  PLASTIC: 'Пластик',
  RUBBER: 'Резина',
};
