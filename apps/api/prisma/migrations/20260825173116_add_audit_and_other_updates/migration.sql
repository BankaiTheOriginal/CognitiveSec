/*
  Warnings:

  - You are about to drop the column `team_id` on the `chats` table. All the data in the column will be lost.
  - You are about to drop the `team_memberships` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `teams` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "chats" DROP CONSTRAINT "chats_team_id_fkey";

-- DropForeignKey
ALTER TABLE "team_memberships" DROP CONSTRAINT "team_memberships_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "team_memberships" DROP CONSTRAINT "team_memberships_team_id_fkey";

-- DropForeignKey
ALTER TABLE "team_memberships" DROP CONSTRAINT "team_memberships_user_id_fkey";

-- DropForeignKey
ALTER TABLE "teams" DROP CONSTRAINT "teams_organization_id_fkey";

-- AlterTable
ALTER TABLE "chats" DROP COLUMN "team_id";

-- DropTable
DROP TABLE "team_memberships";

-- DropTable
DROP TABLE "teams";
