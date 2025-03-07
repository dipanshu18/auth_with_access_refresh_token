/*
  Warnings:

  - Added the required column `expires-at` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "expires-at" TIMESTAMP(3) NOT NULL;
