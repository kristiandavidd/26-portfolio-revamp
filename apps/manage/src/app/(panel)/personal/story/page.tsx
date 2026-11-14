import Link from "next/link";
import { prisma } from "@repo/db";
import { Field, Input, PageHeader } from "@repo/ui";
import { SubmitButton } from "@/components/panel/SubmitButton";
import { DeleteForm } from "@/components/panel/FormBits";
import { Modal } from "@/components/panel/Modal";
import { SortableBody } from "@/components/panel/Sortable";
import { EmptyRow, TableShell, Td, Th } from "@/components/panel/Table";
import { Reorder, StatusToggle } from "@/components/panel/RowActions";
import { deleteChapter, saveChapter } from "@/lib/actions/personal";

export const dynamic = "force-dynamic";

const PATH = "/personal/story";

function ChapterForm() {
  return (
    <form action={saveChapter} className="flex flex-col gap-5">
      <input type="hidden" name="_path" value={PATH} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Year" htmlFor="chapter-year">
          <Input id="chapter-year" name="year" placeholder="2003" required />
        </Field>
        <Field
          label="Chapter title"
          htmlFor="chapter-title"
          hint="Optional. The year is enough if you prefer."
        >
          <Input id="chapter-title" name="title" placeholder="The early years" />
        </Field>
      </div>

      <div className="flex justify-end">
        <SubmitButton pendingLabel="Adding…">Add chapter</SubmitButton>
      </div>
    </form>
  );
}

export default async function PersonalStoryPage() {
  const chapters = await prisma.personalChapter.findMany({
    where: { deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      _count: {
        select: {
          subchapters: { where: { deletedAt: null } },
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Personal"
        title="Story"
        description="The timeline is grouped by chapter. Open a chapter to write its subchapters and paragraphs."
        actions={
          <Modal
            triggerLabel="New chapter"
            triggerVariant="primary"
            triggerSize="md"
            title="New chapter"
            description="A chapter is one period of the story. Subchapters live inside it."
          >
            <ChapterForm />
          </Modal>
        }
      />

      <TableShell>
        <thead>
          <tr>
            <Th className="w-12 pl-5">#</Th>
            <Th>Year</Th>
            <Th>Chapter</Th>
            <Th>Subchapters</Th>
            <Th>Status</Th>
            <Th className="pr-5 text-right">Actions</Th>
          </tr>
        </thead>
        <SortableBody
          entity="chapter"
          ids={chapters.map((chapter) => chapter.id)}
          path={PATH}
          className="divide-y divide-line/70"
        >
          {chapters.length === 0 ? (
            <EmptyRow>No chapters yet.</EmptyRow>
          ) : null}

          {chapters.map((chapter, index) => (
            <tr key={chapter.id}>
              <Td className="pl-5 font-mono text-[10px] text-muted">
                {String(index + 1).padStart(2, "0")}
              </Td>
              <Td className="font-mono text-[10px] tracking-[0.12em] whitespace-nowrap text-brand uppercase">
                {chapter.year || "—"}
              </Td>
              <Td className="font-medium text-ink">
                {chapter.title || "Untitled chapter"}
              </Td>
              <Td className="font-mono text-[10px] tracking-[0.08em] text-muted uppercase">
                {chapter._count.subchapters}
              </Td>
              <Td>
                <StatusToggle
                  entity="chapter"
                  id={chapter.id}
                  status={chapter.status}
                  path={PATH}
                />
              </Td>
              <Td className="pr-5">
                <div className="flex items-center justify-end gap-1.5">
                  <Link
                    href={`${PATH}/${chapter.id}`}
                    className="inline-flex h-8 items-center rounded-full border border-line bg-surface px-3 text-xs font-medium text-ink transition-colors hover:border-brand/40 hover:bg-sand"
                  >
                    Open
                  </Link>
                  <Reorder
                    entity="chapter"
                    id={chapter.id}
                    path={PATH}
                    first={index === 0}
                    last={index === chapters.length - 1}
                  />
                  <DeleteForm
                    action={deleteChapter}
                    id={chapter.id}
                    path={PATH}
                    confirm={`Delete the ${chapter.year || "undated"} chapter and its subchapters?`}
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
