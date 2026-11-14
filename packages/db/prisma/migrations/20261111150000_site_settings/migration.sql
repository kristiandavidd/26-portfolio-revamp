-- General settings: background music and one favicon per app.

CREATE TABLE "tb_site_setting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "music_asset_id" TEXT,
    "portfolio_favicon_asset_id" TEXT,
    "personal_favicon_asset_id" TEXT,
    "manage_favicon_asset_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_site_setting_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "tb_site_setting_music_asset_id_idx" ON "tb_site_setting"("music_asset_id");
CREATE INDEX "tb_site_setting_portfolio_favicon_asset_id_idx" ON "tb_site_setting"("portfolio_favicon_asset_id");
CREATE INDEX "tb_site_setting_personal_favicon_asset_id_idx" ON "tb_site_setting"("personal_favicon_asset_id");
CREATE INDEX "tb_site_setting_manage_favicon_asset_id_idx" ON "tb_site_setting"("manage_favicon_asset_id");

ALTER TABLE "tb_site_setting"
  ADD CONSTRAINT "tb_site_setting_music_asset_id_fkey"
  FOREIGN KEY ("music_asset_id") REFERENCES "tb_asset"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "tb_site_setting"
  ADD CONSTRAINT "tb_site_setting_portfolio_favicon_asset_id_fkey"
  FOREIGN KEY ("portfolio_favicon_asset_id") REFERENCES "tb_asset"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "tb_site_setting"
  ADD CONSTRAINT "tb_site_setting_personal_favicon_asset_id_fkey"
  FOREIGN KEY ("personal_favicon_asset_id") REFERENCES "tb_asset"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "tb_site_setting"
  ADD CONSTRAINT "tb_site_setting_manage_favicon_asset_id_fkey"
  FOREIGN KEY ("manage_favicon_asset_id") REFERENCES "tb_asset"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
