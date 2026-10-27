-- CreateTable
CREATE TABLE "ms_setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL DEFAULT '',
    "group" TEXT NOT NULL DEFAULT 'general',
    "label" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'text',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ms_setting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "ms_tag" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ms_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ms_company" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "summary" TEXT,
    "logo_asset_id" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ms_company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_asset" (
    "id" TEXT NOT NULL,
    "silos_file_id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL DEFAULT 0,
    "url" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "alt" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'image',
    "scope" TEXT NOT NULL DEFAULT 'portfolio',
    "folder" TEXT NOT NULL DEFAULT '',
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_profile" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "full_name" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',
    "hero_line_1" TEXT NOT NULL DEFAULT '',
    "hero_line_2" TEXT NOT NULL DEFAULT '',
    "about_heading" TEXT NOT NULL DEFAULT '',
    "footer_tagline" TEXT NOT NULL DEFAULT '',
    "logo_asset_id" TEXT,
    "hero_portrait_asset_id" TEXT,
    "about_background_asset_id" TEXT,
    "footer_background_asset_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_social_link" (
    "id" TEXT NOT NULL,
    "profile_id" INTEGER NOT NULL DEFAULT 1,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'website',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "tb_social_link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_hero_pattern" (
    "id" TEXT NOT NULL,
    "profile_id" INTEGER NOT NULL DEFAULT 1,
    "asset_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "tb_hero_pattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_experience" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "period_label" TEXT NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_experience_highlight" (
    "id" TEXT NOT NULL,
    "experience_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tb_experience_highlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_project" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company_id" TEXT,
    "logo_asset_id" TEXT,
    "background_asset_id" TEXT,
    "foreground_asset_id" TEXT,
    "section_background_asset_id" TEXT,
    "accent" TEXT,
    "blurb" TEXT NOT NULL DEFAULT '',
    "summary" TEXT NOT NULL DEFAULT '',
    "role" TEXT,
    "period_label" TEXT,
    "is_featured" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_project_feature" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "tb_project_feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_project_tag" (
    "project_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "tb_project_tag_pkey" PRIMARY KEY ("project_id","tag_id")
);

-- CreateTable
CREATE TABLE "tb_dephilia_product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "accent" TEXT,
    "icon_asset_id" TEXT,
    "background_asset_id" TEXT,
    "url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_dephilia_product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_certification" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "period_label" TEXT NOT NULL,
    "accent" TEXT,
    "logo_asset_id" TEXT,
    "credential_id" TEXT,
    "url" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_community_role" (
    "id" TEXT NOT NULL,
    "programme" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "period_label" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'cloud',
    "metric" TEXT NOT NULL DEFAULT '',
    "metric_note" TEXT NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "tb_community_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_education" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "school" TEXT NOT NULL DEFAULT '',
    "degree" TEXT NOT NULL DEFAULT '',
    "period_label" TEXT NOT NULL DEFAULT '',
    "detail" TEXT NOT NULL DEFAULT '',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_contact_message" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL DEFAULT '',
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "source" TEXT NOT NULL DEFAULT 'portfolio',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_contact_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_email_log" (
    "id" TEXT NOT NULL,
    "contact_message_id" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'contact',
    "to_email" TEXT NOT NULL,
    "subject" TEXT NOT NULL DEFAULT '',
    "provider" TEXT NOT NULL DEFAULT 'echo',
    "status" TEXT NOT NULL DEFAULT 'sent',
    "error" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tb_email_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tb_personal_section" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tb_personal_section_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ms_tag_slug_key" ON "ms_tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ms_company_slug_key" ON "ms_company"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tb_asset_silos_file_id_key" ON "tb_asset"("silos_file_id");

-- CreateIndex
CREATE INDEX "tb_asset_scope_status_idx" ON "tb_asset"("scope", "status");

-- CreateIndex
CREATE INDEX "tb_experience_company_id_idx" ON "tb_experience"("company_id");

-- CreateIndex
CREATE INDEX "tb_experience_highlight_experience_id_idx" ON "tb_experience_highlight"("experience_id");

-- CreateIndex
CREATE UNIQUE INDEX "tb_project_slug_key" ON "tb_project"("slug");

-- CreateIndex
CREATE INDEX "tb_project_status_sort_order_idx" ON "tb_project"("status", "sort_order");

-- CreateIndex
CREATE INDEX "tb_project_feature_project_id_idx" ON "tb_project_feature"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "tb_dephilia_product_slug_key" ON "tb_dephilia_product"("slug");

-- CreateIndex
CREATE INDEX "tb_contact_message_status_created_at_idx" ON "tb_contact_message"("status", "created_at");

-- CreateIndex
CREATE INDEX "tb_email_log_sent_at_idx" ON "tb_email_log"("sent_at");

-- CreateIndex
CREATE UNIQUE INDEX "tb_personal_section_key_key" ON "tb_personal_section"("key");

-- AddForeignKey
ALTER TABLE "ms_company" ADD CONSTRAINT "ms_company_logo_asset_id_fkey" FOREIGN KEY ("logo_asset_id") REFERENCES "tb_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_profile" ADD CONSTRAINT "tb_profile_logo_asset_id_fkey" FOREIGN KEY ("logo_asset_id") REFERENCES "tb_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_profile" ADD CONSTRAINT "tb_profile_hero_portrait_asset_id_fkey" FOREIGN KEY ("hero_portrait_asset_id") REFERENCES "tb_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_profile" ADD CONSTRAINT "tb_profile_about_background_asset_id_fkey" FOREIGN KEY ("about_background_asset_id") REFERENCES "tb_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_profile" ADD CONSTRAINT "tb_profile_footer_background_asset_id_fkey" FOREIGN KEY ("footer_background_asset_id") REFERENCES "tb_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_social_link" ADD CONSTRAINT "tb_social_link_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "tb_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_hero_pattern" ADD CONSTRAINT "tb_hero_pattern_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "tb_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_hero_pattern" ADD CONSTRAINT "tb_hero_pattern_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "tb_asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_experience" ADD CONSTRAINT "tb_experience_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "ms_company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_experience_highlight" ADD CONSTRAINT "tb_experience_highlight_experience_id_fkey" FOREIGN KEY ("experience_id") REFERENCES "tb_experience"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_project" ADD CONSTRAINT "tb_project_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "ms_company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_project" ADD CONSTRAINT "tb_project_logo_asset_id_fkey" FOREIGN KEY ("logo_asset_id") REFERENCES "tb_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_project" ADD CONSTRAINT "tb_project_background_asset_id_fkey" FOREIGN KEY ("background_asset_id") REFERENCES "tb_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_project" ADD CONSTRAINT "tb_project_foreground_asset_id_fkey" FOREIGN KEY ("foreground_asset_id") REFERENCES "tb_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_project" ADD CONSTRAINT "tb_project_section_background_asset_id_fkey" FOREIGN KEY ("section_background_asset_id") REFERENCES "tb_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_project_feature" ADD CONSTRAINT "tb_project_feature_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "tb_project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_project_tag" ADD CONSTRAINT "tb_project_tag_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "tb_project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_project_tag" ADD CONSTRAINT "tb_project_tag_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "ms_tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_dephilia_product" ADD CONSTRAINT "tb_dephilia_product_icon_asset_id_fkey" FOREIGN KEY ("icon_asset_id") REFERENCES "tb_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_dephilia_product" ADD CONSTRAINT "tb_dephilia_product_background_asset_id_fkey" FOREIGN KEY ("background_asset_id") REFERENCES "tb_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_certification" ADD CONSTRAINT "tb_certification_logo_asset_id_fkey" FOREIGN KEY ("logo_asset_id") REFERENCES "tb_asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tb_email_log" ADD CONSTRAINT "tb_email_log_contact_message_id_fkey" FOREIGN KEY ("contact_message_id") REFERENCES "tb_contact_message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
