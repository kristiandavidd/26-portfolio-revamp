-- Personal side: replace the placeholder section table with real content.
DROP TABLE "tb_personal_section";

CREATE TABLE "tb_personal_profile" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL DEFAULT '',
    "headline" TEXT NOT NULL DEFAULT '',
    "intro" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "portrait_asset_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_personal_profile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tb_personal_story" (
    "id" TEXT NOT NULL,
    "period_label" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "image_asset_id" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_personal_story_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tb_personal_place" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT '',
    "year" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "maps_url" TEXT,
    "image_asset_id" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_personal_place_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tb_personal_gallery_item" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "year" TEXT NOT NULL DEFAULT '',
    "note" TEXT NOT NULL DEFAULT '',
    "image_asset_id" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_personal_gallery_item_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "tb_personal_wishlist_item" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "image_asset_id" TEXT,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_personal_wishlist_item_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "tb_personal_story_status_sort_order_idx" ON "tb_personal_story"("status", "sort_order");
CREATE INDEX "tb_personal_place_status_sort_order_idx" ON "tb_personal_place"("status", "sort_order");
CREATE INDEX "tb_personal_gallery_item_status_sort_order_idx" ON "tb_personal_gallery_item"("status", "sort_order");
CREATE INDEX "tb_personal_wishlist_item_status_sort_order_idx" ON "tb_personal_wishlist_item"("status", "sort_order");

ALTER TABLE "tb_personal_profile" ADD CONSTRAINT "tb_personal_profile_portrait_asset_id_fkey" FOREIGN KEY ("portrait_asset_id") REFERENCES "tb_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tb_personal_story" ADD CONSTRAINT "tb_personal_story_image_asset_id_fkey" FOREIGN KEY ("image_asset_id") REFERENCES "tb_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tb_personal_place" ADD CONSTRAINT "tb_personal_place_image_asset_id_fkey" FOREIGN KEY ("image_asset_id") REFERENCES "tb_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tb_personal_gallery_item" ADD CONSTRAINT "tb_personal_gallery_item_image_asset_id_fkey" FOREIGN KEY ("image_asset_id") REFERENCES "tb_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "tb_personal_wishlist_item" ADD CONSTRAINT "tb_personal_wishlist_item_image_asset_id_fkey" FOREIGN KEY ("image_asset_id") REFERENCES "tb_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
