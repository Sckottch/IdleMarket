-- CreateEnum
CREATE TYPE "StatType" AS ENUM ('Health', 'Attack', 'Defense', 'Speed', 'CriticalChance', 'CriticalDamage');

-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('Helmet', 'Armor', 'Boots', 'Sword');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "gold" INTEGER NOT NULL DEFAULT 100,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "equipmentType" "EquipmentType" NOT NULL,
    "rarity" INTEGER NOT NULL,
    "mainStat" "StatType" NOT NULL,
    "mainStatValue" DOUBLE PRECISION NOT NULL,
    "rating" INTEGER NOT NULL,
    "isEquipped" BOOLEAN NOT NULL DEFAULT false,
    "isForSale" BOOLEAN NOT NULL DEFAULT false,
    "salePrice" INTEGER,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubStat" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "statType" "StatType" NOT NULL,
    "statValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "SubStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Character_userId_key" ON "Character"("userId");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubStat" ADD CONSTRAINT "SubStat_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
