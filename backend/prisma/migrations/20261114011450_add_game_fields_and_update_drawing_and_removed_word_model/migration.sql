/*
  Warnings:

  - You are about to drop the `words` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[join_code]` on the table `games` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lobby_name` to the `games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max_participants` to the `games` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vote_end_date` to the `games` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Privacy" ADD VALUE 'SOLO';

-- AlterTable
ALTER TABLE "drawings" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "submitted_at" DROP NOT NULL,
ALTER COLUMN "submitted_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "games" ADD COLUMN     "join_code" VARCHAR(10),
ADD COLUMN     "lobby_name" VARCHAR(50) NOT NULL,
ADD COLUMN     "max_participants" INTEGER NOT NULL,
ADD COLUMN     "vote_end_date" TIMESTAMPTZ(6) NOT NULL;

-- DropTable
DROP TABLE "words";

-- DropEnum
DROP TYPE "Difficulty";

-- CreateIndex
CREATE UNIQUE INDEX "games_join_code_key" ON "games"("join_code");
