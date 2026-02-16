/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Ingredient` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Ingredient" DROP COLUMN "imageUrl";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "imageUrl";

-- CreateTable
CREATE TABLE "IngredientImage" (
    "id" SERIAL NOT NULL,
    "ingredientId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "IngredientImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IngredientImage" ADD CONSTRAINT "IngredientImage_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
