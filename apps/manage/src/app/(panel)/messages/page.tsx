import { prisma } from "@repo/db";
import {
  Badge,
  Card,
  Field,
  Input,
  PageHeader,
  Textarea,
} from "@repo/ui";
import { SelectMenu } from "@/components/panel/SelectMenu";
import {
  replyToMessage,
  sendTestEmail,
  updateMessageStatus,
} from "@/lib/actions/messages";

export const dynamic = "force-dynamic";

const STATUS_TONES: Record<string, "accent" | "success" | "neutral" | "warning"> = {
  new: "accent",
  read: "warning",
  replied: "success",
  archived: "neutral",
};

export default async function MessagesPage() {
  const [messages, logs] = await Promise.all([
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.emailLog.findMany({ orderBy: { sentAt: "desc" }, take: 10 }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Activity"
        title="Messages"
        description="Contact form submissions, replies sent through Echo, and the delivery log."
      />
      <Card className="p-6">
        <h2 className="text-sm font-semibold text-ink">Send a test email</h2>
        <p className="mt-1 text-xs text-muted">
          Verifies the Echo key and sender before you reply to anyone.
        </p>

        <form action={sendTestEmail} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input type="hidden" name="_path" value="/messages" />
          <Field label="To" htmlFor="test-to">
            <Input id="test-to" name="to" type="email" required />
          </Field>
          <Field label="Subject" htmlFor="test-subject">
            <Input id="test-subject" name="subject" defaultValue="Echo test" />
          </Field>
          <Field label="Body" htmlFor="test-body" className="sm:col-span-2">
            <Textarea
              id="test-body"
              name="body"
              rows={3}
              defaultValue="This is a test from the content panel."
            />
          </Field>
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex h-9 items-center rounded-full bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
            >
              Send test
            </button>
          </div>
        </form>
      </Card>

      <div className="flex flex-col gap-3">
        {messages.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line px-6 py-12 text-center text-sm text-muted">
            No messages yet.
          </p>
        ) : null}

        {messages.map((message) => (
          <Card key={message.id} className="overflow-hidden">
            <details>
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-5 py-4">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">
                    {message.name} · {message.email}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted">
                    {message.subject || "(no subject)"} ·{" "}
                    {message.createdAt.toLocaleString("en-GB")}
                  </span>
                </span>
                <Badge tone={STATUS_TONES[message.status] ?? "neutral"}>
                  {message.status}
                </Badge>
              </summary>

              <div className="border-t border-line/70 px-5 py-5">
                <p className="text-sm leading-relaxed whitespace-pre-line text-ink/80">
                  {message.message}
                </p>

                <div className="mt-6 grid gap-5 border-t border-line/70 pt-5 lg:grid-cols-[16rem_1fr]">
                  <form action={updateMessageStatus} className="flex flex-col gap-2">
                    <input type="hidden" name="_path" value="/messages" />
                    <input type="hidden" name="id" value={message.id} />
                    <Field label="Status" htmlFor={`status-${message.id}`}>
                      <SelectMenu
                        id={`status-${message.id}`}
                        name="status"
                        defaultValue={message.status}
                        options={["new", "read", "replied", "archived"].map(
                          (status) => ({ value: status, label: status }),
                        )}
                      />
                    </Field>
                    <button
                      type="submit"
                      className="inline-flex h-9 items-center justify-center rounded-full border border-line px-4 text-sm text-ink hover:border-brand/40"
                    >
                      Update status
                    </button>
                  </form>

                  <form action={replyToMessage} className="flex flex-col gap-3">
                    <input type="hidden" name="_path" value="/messages" />
                    <input type="hidden" name="id" value={message.id} />
                    <Field label="Reply subject" htmlFor={`reply-subject-${message.id}`}>
                      <Input
                        id={`reply-subject-${message.id}`}
                        name="subject"
                        defaultValue={`Re: ${message.subject || "your message"}`}
                      />
                    </Field>
                    <Field label="Reply body" htmlFor={`reply-body-${message.id}`}>
                      <Textarea id={`reply-body-${message.id}`} name="body" rows={5} />
                    </Field>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex h-9 items-center rounded-full bg-brand px-4 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
                      >
                        Send reply via Echo
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </details>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h2 className="text-sm font-semibold text-ink">Email log</h2>
        {logs.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Nothing has been sent yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line/70">
            {logs.map((log) => (
              <li key={log.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm text-ink/80">
                    {log.subject || "(no subject)"}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {log.kind} → {log.toEmail} · {log.sentAt.toLocaleString("en-GB")}
                  </p>
                </div>
                <Badge tone={log.status === "sent" ? "success" : "danger"}>
                  {log.status}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
