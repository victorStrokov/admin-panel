import { ProductMaterial } from '@/@types/product.types';

interface PriceInput {
  steelSize?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  pvcSize?: 1 | 2 | 3 | 4 | 5;
  productSizes?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  productLength?: 1 | 2 | 3;
  productColor?: 1 | 2 | 3 | 4;
  productShape?: 1 | 2;
  productMaterials?: ProductMaterial;
  productThickness?: 1 | 2 | 3 | 4;
}

export const calculatePrice = ({
  steelSize,
  pvcSize,
  productSizes,
  productLength,
  productColor,
  productShape,
  productMaterials,
  productThickness,
}: PriceInput): number => {
  let base = 200;
  // Материал
  switch (productMaterials) {
    case 'ALUMINIUM':
      base += 150;
      break;
    case 'PVC':
      base += 50;
      break;
    case 'STEEL':
      base += 100;
      break;
    case 'PLASTIC':
      base += 30;
      break;
    case 'RUBBER':
      base += 40;
      break;
  }

  // Размер
  const size = steelSize ?? pvcSize ?? productSizes;
  if (size) base += size * 10;

  // Длина
  if (productLength) base += productLength * 20;

  // Толщина профиля
  if (productThickness) base += productThickness * 25;

  // Форма
  if (productShape) base += productShape * 15;

  // Цвет
  if (productColor) base += productColor * 5;

  // Добавим немного случайности
  const randomOffset = Math.floor(Math.random() * 50); // от 0 до 49

  return Math.round(base + randomOffset);
};
