import { prisma } from "@repo/db";
import {
  Badge,
  Checkbox,
  Field,
  Input,
  PageHeader,
  Textarea,
} from "@repo/ui";
import { AddPanel } from "@/components/panel/AddPanel";
import { AssetField, type AssetInfo } from "@/components/panel/AssetField";
import { DeleteForm } from "@/components/panel/FormBits";
import { Reorder } from "@/components/panel/PersonalControls";
import { getAssetMap } from "@/lib/assets";
import { deletePersonalStory, savePersonalStory } from "@/lib/actions/personal";

export const dynamic = "force-dynamic";

const PATH = "/personal/story";

type StoryRecord = {
  id: string;
  periodLabel: string;
  title: string;
  body: string;
  imageAssetId: string | null;
  status: number;
};

function StoryForm({
  story,
  assets,
}: {
  story?: StoryRecord;
  assets: Map<string, AssetInfo>;
}) {
  const key = story?.id ?? "new";

  return (
    <form action={savePersonalStory} className="flex flex-col gap-4">
      <input type="hidden" name="_path" value={PATH} />
      {story ? <input type="hidden" name="id" value={story.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Period"
          htmlFor={`period-${key}`}
          hint="Sits on the timeline rail, e.g. 2019 or Spring 2021."
        >
          <Input
            id={`period-${key}`}
            name="periodLabel"
            defaultValue={story?.periodLabel ?? ""}
          />
        </Field>
        <Field label="Title" htmlFor={`title-${key}`}>
          <Input
            id={`title-${key}`}
            name="title"
            defaultValue={story?.title ?? ""}
            required
          />
        </Field>
        <Field
          label="Story"
          htmlFor={`body-${key}`}
          className="sm:col-span-2"
          hint="One or two paragraphs. Blank lines are kept."
        >
          <Textarea
            id={`body-${key}`}
            name="body"
            rows={6}
            defaultValue={story?.body ?? ""}
          />
        </Field>
        <AssetField
          label="Image"
          name="imageAssetId"
          asset={assets.get(story?.imageAssetId ?? "") ?? null}
          hint="Optional. Shown beside the text."
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Checkbox
          name="status"
          label="Visible on the personal site"
          defaultChecked={story ? story.status === 1 : true}
        />
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-full bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
        >
          {story ? "Save card" : "Add card"}
        </button>
      </div>
    </form>
  );
}

export default async function PersonalStoryPage() {
  const [stories, assets] = await Promise.all([
    prisma.personalStory.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    getAssetMap(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Personal"
        title="Story"
        description="The personal timeline, told in cards: one period, a title, and one or two paragraphs."
      />

      <AddPanel
        title="Add a story card"
        description="Cards appear in this order on the public timeline. Use the arrows to reorder."
      >
        <StoryForm assets={assets} />
      </AddPanel>

      {stories.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-6 py-12 text-center text-sm text-muted">
          No story cards yet. Add the first one above.
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        {stories.map((story, index) => (
          <details
            key={story.id}
            className="rounded-xl border border-line bg-white"
          >
            <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-5 py-4">
              <span className="flex min-w-0 items-center gap-3">
                <span className="shrink-0 font-mono text-[10px] tracking-[0.12em] text-brand uppercase">
                  {story.periodLabel || "—"}
                </span>
                <span className="truncate text-sm font-medium text-ink">
                  {story.title}
                </span>
              </span>
              <span className="flex items-center gap-2">
                <Badge tone={story.status === 1 ? "success" : "neutral"}>
                  {story.status === 1 ? "Visible" : "Hidden"}
                </Badge>
                <Reorder
                  entity="story"
                  id={story.id}
                  path={PATH}
                  first={index === 0}
                  last={index === stories.length - 1}
                />
              </span>
            </summary>

            <div className="border-t border-line/70 px-5 py-5">
              <StoryForm story={story} assets={assets} />
              <div className="mt-5 border-t border-line/70 pt-4">
                <DeleteForm
                  action={deletePersonalStory}
                  id={story.id}
                  path={PATH}
                  confirm={`Delete the story card "${story.title}"?`}
                />
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
