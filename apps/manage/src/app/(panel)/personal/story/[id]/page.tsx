import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@repo/db";
import { ArrowLeft } from "lucide-react";
import { Card, Field, Input, PageHeader, Textarea } from "@repo/ui";
import { SubmitButton } from "@/components/panel/SubmitButton";
import { DeleteForm } from "@/components/panel/FormBits";
import { Modal } from "@/components/panel/Modal";
import { SortableBody, SortableStack } from "@/components/panel/Sortable";
import { EmptyRow, TableShell, Td, Th } from "@/components/panel/Table";
import { Reorder, StatusToggle } from "@/components/panel/RowActions";
import {
  deleteParagraph,
  deleteSubchapter,
  saveChapter,
  saveParagraph,
  saveSubchapter,
} from "@/lib/actions/personal";

export const dynamic = "force-dynamic";

type Params = { id: string };

type SubchapterRecord = {
  id: string;
  title: string;
  status: number;
  paragraphs: { id: string; body: string }[];
};

function SubchapterForm({
  chapterId,
  subchapter,
}: {
  chapterId: string;
  subchapter?: { id: string; title: string };
}) {
  const key = subchapter?.id ?? "new";

  return (
    <form action={saveSubchapter} className="flex flex-col gap-5">
      <input type="hidden" name="_path" value={`/personal/story/${chapterId}`} />
      <input type="hidden" name="chapterId" value={chapterId} />
      {subchapter ? (
        <input type="hidden" name="id" value={subchapter.id} />
      ) : null}

      <Field
        label="Subchapter title"
        htmlFor={`subchapter-title-${key}`}
        hint="A subheading inside the chapter, e.g. The first day."
      >
        <Input
          id={`subchapter-title-${key}`}
          name="title"
          defaultValue={subchapter?.title ?? ""}
          required
        />
      </Field>

      <div className="flex justify-end">
        <SubmitButton pendingLabel="Saving…">
          {subchapter ? "Save subchapter" : "Add subchapter"}
        </SubmitButton>
      </div>
    </form>
  );
}

function ParagraphForm({
  chapterId,
  subchapterId,
  paragraph,
}: {
  chapterId: string;
  subchapterId: string;
  paragraph?: { id: string; body: string };
}) {
  return (
    <form action={saveParagraph} className="flex flex-col gap-5">
      <input type="hidden" name="_path" value={`/personal/story/${chapterId}`} />
      <input type="hidden" name="subchapterId" value={subchapterId} />
      {paragraph ? (
        <input type="hidden" name="id" value={paragraph.id} />
      ) : null}

      <Field
        label="Paragraph"
        htmlFor={`paragraph-body-${paragraph?.id ?? subchapterId}`}
        hint="Blank lines are kept when the story is rendered."
      >
        <Textarea
          id={`paragraph-body-${paragraph?.id ?? subchapterId}`}
          name="body"
          rows={6}
          defaultValue={paragraph?.body ?? ""}
          required
        />
      </Field>

      <div className="flex justify-end">
        <SubmitButton pendingLabel="Saving…">
          {paragraph ? "Save paragraph" : "Add paragraph"}
        </SubmitButton>
      </div>
    </form>
  );
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const path = `/personal/story/${id}`;

  const chapter = await prisma.personalChapter.findFirst({
    where: { id, deletedAt: null },
    include: {
      subchapters: {
        where: { deletedAt: null },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        include: {
          paragraphs: {
            where: { deletedAt: null },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
      },
    },
  });

  if (!chapter) notFound();

  const paragraphCount = chapter.subchapters.reduce(
    (total, subchapter) => total + subchapter.paragraphs.length,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/personal/story"
        className="inline-flex w-fit items-center gap-1.5 font-mono text-[10px] tracking-[0.16em] text-muted uppercase transition-colors hover:text-ink"
      >
        <ArrowLeft size={12} aria-hidden />
        All chapters
      </Link>

      <PageHeader
        eyebrow="Personal · Story"
        title={chapter.title || `Chapter ${chapter.year || "undated"}`}
        description={`${chapter.year || "Undated"} · ${chapter.subchapters.length} subchapters · ${paragraphCount} paragraphs`}
        actions={
          <Modal
            triggerLabel="New subchapter"
            triggerVariant="primary"
            triggerSize="md"
            title="New subchapter"
            description="A subheading inside this chapter. Paragraphs are added to it afterwards."
          >
            <SubchapterForm chapterId={chapter.id} />
          </Modal>
        }
      />

      <Card className="p-6">
        <div>
          <h2 className="text-sm font-semibold text-ink">Chapter details</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            The year and title as they appear on the public story page.
          </p>
        </div>

        <form action={saveChapter} className="mt-5 flex flex-col gap-4">
          <input type="hidden" name="_path" value={path} />
          <input type="hidden" name="id" value={chapter.id} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Year" htmlFor="chapter-year">
              <Input
                id="chapter-year"
                name="year"
                defaultValue={chapter.year}
                required
              />
            </Field>
            <Field
              label="Chapter title"
              htmlFor="chapter-title"
              hint="Optional. The year is enough if you prefer."
            >
              <Input
                id="chapter-title"
                name="title"
                defaultValue={chapter.title}
              />
            </Field>
          </div>

          <div className="flex justify-end">
            <SubmitButton pendingLabel="Saving…">Save chapter</SubmitButton>
          </div>
        </form>
      </Card>

      <TableShell>
        <thead>
          <tr>
            <Th className="w-12 pl-5">#</Th>
            <Th>Subchapter</Th>
            <Th className="min-w-[26rem]">Paragraphs</Th>
            <Th>Status</Th>
            <Th className="pr-5 text-right">Actions</Th>
          </tr>
        </thead>
        <SortableBody
          entity="subchapter"
          ids={chapter.subchapters.map((subchapter) => subchapter.id)}
          scope={chapter.id}
          path={path}
          className="divide-y divide-line/70"
        >
          {chapter.subchapters.length === 0 ? (
            <EmptyRow>
              No subchapters yet. Add the first one to start writing.
            </EmptyRow>
          ) : null}

          {chapter.subchapters.map((subchapter: SubchapterRecord, index) => (
            <tr key={subchapter.id}>
              <Td className="pl-5 align-top font-mono text-[10px] text-muted">
                {String(index + 1).padStart(2, "0")}
              </Td>
              <Td className="align-top font-medium text-ink">
                {subchapter.title}
              </Td>
              <Td className="align-top">
                <div className="flex flex-col gap-2">
                  <SortableStack
                    entity="paragraph"
                    ids={subchapter.paragraphs.map((paragraph) => paragraph.id)}
                    scope={subchapter.id}
                    path={path}
                    className="flex flex-col gap-2"
                  >
                    {subchapter.paragraphs.map((paragraph, pIndex) => (
                      <div
                        key={paragraph.id}
                        className="flex items-start gap-2 rounded-lg border border-line/70 bg-paper/50 px-2.5 py-2"
                      >
                        <p className="line-clamp-2 min-w-0 flex-1 text-xs leading-relaxed text-ink/75">
                          {paragraph.body}
                        </p>
                        <div className="flex shrink-0 items-center gap-1">
                          <Reorder
                            entity="paragraph"
                            id={paragraph.id}
                            scope={subchapter.id}
                            path={path}
                            first={pIndex === 0}
                            last={pIndex === subchapter.paragraphs.length - 1}
                          />
                          <Modal
                            triggerLabel="Edit"
                            title="Edit paragraph"
                            description={subchapter.title}
                            wide
                          >
                            <ParagraphForm
                              chapterId={chapter.id}
                              subchapterId={subchapter.id}
                              paragraph={paragraph}
                            />
                          </Modal>
                          <DeleteForm
                            action={deleteParagraph}
                            id={paragraph.id}
                            path={path}
                            confirm="Delete this paragraph?"
                          />
                        </div>
                      </div>
                    ))}
                  </SortableStack>

                  <Modal
                    triggerLabel="Add paragraph"
                    title="Add paragraph"
                    description={subchapter.title}
                    wide
                  >
                    <ParagraphForm
                      chapterId={chapter.id}
                      subchapterId={subchapter.id}
                    />
                  </Modal>
                </div>
              </Td>
              <Td className="align-top">
                <StatusToggle
                  entity="subchapter"
                  id={subchapter.id}
                  status={subchapter.status}
                  path={path}
                />
              </Td>
              <Td className="pr-5 align-top">
                <div className="flex items-center justify-end gap-1.5">
                  <Reorder
                    entity="subchapter"
                    id={subchapter.id}
                    scope={chapter.id}
                    path={path}
                    first={index === 0}
                    last={index === chapter.subchapters.length - 1}
                  />
                  <Modal
                    triggerLabel="Edit"
                    title="Edit subchapter"
                    description={subchapter.title}
                  >
                    <SubchapterForm
                      chapterId={chapter.id}
                      subchapter={subchapter}
                    />
                  </Modal>
                  <DeleteForm
                    action={deleteSubchapter}
                    id={subchapter.id}
                    path={path}
                    confirm={`Delete the subchapter "${subchapter.title}" and its paragraphs?`}
                  />
                </div>
              </Td>
            </tr>
          ))}
        </SortableBody>
      </TableShell>
    </div>
  );
}
