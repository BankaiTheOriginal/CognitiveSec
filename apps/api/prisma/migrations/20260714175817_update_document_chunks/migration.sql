/*
  Warnings:

  - You are about to drop the column `organizationId` on the `document_chunks` table. All the data in the column will be lost.
  - Added the required column `organization_id` to the `document_chunks` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "document_chunks_organizationId_idx";

-- AlterTable
ALTER TABLE "document_chunks" DROP COLUMN "organizationId",
ADD COLUMN     "organization_id" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "document_chunks_organization_id_idx" ON "document_chunks"("organization_id");
