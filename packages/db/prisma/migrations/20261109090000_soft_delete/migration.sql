-- Soft delete: deleted rows stay in place and are filtered out of every read.
ALTER TABLE "ms_company" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "tb_experience" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "tb_project" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "tb_dephilia_product" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "tb_certification" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "tb_community_role" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "tb_personal_story" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "tb_personal_place" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "tb_personal_gallery_item" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "tb_personal_wishlist_item" ADD COLUMN "deleted_at" TIMESTAMP(3);
