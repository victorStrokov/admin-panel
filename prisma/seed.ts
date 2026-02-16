import 'dotenv/config';
import { hashSync } from 'bcrypt';
import { prisma } from './prisma-client';
import { _ingredients, products } from './constants';
import { Prisma } from '@prisma/client';
import { ProductMaterial } from '@/@types/product.types';
import { calculatePrice } from '../shared/lib/calculate-price';
import slugify from 'slugify';
import { generateSku } from '@/shared/lib/generate-sku';

const categories = [
  { id: 1, name: 'Армирование' },
  { id: 2, name: 'Алюминий' },
  { id: 3, name: 'ПВХ' },
  { id: 4, name: 'Уплотнение' },
  { id: 5, name: 'Фурнитура' },
  { id: 6, name: 'Комплектующие' },
  { id: 7, name: 'Масла' },
];

const generateProductItem = ({
  productId,
  steelSize,
  pvcSize,
  productSizes,
  productLength,
  productColor,
  productShape,
  productMaterials,
  productThickness,
}: {
  productId: number;
  steelSize?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  pvcSize?: 1 | 2 | 3 | 4 | 5;
  productSizes?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  productLength?: 1 | 2 | 3;
  productColor?: 1 | 2 | 3 | 4;
  productShape?: 1 | 2;
  productThickness?: 1 | 2 | 3 | 4;
  productMaterials?: ProductMaterial;
}) => {
  const sizeField =
    productMaterials === 'STEEL'
      ? { steelSize }
      : productMaterials === 'PVC'
        ? { pvcSize }
        : { productSizes };

  return {
    productId,
    sku: generateSku('ITEM'), // ← ДОБАВИЛИ SKU
    price: calculatePrice({
      ...sizeField,
      productLength,
      productMaterials,
      productShape,
      productColor,
      productThickness,
    }),
    ...sizeField,
    productLength,
    productColor,
    productShape,
    productMaterials,
    productThickness,
  } as Prisma.ProductItemUncheckedCreateInput;
};

async function main() {
  console.log('DB URL:', process.env.DATABASE_URL);
  console.log('🌱 Seeding admin-panel...');

  // ============================
  // 0. Clean database
  // ============================
  console.log('🗑️ Cleaning database...');
  try {
    await prisma.order.deleteMany({});
  } catch {
    console.log('⚠️ Order delete skipped');
  }
  try {
    await prisma.cartItem.deleteMany({});
  } catch {
    console.log('⚠️ CartItem delete skipped');
  }
  try {
    await prisma.cart.deleteMany({});
  } catch {
    console.log('⚠️ Cart delete skipped');
  }
  try {
    await prisma.productItem.deleteMany({});
  } catch {
    console.log('⚠️ ProductItem delete skipped');
  }
  try {
    await prisma.storyItem.deleteMany({});
  } catch {
    console.log('⚠️ StoryItem delete skipped');
  }
  try {
    await prisma.story.deleteMany({});
  } catch {
    console.log('⚠️ Story delete skipped');
  }
  try {
    await prisma.product.deleteMany({});
  } catch {
    console.log('⚠️ Product delete skipped');
  }
  try {
    await prisma.ingredient.deleteMany({});
  } catch {
    console.log('⚠️ Ingredient delete skipped');
  }
  try {
    await prisma.category.deleteMany({});
  } catch {
    console.log('⚠️ Category delete skipped');
  }
  try {
    await prisma.activityLog.deleteMany({});
  } catch {
    console.log('⚠️ ActivityLog delete skipped');
  }
  try {
    await prisma.session.deleteMany({});
  } catch {
    console.log('⚠️ Session delete skipped');
  }
  try {
    await prisma.user.deleteMany({});
  } catch {
    console.log('⚠️ User delete skipped');
  }
  try {
    await prisma.tenant.deleteMany({});
  } catch {
    console.log('⚠️ Tenant delete skipped');
  }
  console.log('Database cleaned');

  // ============================
  // 1. Tenants
  // ============================
  const ldm = await prisma.tenant.create({
    data: { name: 'LDM Steel' },
  });

  const company2 = await prisma.tenant.create({
    data: { name: 'Company #2' },
  });

  console.log('Tenants created');

  // ============================
  // 2. Users
  // ============================
  const adminLDM = await prisma.user.create({
    data: {
      fullName: 'Admin LDM',
      email: 'admin@ldm.ru',
      passwordHash: hashSync('1111', 10),
      role: 'ADMIN',
      tenantId: ldm.id,
      verified: new Date(),
    },
  });

  const managerLDM = await prisma.user.create({
    data: {
      fullName: 'Manager LDM',
      email: 'manager@ldm.ru',
      passwordHash: hashSync('2222', 10),
      role: 'MANAGER',
      tenantId: ldm.id,
      verified: new Date(),
    },
  });

  const manager2LDM = await prisma.user.create({
    data: {
      fullName: 'Manager 2 LDM',
      email: 'manager2@ldm.ru',
      passwordHash: hashSync('2223', 10),
      role: 'MANAGER',
      tenantId: ldm.id,
      verified: new Date(),
    },
  });

  const admin2LDM = await prisma.user.create({
    data: {
      fullName: 'Admin 2 LDM',
      email: 'admin2@ldm.ru',
      passwordHash: hashSync('1112', 10),
      role: 'ADMIN',
      tenantId: ldm.id,
      verified: new Date(),
    },
  });

  const userLDM = await prisma.user.create({
    data: {
      fullName: 'User LDM',
      email: 'user@ldm.ru',
      passwordHash: hashSync('3333', 10),
      role: 'USER',
      tenantId: ldm.id,
      verified: new Date(),
    },
  });

  const adminCompany2 = await prisma.user.create({
    data: {
      fullName: 'Admin Company2',
      email: 'admin@company2.ru',
      passwordHash: hashSync('4444', 10),
      role: 'ADMIN',
      tenantId: company2.id,
      verified: new Date(),
    },
  });

  const admin2Company2 = await prisma.user.create({
    data: {
      fullName: 'Admin 2 Company2',
      email: 'admin2@company2.ru',
      passwordHash: hashSync('4445', 10),
      role: 'ADMIN',
      tenantId: company2.id,
      verified: new Date(),
    },
  });

  const managerCompany2 = await prisma.user.create({
    data: {
      fullName: 'Manager Company2',
      email: 'manager@company2.ru',
      passwordHash: hashSync('4446', 10),
      role: 'MANAGER',
      tenantId: company2.id,
      verified: new Date(),
    },
  });

  const userCompany2 = await prisma.user.create({
    data: {
      fullName: 'User Company2',
      email: 'user@company2.ru',
      passwordHash: hashSync('5555', 10),
      role: 'USER',
      tenantId: company2.id,
      verified: new Date(),
    },
  });

  console.log('Users created');

  // ============================
  // 3. Categories
  // ============================
  await prisma.category.createMany({
    data: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: slugify(c.name, { lower: true }),
      tenantId: ldm.id,
    })),
    skipDuplicates: true,
  });

  // Получаем категории для использования
  const allCategories = await prisma.category.findMany();
  const categorySteel =
    allCategories.find((c) => c.id === 1) || allCategories[0];
  const categoryPVC = allCategories.find((c) => c.id === 3) || allCategories[1];

  console.log('Categories created');

  // ============================
  // 3b. Ingredients (from user project)
  // ============================
  await prisma.ingredient.createMany({
    data: _ingredients.map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price,
    })),
  });
  console.log('Ingredients created');
  for (const ing of _ingredients) {
    if (!ing.images) continue;

    for (const [index, img] of ing.images.entries()) {
      await prisma.ingredientImage.create({
        data: {
          ingredientId: ing.id,
          url: img.url,
          sortOrder: img.sortOrder ?? index,
        },
      });
    }
  }

  // ============================
  // 4. Products (from user project + admin project)
  // ============================
  try {
    // Create products from user project with tenantId (LDM)
    const productsWithTenant = products.map((p) => ({
      name: p.name,
      categoryId: p.categoryId,
      tenantId: ldm.id,
      slug: slugify(p.name, { lower: true }),
    }));

    await prisma.product.createMany({
      data: productsWithTenant,
    });

    // 4b. Product images
    for (const p of products) {
      const product = await prisma.product.findFirst({
        where: { name: p.name, tenantId: ldm.id },
      });

      if (!product || !p.images) continue;

      const images = Array.isArray(p.images)
        ? p.images
        : [{ url: p.images, sortOrder: 0 }];

      for (const [index, img] of images.entries()) {
        await prisma.productImage.create({
          data: {
            productId: product.id,
            url: img.url ?? img,
            sortOrder: img.sortOrder ?? index,
          },
        });
      }
    }
  } catch (error: unknown) {
    console.error(
      'Error creating products:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    console.error('Trying to create products one by one...');

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      try {
        await prisma.product.create({
          data: {
            name: p.name,
            categoryId: p.categoryId,
            tenantId: ldm.id,
            slug: slugify(p.name, { lower: true }),
          },
        });
      } catch (e: unknown) {
        console.error(`❌ Error creating product ${i}: ${p.name}`);
        console.error('Product data:', p);
        throw e;
      }
    }

    throw error;
  }

  // примеры продуктов с материалами (от пользовательского проекта)
  const profileSteel = await prisma.product.create({
    data: {
      name: 'REHAU 245536',
      slug: slugify('REHAU 245536', { lower: true }),
      images: {
        create: [{ url: '/assets/OIG2.jpg', sortOrder: 0 }],
      },
      tenantId: ldm.id,
      categoryId: categorySteel.id,
      ingredients: {
        connect: _ingredients.slice(0, 7).map((i) => ({ id: i.id })),
      },
    },
  });
  const profileSteel2 = await prisma.product.create({
    data: {
      name: 'Труба сварная',
      slug: slugify('Труба сварная', { lower: true }),
      images: {
        create: [{ url: '/assets/OIG3.jpg', sortOrder: 0 }],
      },
      tenantId: ldm.id,
      categoryId: categorySteel.id,
      ingredients: {
        connect: _ingredients.slice(8, 13).map((i) => ({ id: i.id })),
      },
    },
  });
  const profileSteel3 = await prisma.product.create({
    data: {
      name: 'Полоса оцинкованная',
      slug: slugify('Полоса оцинкованная', { lower: true }),
      images: {
        create: [{ url: '/assets/Polosa_Otsinkovannaya.jpg', sortOrder: 0 }],
      },
      tenantId: ldm.id,
      categoryId: categorySteel.id,
      ingredients: {
        connect: _ingredients.slice(14, 21).map((i) => ({ id: i.id })),
      },
    },
  });

  const profilePvc1 = await prisma.product.create({
    data: {
      name: 'ПВХ профиль REACHMONT Рама',
      slug: slugify('ПВХ профиль REACHMONT Рама', { lower: true }),
      images: {
        create: [{ url: '/assets/REACHMONT_Rama_60мм.jpg', sortOrder: 0 }],
      },
      tenantId: ldm.id,
      categoryId: categoryPVC.id,
      ingredients: {
        connect: _ingredients.slice(0, 10).map((i) => ({ id: i.id })),
      },
    },
  });
  const profilePvc2 = await prisma.product.create({
    data: {
      name: 'ПВХ профиль REACHMONT Импост',
      slug: slugify('ПВХ профиль REACHMONT Импост', { lower: true }),
      images: {
        create: [{ url: '/assets/REACHMONT_Inpost_60мм.jpg', sortOrder: 0 }],
      },
      tenantId: ldm.id,
      categoryId: categoryPVC.id,
      ingredients: {
        connect: _ingredients.slice(11, 18).map((i) => ({ id: i.id })),
      },
    },
  });
  const profilePvc3 = await prisma.product.create({
    data: {
      name: 'ПВХ профиль REACHMONT Створка',
      slug: slugify('ПВХ профиль REACHMONT Створка', { lower: true }),
      images: {
        create: [{ url: '/assets/REACHMONT_Stvorka_60мм.jpg', sortOrder: 0 }],
      },
      tenantId: ldm.id,
      categoryId: categoryPVC.id,
      ingredients: {
        connect: _ingredients.slice(19, 27).map((i) => ({ id: i.id })),
      },
    },
  });
  const profilePvc4 = await prisma.product.create({
    data: {
      name: 'ПВХ профиль REACHMONT Соединительный',
      slug: slugify('ПВХ профиль REACHMONT Соединительный', { lower: true }),
      images: {
        create: [
          {
            url: '/assets/REACHMONT_Profile_Soedenetel_60мм.jpg',
            sortOrder: 0,
          },
        ],
      },
      tenantId: ldm.id,
      categoryId: categoryPVC.id,
      ingredients: {
        connect: _ingredients.slice(15, 29).map((i) => ({ id: i.id })),
      },
    },
  });
  const profileAl1 = await prisma.product.create({
    data: {
      name: 'Рама Нижняя Provedal КПС 034',
      slug: slugify('Рама Нижняя Provedal КПС 034', { lower: true }),
      images: {
        create: [
          { url: '/assets/Rama_Niz_Provedal_КПС_034.jpg', sortOrder: 0 },
        ],
      },
      tenantId: ldm.id,
      categoryId: categorySteel.id,
      ingredients: {
        connect: _ingredients.slice(7, 10).map((i) => ({ id: i.id })),
      },
    },
  });
  const profileAl2 = await prisma.product.create({
    data: {
      name: 'Provedal Рама Верхняя (КПС 035)',
      slug: slugify('Provedal Рама Верхняя (КПС 035)', { lower: true }),
      images: {
        create: [
          { url: '/assets/Provedal_Rama_Verh_(КПС_035).jpg', sortOrder: 0 },
        ],
      },
      tenantId: ldm.id,
      categoryId: categorySteel.id,
      ingredients: {
        connect: _ingredients.slice(11, 18).map((i) => ({ id: i.id })),
      },
    },
  });
  const profileAl3 = await prisma.product.create({
    data: {
      name: 'Provedal Рама Боковая (КПС 036)',
      slug: slugify('Provedal Рама Боковая (КПС 036)', { lower: true }),
      images: {
        create: [
          { url: '/assets/Provedal_Rama_Bock_(КПС_036).jpg', sortOrder: 0 },
        ],
      },
      tenantId: ldm.id,
      categoryId: categorySteel.id,
      ingredients: {
        connect: _ingredients.slice(19, 27).map((i) => ({ id: i.id })),
      },
    },
  });

  // Простые продукты для администратора (админская часть)
  const productLDM = await prisma.product.create({
    data: {
      name: 'Steel Pipe 40x20',
      slug: slugify('Steel Pipe 40x20', { lower: true }),
      images: {
        create: [{ url: '/images/steel-pipe.jpg', sortOrder: 0 }],
      },
      tenantId: ldm.id,
      categoryId: categorySteel.id,
    },
  });

  const productCompany2 = await prisma.product.create({
    data: {
      name: 'PVC Panel White',
      slug: slugify('PVC Panel White', { lower: true }),
      images: {
        create: [{ url: '/images/pvc-panel.jpg', sortOrder: 0 }],
      },
      tenantId: company2.id,
      categoryId: categoryPVC.id,
    },
  });

  console.log('Products created');

  // ============================
  // 5. Product Items
  // ============================
  const itemLDM = await prisma.productItem.create({
    data: {
      productId: productLDM.id,
      price: 1200,
      productMaterials: 'STEEL',
      productLength: 2,
      productThickness: 2,
      steelSize: 3,
      sku: `SKU-${productLDM.id}-1`,
      inventory: {
        create: {
          quantity: 0,
          tenantId: ldm.id,
        },
      },
    },
    include: {
      inventory: true,
    },
  });

  const itemCompany2 = await prisma.productItem.create({
    data: {
      productId: productCompany2.id,
      price: 800,
      productMaterials: 'PVC',
      pvcSize: 2,
      productLength: 1,
      sku: `SKU-${productCompany2.id}-1`,
      inventory: {
        create: {
          quantity: 0,
          tenantId: company2.id,
        },
      },
    },
    include: {
      inventory: true,
    },
  });

  console.log('Product items created');

  // ============================
  // 7. Product Items (from user project - много вариантов)
  // ============================

  const items = [
    generateProductItem({
      productId: profilePvc1.id,
      pvcSize: 2,
      productLength: 3,
      productColor: 1,
      productMaterials: 'PVC',
    }),
    generateProductItem({
      productId: profilePvc1.id,
      pvcSize: 2,
      productLength: 3,
      productColor: 2,
      productMaterials: 'PVC',
    }),
    generateProductItem({
      productId: profilePvc1.id,
      pvcSize: 4,
      productLength: 2,
      productColor: 1,
      productMaterials: 'PVC',
    }),
    generateProductItem({
      productId: profilePvc1.id,
      pvcSize: 4,
      productLength: 3,
      productColor: 1,
      productMaterials: 'PVC',
    }),
    generateProductItem({
      productId: profilePvc1.id,
      pvcSize: 4,
      productLength: 3,
      productColor: 2,
      productMaterials: 'PVC',
    }),
    generateProductItem({
      productId: profilePvc1.id,
      pvcSize: 4,
      productLength: 2,
      productColor: 1,
      productMaterials: 'PVC',
    }),
    //ПВХ профиль REACHMONT Импост 60мм
    generateProductItem({
      productId: profilePvc2.id,
      pvcSize: 1,
      productLength: 3,
      productColor: 1,
      productMaterials: 'PVC',
    }),
    generateProductItem({
      productId: profilePvc2.id,
      pvcSize: 2,
      productLength: 3,
      productColor: 2,
      productMaterials: 'PVC',
    }),
    generateProductItem({
      productId: profilePvc2.id,
      pvcSize: 4,
      productLength: 2,
      productColor: 1,
      productMaterials: 'PVC',
    }),
    generateProductItem({
      productId: profilePvc2.id,
      pvcSize: 4,
      productLength: 2,
      productColor: 2,
      productMaterials: 'PVC',
    }),
    generateProductItem({
      productId: profilePvc2.id,
      pvcSize: 4,
      productLength: 3,
      productColor: 3,
      productMaterials: 'PVC',
    }),
    //ПВХ профиль REACHMONT Створка 60мм
    generateProductItem({
      productId: profilePvc3.id,
      pvcSize: 4,
      productLength: 2,
      productColor: 1,
      productMaterials: 'PVC',
    }),
    generateProductItem({
      productId: profilePvc3.id,
      pvcSize: 3,
      productLength: 3,
      productColor: 1,
      productMaterials: 'PVC',
    }),
    generateProductItem({
      productId: profilePvc3.id,
      pvcSize: 2,
      productLength: 2,
      productColor: 2,
      productMaterials: 'PVC',
    }),
    generateProductItem({
      productId: profilePvc3.id,
      pvcSize: 5,
      productLength: 3,
      productColor: 2,
      productMaterials: 'PVC',
    }),

    generateProductItem({
      productId: profilePvc4.id,
      pvcSize: 2,
      productLength: 2,
      productColor: 1,
      productMaterials: 'PVC',
    }),
    generateProductItem({
      productId: profilePvc4.id,
      pvcSize: 3,
      productLength: 3,
      productColor: 2,
      productMaterials: 'PVC',
    }),
    generateProductItem({
      productId: profilePvc4.id,
      pvcSize: 4,
      productLength: 3,
      productColor: 3,
      productMaterials: 'PVC',
    }),

    // Профиль REHAU 245536 — разные типы профиля и длины
    generateProductItem({
      productId: profileSteel.id,
      productLength: 1,
      steelSize: 1,
      productThickness: 1,
      productMaterials: 'STEEL',
    }),
    generateProductItem({
      productId: profileSteel.id,
      productLength: 2,
      steelSize: 1,
      productThickness: 2,
      productMaterials: 'STEEL',
    }),
    generateProductItem({
      productId: profileSteel.id,
      productLength: 2,
      steelSize: 3,
      productThickness: 3,
      productMaterials: 'STEEL',
    }),

    generateProductItem({
      productId: profileSteel.id,
      productLength: 2,
      steelSize: 2,
      productThickness: 1,
      productMaterials: 'STEEL',
    }),
    generateProductItem({
      productId: profileSteel.id,
      productLength: 2,
      steelSize: 3,
      productThickness: 3,
      productMaterials: 'STEEL',
    }),
    generateProductItem({
      productId: profileSteel.id,
      productLength: 2,
      steelSize: 4,
      productThickness: 2,
      productMaterials: 'STEEL',
    }),

    // Труба сварная 40х50х2мм (6м) — разные размеры и длины
    generateProductItem({
      productId: profileSteel2.id,
      productLength: 1,
      steelSize: 5,
      productThickness: 3,
      productMaterials: 'STEEL',
    }),
    generateProductItem({
      productId: profileSteel2.id,
      productLength: 1,
      steelSize: 6,
      productThickness: 2,
      productMaterials: 'STEEL',
    }),
    generateProductItem({
      productId: profileSteel2.id,
      productLength: 1,
      steelSize: 4,
      productThickness: 3,
      productMaterials: 'STEEL',
    }),

    // Полоса оцинкованная 100х6мм (6м) — разные длины
    generateProductItem({
      productId: profileSteel3.id,
      productLength: 2,
      productThickness: 4,
      productMaterials: 'STEEL',
    }),
    generateProductItem({
      productId: profileSteel3.id,
      productLength: 2,
      productThickness: 2,
      productMaterials: 'STEEL',
    }),
    generateProductItem({
      productId: profileSteel3.id,
      productLength: 2,
      productThickness: 3,
      productMaterials: 'STEEL',
    }),
    generateProductItem({
      productId: profileAl1.id,
      productColor: 1,
      productLength: 1,
      productMaterials: 'ALUMINIUM',
    }),
    generateProductItem({
      productId: profileAl1.id,
      productColor: 1,
      productLength: 2,
      productMaterials: 'ALUMINIUM',
    }),
    generateProductItem({
      productId: profileAl1.id,
      productColor: 2,
      productLength: 1,
      productMaterials: 'ALUMINIUM',
    }),
    generateProductItem({
      productId: profileAl2.id,
      productColor: 1,
      productLength: 1,
      productMaterials: 'ALUMINIUM',
    }),
    generateProductItem({
      productId: profileAl2.id,
      productColor: 2,
      productLength: 1,
      productMaterials: 'ALUMINIUM',
    }),
    generateProductItem({
      productId: profileAl2.id,
      productColor: 1,
      productLength: 2,
      productMaterials: 'ALUMINIUM',
    }),
    generateProductItem({
      productId: profileAl3.id,
      productColor: 1,
      productLength: 1,
      productMaterials: 'ALUMINIUM',
    }),
    generateProductItem({
      productId: profileAl3.id,
      productColor: 2,
      productLength: 1,
      productMaterials: 'ALUMINIUM',
    }),
    generateProductItem({
      productId: profileAl3.id,
      productColor: 3,
      productLength: 2,
      productMaterials: 'ALUMINIUM',
    }),
    generateProductItem({
      productId: profileAl3.id,
      productColor: 2,
      productLength: 2,
      productMaterials: 'ALUMINIUM',
    }),
  ];
  for (const item of items) {
    await prisma.productItem.create({
      data: {
        ...item,
        inventory: {
          create: {
            quantity: 0,
            tenantId: ldm.id, // твой tenant
          },
        },
      },
    });
  }

  // ============================
  // 8. Orders (от административного проекта)

  // Admin LDM
  await prisma.order.create({
    data: {
      userId: adminLDM.id,
      tenantId: ldm.id,
      token: 'order_ldm_admin_1',
      totalAmount: 1200,
      status: 'PENDING',
      fullName: 'Админ ЛДМ',
      email: 'admin@ldm.ru',
      phone: '+79990000001',
      address: 'СПб, ул. Админа',
      items: [
        {
          productItemId: itemLDM.id,
          name: productLDM.name,
          price: itemLDM.price,
          qty: 1,
        },
      ],
    },
  });

  // Manager LDM
  await prisma.order.create({
    data: {
      userId: managerLDM.id,
      tenantId: ldm.id,
      token: 'order_ldm_manager_1',
      totalAmount: 2400,
      status: 'SUCCEEDED',
      fullName: 'Менеджер ЛДМ',
      email: 'manager@ldm.ru',
      phone: '+79990000002',
      address: 'СПб, ул. Менеджера',
      items: [
        {
          productItemId: itemLDM.id,
          name: productLDM.name,
          price: itemLDM.price,
          qty: 2,
        },
      ],
    },
  });

  // User LDM
  await prisma.order.create({
    data: {
      userId: userLDM.id,
      tenantId: ldm.id,
      token: 'order_ldm_user_1',
      totalAmount: 3600,
      status: 'PENDING',
      fullName: 'Покупатель ЛДМ',
      email: 'user@ldm.ru',
      phone: '+79990000003',
      address: 'СПб, ул. Покупателя',
      items: [
        {
          productItemId: itemLDM.id,
          name: productLDM.name,
          price: itemLDM.price,
          qty: 3,
        },
      ],
    },
  });

  // Admin Company2
  await prisma.order.create({
    data: {
      userId: adminCompany2.id,
      tenantId: company2.id,
      token: 'order_company2_admin_1',
      totalAmount: 800,
      status: 'SUCCEEDED',
      fullName: 'Админ Company2',
      email: 'admin@company2.ru',
      phone: '+79991111112',
      address: 'Москва, ул. Админа',
      items: [
        {
          productItemId: itemCompany2.id,
          name: productCompany2.name,
          price: itemCompany2.price,
          qty: 1,
        },
      ],
    },
  });

  // User Company2
  await prisma.order.create({
    data: {
      userId: userCompany2.id,
      tenantId: company2.id,
      token: 'order_company2_user_1',
      totalAmount: 1600,
      status: 'PENDING',
      fullName: 'Покупатель Company2',
      email: 'user@company2.ru',
      phone: '+79991111113',
      address: 'Москва, ул. Покупателя',
      items: [
        {
          productItemId: itemCompany2.id,
          name: productCompany2.name,
          price: itemCompany2.price,
          qty: 2,
        },
      ],
    },
  });

  // Manager 2 LDM
  await prisma.order.create({
    data: {
      userId: manager2LDM.id,
      tenantId: ldm.id,
      token: 'order_ldm_manager2_1',
      totalAmount: 2400,
      status: 'PENDING',
      fullName: 'Менеджер 2 ЛДМ',
      email: 'manager2@ldm.ru',
      phone: '+79990000004',
      address: 'СПб, ул. Менеджера 2',
      items: [
        {
          productItemId: itemLDM.id,
          name: productLDM.name,
          price: itemLDM.price,
          qty: 2,
        },
      ],
    },
  });

  // Admin 2 LDM
  await prisma.order.create({
    data: {
      userId: admin2LDM.id,
      tenantId: ldm.id,
      token: 'order_ldm_admin2_1',
      totalAmount: 1200,
      status: 'SUCCEEDED',
      fullName: 'Админ 2 ЛДМ',
      email: 'admin2@ldm.ru',
      phone: '+79990000005',
      address: 'СПб, ул. Админа 2',
      items: [
        {
          productItemId: itemLDM.id,
          name: productLDM.name,
          price: itemLDM.price,
          qty: 1,
        },
      ],
    },
  });

  // Admin 2 Company2
  await prisma.order.create({
    data: {
      userId: admin2Company2.id,
      tenantId: company2.id,
      token: 'order_company2_admin2_1',
      totalAmount: 1600,
      status: 'PENDING',
      fullName: 'Админ 2 Company2',
      email: 'admin2@company2.ru',
      phone: '+79991111114',
      address: 'Москва, ул. Админа 2',
      items: [
        {
          productItemId: itemCompany2.id,
          name: productCompany2.name,
          price: itemCompany2.price,
          qty: 2,
        },
      ],
    },
  });

  // Manager Company2
  await prisma.order.create({
    data: {
      userId: managerCompany2.id,
      tenantId: company2.id,
      token: 'order_company2_manager_1',
      totalAmount: 800,
      status: 'SUCCEEDED',
      fullName: 'Менеджер Company2',
      email: 'manager@company2.ru',
      phone: '+79991111115',
      address: 'Москва, ул. Менеджера',
      items: [
        {
          productItemId: itemCompany2.id,
          name: productCompany2.name,
          price: itemCompany2.price,
          qty: 1,
        },
      ],
    },
  });

  console.log('Orders created');

  // ============================
  // 9. Stories (от пользовательского проекта)
  // ============================
  await prisma.story.createMany({
    data: [
      {
        previewImageUrl: '/assets/insta-react/aluplast.jpg',
      },
      {
        previewImageUrl: '/assets/insta-react/armiruyshaya-vstavka.jpg',
      },
      {
        previewImageUrl: '/assets/insta-react/artec.jpg',
      },
      {
        previewImageUrl: '/assets/insta-react/gealan.jpg',
      },
      {
        previewImageUrl: '/assets/insta-react/kbe.jpg',
      },
      {
        previewImageUrl: '/assets/insta-react/montblanc.jpg',
      },
      {
        previewImageUrl: '/assets/insta-react/plafen.jpg',
      },
      {
        previewImageUrl: '/assets/insta-react/provedal1.jpg',
      },
      {
        previewImageUrl: '/assets/insta-react/rehau.jpg',
      },
      {
        previewImageUrl: '/assets/insta-react/veka.jpg',
      },
      {
        previewImageUrl: '/assets/insta-react/wintech.jpg',
      },
    ],
  });

  // Get actual story IDs since they might have been auto-incremented
  const stories = await prisma.story.findMany();
  const story1 = stories[0]?.id || 1;
  const story2 = stories[1]?.id || 2;
  const story3 = stories[2]?.id || 3;

  try {
    await prisma.storyItem.createMany({
      data: [
        {
          storyId: story1,
          sourceUrl: 'http://ldm-steel.com/wp-content/uploads/03.png',
        },
        {
          storyId: story1,
          sourceUrl:
            'http://ldm-steel.com/wp-content/uploads/image/certificates/sanzakl_sm.jpg',
        },
        {
          storyId: story1,
          sourceUrl:
            'http://ldm-steel.com/wp-content/uploads/image/certificates/sanzakl2_sm.jpg',
        },
        {
          storyId: story1,
          sourceUrl:
            'http://ldm-steel.com/wp-content/uploads/image/certificates/gigienharact_sm.jpg',
        },
        {
          storyId: story2,
          sourceUrl:
            'http://ldm-steel.com/wp-content/uploads/image/certificates/gigienharact2_sm.jpg',
        },
        {
          storyId: story2,
          sourceUrl: 'http://ldm-steel.com/wp-content/uploads/se%60ndvich.jpg',
        },
        {
          storyId: story2,
          sourceUrl:
            'http://ldm-steel.com/wp-content/uploads/Sertifikat_do-2013-uplotneniya-e1369978366913.jpg',
        },
        {
          storyId: story3,
          sourceUrl:
            'http://ldm-steel.com/wp-content/uploads/P_20150323_163144.jpg',
        },
        {
          storyId: story2,
          sourceUrl: 'http://ldm-steel.com/wp-content/uploads/02.png',
        },
      ],
    });
    console.log('Stories created');
  } catch {
    console.log('⚠️ StoryItem creation skipped');
  }
  console.log('🌱 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
