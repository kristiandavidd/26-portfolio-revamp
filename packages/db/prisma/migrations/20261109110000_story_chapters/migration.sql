-- Story becomes chapter -> subchapter -> paragraph. Existing cards are carried
-- over: one chapter per period label, each card becomes a subchapter, and its
-- body becomes the first paragraph.

CREATE TABLE "tb_personal_chapter" (
    "id" TEXT NOT NULL,
    "year" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tb_personal_chapter_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "tb_personal_chapter_status_sort_order_idx" ON "tb_personal_chapter"("status", "sort_order");

CREATE TABLE "tb_personal_subchapter" (
    "id" TEXT NOT NULL,
    "chapter_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tb_personal_subchapter_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "tb_personal_subchapter_chapter_id_status_sort_order_idx" ON "tb_personal_subchapter"("chapter_id", "status", "sort_order");

CREATE TABLE "tb_personal_paragraph" (
    "id" TEXT NOT NULL,
    "subchapter_id" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tb_personal_paragraph_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "tb_personal_paragraph_subchapter_id_sort_order_idx" ON "tb_personal_paragraph"("subchapter_id", "sort_order");

ALTER TABLE "tb_personal_subchapter" ADD CONSTRAINT "tb_personal_subchapter_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "tb_personal_chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "tb_personal_paragraph" ADD CONSTRAINT "tb_personal_paragraph_subchapter_id_fkey" FOREIGN KEY ("subchapter_id") REFERENCES "tb_personal_subchapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "tb_personal_chapter" ("id", "year", "title", "sort_order", "status", "created_at", "updated_at")
SELECT
    'ch_' || md5(s."period_label"),
    s."period_label",
    '',
    MIN(s."sort_order"),
    1,
    MIN(s."created_at"),
    MAX(s."updated_at")
FROM "tb_personal_story" s
GROUP BY s."period_label";

INSERT INTO "tb_personal_subchapter" ("id", "chapter_id", "title", "sort_order", "status", "created_at", "updated_at", "deleted_at")
SELECT
    s."id",
    'ch_' || md5(s."period_label"),
    s."title",
    s."sort_order",
    s."status",
    s."created_at",
    s."updated_at",
    s."deleted_at"
FROM "tb_personal_story" s;

INSERT INTO "tb_personal_paragraph" ("id", "subchapter_id", "body", "sort_order", "created_at", "updated_at")
SELECT
    'p_' || s."id",
    s."id",
    s."body",
    0,
    s."created_at",
    s."updated_at"
FROM "tb_personal_story" s
WHERE btrim(s."body") <> '';

DROP TABLE "tb_personal_story";
