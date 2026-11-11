-- Adds the hero background for the personal landing page, managed from the panel.

ALTER TABLE "tb_personal_profile" ADD COLUMN "hero_asset_id" TEXT;

ALTER TABLE "tb_personal_profile"
  ADD CONSTRAINT "tb_personal_profile_hero_asset_id_fkey"
  FOREIGN KEY ("hero_asset_id") REFERENCES "tb_asset"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "tb_personal_profile_hero_asset_id_idx"
  ON "tb_personal_profile"("hero_asset_id");
