// Throwaway: compare three inbox layouts on /dashboard?variant=A|B|C with synthetic state.
import { useState, type ReactNode } from "react";
import { useSearchParams } from "react-router";
import { Dialog, Popover } from "radix-ui";
import {
  Archive,
  ArrowUpRight,
  Bell,
  Check,
  CheckCheck,
  Circle,
  Inbox,
  RotateCcw,
  X,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { PrototypeSwitcher } from "~/components/prototype-switcher";
import { cn } from "~/lib/utils";

type Persona = "Student" | "Team Admin" | "Platform Admin";
type Scenario =
  "normal" | "loading" | "empty" | "error" | "offline" | "handled" | "denied";
type Filter = "All" | "Unread" | "Archived";
type Item = {
  id: string;
  title: string;
  body: string;
  time: string;
  destination: string;
  action: string;
  read?: boolean;
};

const fixtures: Record<Persona, Item[]> = {
  Student: [
    {
      id: "approved",
      title: "Refund Request approved",
      body: 'Your Refund Request for "Introduction to TypeScript" was approved. This confirms the decision, not that the money has been returned.',
      time: "8 minutes ago",
      destination: "/settings",
      action: "View Purchase",
    },
    {
      id: "declined",
      title: "Refund Request declined",
      body: 'Your request for "Building REST APIs with Node.js" was declined. Note to you: "This Purchase is outside the refund window."',
      time: "Yesterday, 14:32",
      destination: "/settings",
      action: "View Purchase",
    },
    {
      id: "older-approved",
      title: "Refund Request approved",
      body: 'Your request for "Design Systems with Tailwind" was approved. Note to you: "Thanks for explaining what happened."',
      time: "3 days ago",
      destination: "/settings",
      action: "View Purchase",
      read: true,
    },
  ],
  "Team Admin": [
    {
      id: "seat-one",
      title: "A Seat was claimed",
      body: 'Alex Example claimed a Seat on "Introduction to TypeScript". 3 Unclaimed Seats remained at the time of this claim.',
      time: "2 minutes ago",
      destination: "/team",
      action: "View Team Licence",
    },
    {
      id: "team-declined",
      title: "Refund Request declined",
      body: 'Your Team Licence request for "Design Systems with Tailwind" was declined. Note to you: "A Seat has already been claimed."',
      time: "45 minutes ago",
      destination: "/team",
      action: "View Team Licence",
    },
    {
      id: "last-seat",
      title: "A Seat was claimed",
      body: 'Morgan Example claimed a Seat on "Building REST APIs with Node.js". 0 Unclaimed Seats remained at the time of this claim.',
      time: "Yesterday, 11:10",
      destination: "/team",
      action: "View Team Licence",
      read: true,
    },
  ],
  "Platform Admin": [
    {
      id: "new-request",
      title: "Refund Request needs review",
      body: 'Jamie Example requested a Refund for an Individual Purchase of "Introduction to TypeScript". Submitted today at 10:42.',
      time: "5 minutes ago",
      destination: "/admin/refunds",
      action: "Review Refund Request",
    },
    {
      id: "team-request",
      title: "Refund Request needs review",
      body: 'Taylor Example requested a Refund for a Team Licence on "Design Systems with Tailwind". Submitted today at 09:14.',
      time: "1 hour ago",
      destination: "/admin/refunds",
      action: "Review Refund Request",
    },
    {
      id: "old-request",
      title: "Refund Request needs review",
      body: 'Casey Example requested a Refund for an Individual Purchase of "Building REST APIs with Node.js". Submitted yesterday at 16:20.',
      time: "Yesterday, 16:20",
      destination: "/admin/refunds",
      action: "Review Refund Request",
      read: true,
    },
  ],
};

function NotificationIcon({ title }: { title: string }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
      {title.includes("approved") ? (
        <Check className="size-4" />
      ) : title.includes("Seat") ? (
        <Inbox className="size-4" />
      ) : (
        <Bell className="size-4" />
      )}
    </span>
  );
}

export function VariantA({
  trigger,
  panel,
  children,
  open,
  onOpenChange,
}: {
  trigger: ReactNode;
  panel: ReactNode;
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between border-b px-6 py-3">
        <span className="text-sm font-medium">Cadence / Your workspace</span>
        <Popover.Root open={open} onOpenChange={onOpenChange}>
          <Popover.Trigger asChild>{trigger}</Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              aria-label="Notifications"
              align="end"
              sideOffset={10}
              collisionPadding={12}
              className="z-40 flex max-h-[var(--radix-popover-content-available-height)] w-[min(400px,calc(100vw-24px))] flex-col overflow-hidden rounded-xl border bg-popover shadow-2xl"
            >
              {panel}
              <Popover.Arrow className="fill-popover" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
      {children}
    </>
  );
}

export function VariantB({
  trigger,
  panel,
  children,
  open,
  onOpenChange,
}: {
  trigger: ReactNode;
  panel: ReactNode;
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between border-b px-6 py-3">
        <span className="text-sm font-medium">
          Your workspace{" "}
          <span className="ml-2 text-muted-foreground">
            / Activity alongside your work
          </span>
        </span>
        <span onClick={() => onOpenChange(!open)}>{trigger}</span>
      </div>
      <div
        className={cn(
          "flex flex-col-reverse lg:flex-row",
          open && "lg:min-h-[70vh]"
        )}
      >
        <div className="min-w-0 flex-1">{children}</div>
        {open && (
          <aside
            aria-label="Notifications"
            className="border-b bg-muted/20 lg:w-[360px] lg:shrink-0 lg:border-b-0 lg:border-l"
          >
            {panel}
          </aside>
        )}
      </div>
    </>
  );
}

export function VariantC({
  list,
  detail,
  count,
}: {
  list: ReactNode;
  detail: ReactNode;
  count: number | null;
}) {
  return (
    <section className="p-5 lg:p-8">
      <p className="text-sm text-muted-foreground">
        Your workspace / Notifications
      </p>
      <div className="my-6">
        <h1 className="text-3xl font-semibold tracking-tight">
          Notification centre
        </h1>
        <p className="mt-2 text-muted-foreground">
          Purchases, Team Licences, and work needing your attention.{" "}
          {count === null ? "Connecting to your inbox." : `${count} unread.`}
        </p>
      </div>
      <div className="grid overflow-hidden rounded-xl border lg:min-h-[520px] lg:grid-cols-[minmax(280px,1fr)_1fr]">
        <div className="min-w-0 border-b lg:border-r lg:border-b-0">{list}</div>
        <div className="min-w-0 bg-muted/20 p-6 lg:p-8">{detail}</div>
      </div>
    </section>
  );
}

export function NotificationPrototype({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<Persona>("Student");
  return (
    <PrototypeSession key={persona} persona={persona} onPersona={setPersona}>
      {children}
    </PrototypeSession>
  );
}

function PrototypeSession({
  children,
  persona,
  onPersona,
}: {
  children: ReactNode;
  persona: Persona;
  onPersona: (persona: Persona) => void;
}) {
  const [params] = useSearchParams();
  const variant = params.get("variant") ?? "A";
  const items = fixtures[persona];
  const [scenario, setScenario] = useState<Scenario>("normal");
  const [filter, setFilter] = useState<Filter>("All");
  const [read, setRead] = useState(
    items.filter((item) => item.read).map((item) => item.id)
  );
  const [archived, setArchived] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [destination, setDestination] = useState<Item | null>(null);
  const [open, setOpen] = useState(true);
  const unavailable = scenario === "loading" || scenario === "error";
  const activeItems =
    scenario === "empty"
      ? []
      : items.filter((item) => !archived.includes(item.id));
  const unread = activeItems.filter((item) => !read.includes(item.id)).length;
  const visible = (scenario === "empty" ? [] : items).filter((item) =>
    filter === "Archived"
      ? archived.includes(item.id)
      : !archived.includes(item.id) &&
        (filter !== "Unread" || !read.includes(item.id))
  );
  const selectedItem = visible.find((item) => item.id === selected);

  function markRead(id: string) {
    setRead((current) => (current.includes(id) ? current : [...current, id]));
  }

  function visit(item: Item) {
    if (scenario !== "denied") markRead(item.id);
    setDestination(item);
  }

  function reset() {
    setRead(items.filter((item) => item.read).map((item) => item.id));
    setArchived([]);
    setSelected(null);
    setDestination(null);
    setScenario("normal");
    setFilter("All");
    setOpen(true);
  }

  const bell = (
    <Button
      variant="outline"
      aria-label={
        unavailable
          ? "Open notifications"
          : `Open notifications, ${unread} unread`
      }
      aria-expanded={open}
      className="relative"
    >
      <Bell />
      <span className="hidden sm:inline">Notifications</span>
      {!unavailable && unread > 0 && (
        <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
          {unread}
        </span>
      )}
    </Button>
  );

  function itemActions(item: Item) {
    return (
      <div className="flex shrink-0 gap-1">
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label={`${read.includes(item.id) ? "Mark unread" : "Mark read"}: ${item.title}`}
          onClick={() =>
            setRead((current) =>
              current.includes(item.id)
                ? current.filter((id) => id !== item.id)
                : [...current, item.id]
            )
          }
        >
          {read.includes(item.id) ? <Circle /> : <CheckCheck />}
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label={`${archived.includes(item.id) ? "Restore" : "Archive"}: ${item.title}`}
          onClick={() => {
            setArchived((current) =>
              current.includes(item.id)
                ? current.filter((id) => id !== item.id)
                : [...current, item.id]
            );
            setSelected(null);
          }}
        >
          {archived.includes(item.id) ? <RotateCcw /> : <Archive />}
        </Button>
      </div>
    );
  }

  function detail(item: Item) {
    return (
      <div className="space-y-5">
        <NotificationIcon title={item.title} />
        <div>
          <p className="text-xs text-muted-foreground">{item.time}</p>
          <h2 className="mt-2 text-xl font-semibold">{item.title}</h2>
        </div>
        <p className="text-sm leading-7">{item.body}</p>
        {scenario === "handled" && (
          <p className="rounded-md border bg-background p-3 text-sm">
            This item has already been handled or its destination changed. The
            historical notification remains; check the current status before
            acting.
          </p>
        )}
        {scenario === "denied" ? (
          <p role="status" className="rounded-md border p-3 text-sm">
            You no longer have permission to open this destination. No action is
            available.
          </p>
        ) : (
          <Button onClick={() => visit(item)}>
            {scenario === "handled" ? "View current status" : item.action}
            <ArrowUpRight />
          </Button>
        )}
        {itemActions(item)}
      </div>
    );
  }

  const panel = (
    <>
      <div className="flex shrink-0 items-start justify-between gap-2 border-b p-4">
        <div>
          <h2 className="font-semibold">Notifications</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {unavailable ? "Connecting to your inbox" : `${unread} unread`}{" "}
            <span aria-hidden="true">/</span> {persona}
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          disabled={unavailable || unread === 0}
          onClick={() => setRead(items.map((item) => item.id))}
        >
          Mark all read
        </Button>
      </div>
      <div
        className="flex shrink-0 gap-1 border-b p-2"
        aria-label="Notification filter"
      >
        {(["All", "Unread", "Archived"] as const).map((tab) => (
          <Button
            key={tab}
            size="sm"
            variant={filter === tab ? "secondary" : "ghost"}
            aria-pressed={filter === tab}
            onClick={() => setFilter(tab)}
          >
            {tab}
          </Button>
        ))}
      </div>
      {scenario === "offline" && (
        <p
          role="status"
          className="border-b bg-amber-50 p-3 text-xs text-amber-950"
        >
          Offline: showing cached demo items. New updates and sync are paused.
        </p>
      )}
      <div
        className={cn(
          "min-h-0 overflow-y-auto",
          variant === "A" ? "flex-1" : "max-h-[65vh]"
        )}
      >
        {scenario === "loading" ? (
          <div
            role="status"
            aria-label="Loading notifications"
            className="space-y-5 p-5"
          >
            {[1, 2, 3].map((id) => (
              <div key={id} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : scenario === "error" ? (
          <div role="alert" className="p-6 text-center">
            <p className="font-medium">Notifications could not load</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Your purchases and course work are unaffected.
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setScenario("normal")}
            >
              Retry
            </Button>
          </div>
        ) : visible.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Inbox className="mx-auto mb-3 size-8 text-muted-foreground" />
            <h3 className="font-medium">
              {filter === "Unread"
                ? "You're all caught up"
                : filter === "Archived"
                  ? "No archived notifications"
                  : "Nothing here yet"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Important updates will appear here. No historical events are
              imported.
            </p>
          </div>
        ) : (
          visible.map((item) => (
            <article
              key={item.id}
              className={cn(
                "border-b p-4 last:border-b-0",
                !read.includes(item.id) && "bg-blue-50/50 dark:bg-blue-950/20",
                selected === item.id &&
                  variant === "C" &&
                  "ring-1 ring-inset ring-primary"
              )}
            >
              <div className="flex gap-3">
                {variant !== "A" && <NotificationIcon title={item.title} />}
                <div className="min-w-0 flex-1">
                  <button
                    className="w-full text-left focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2"
                    onClick={() => {
                      if (variant === "C") {
                        setSelected(item.id);
                        markRead(item.id);
                      } else {
                        visit(item);
                      }
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {!read.includes(item.id) && (
                        <span
                          className="size-2 shrink-0 rounded-full bg-blue-600"
                          aria-label="Unread"
                        />
                      )}
                      <h3
                        className={cn(
                          "text-sm",
                          !read.includes(item.id) && "font-semibold"
                        )}
                      >
                        {item.title}
                      </h3>
                    </div>
                    <p
                      className={cn(
                        "mt-1.5 text-sm leading-6 text-muted-foreground",
                        variant === "C" && "line-clamp-2"
                      )}
                    >
                      {item.body}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {item.time}
                    </p>
                  </button>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="link"
                      className="h-auto p-0"
                      onClick={() => visit(item)}
                    >
                      {scenario === "handled"
                        ? "View current status"
                        : item.action}
                      <ArrowUpRight />
                    </Button>
                    {itemActions(item)}
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
      <p className="shrink-0 border-t px-4 py-3 text-xs text-muted-foreground">
        30-day history / Novu UI is mocked, not connected
      </p>
    </>
  );

  return (
    <div className="pb-24">
      <section
        aria-label="Prototype controls"
        className="space-y-3 border-b border-dashed bg-amber-50/70 p-4 text-amber-950 dark:bg-amber-950/20 dark:text-amber-100"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold tracking-widest">
            PROTOTYPE / SYNTHETIC DATA
          </span>
          <label className="flex items-center gap-2 text-xs">
            Demo recipient
            <select
              aria-label="Demo recipient"
              className="max-w-40 rounded-md border bg-background p-1.5 text-foreground"
              value={persona}
              onChange={(event) => onPersona(event.target.value as Persona)}
            >
              {Object.keys(fixtures).map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs">
            Scenario
            <select
              aria-label="Scenario"
              className="rounded-md border bg-background p-1.5 text-foreground"
              value={scenario}
              onChange={(event) => setScenario(event.target.value as Scenario)}
            >
              <option value="normal">Normal</option>
              <option value="loading">Loading</option>
              <option value="empty">Empty</option>
              <option value="error">Load error</option>
              <option value="offline">Offline / cached</option>
              <option value="handled">Already handled</option>
              <option value="denied">Access removed</option>
            </select>
          </label>
          <Button size="sm" variant="outline" onClick={reset}>
            Reset demo
          </Button>
        </div>
        <p className="text-xs">
          Layout: {variant}. Opening the inbox does not mark items read. Opening
          an item does. Archive hides; restore brings it back. Reload resets
          everything. These are proposals, not approved behavior.
        </p>
        <details className="text-xs">
          <summary className="cursor-pointer">
            Inspect live prototype state
          </summary>
          <pre className="mt-2 max-h-40 overflow-auto rounded border bg-background p-2 text-foreground">
            {JSON.stringify(
              {
                variant,
                persona,
                scenario,
                filter,
                open,
                unread,
                read,
                archived,
                selected,
                simulatedDestination: destination?.destination ?? null,
              },
              null,
              2
            )}
          </pre>
        </details>
      </section>

      {variant === "A" ? (
        <VariantA
          trigger={bell}
          panel={panel}
          open={open}
          onOpenChange={setOpen}
        >
          {children}
        </VariantA>
      ) : variant === "B" ? (
        <VariantB
          trigger={bell}
          panel={panel}
          open={open}
          onOpenChange={setOpen}
        >
          {children}
        </VariantB>
      ) : (
        <VariantC
          count={unavailable ? null : unread}
          list={panel}
          detail={
            selectedItem && !unavailable ? (
              detail(selectedItem)
            ) : (
              <div className="py-16 text-center text-muted-foreground">
                <Bell className="mx-auto mb-4 size-10" />
                <h2 className="font-medium">Choose a notification</h2>
                <p className="mt-2 text-sm">
                  Read the update here, then open its destination.
                </p>
              </div>
            )
          }
        />
      )}

      <Dialog.Root
        open={!!destination}
        onOpenChange={(next) => {
          if (!next) setDestination(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-[60] max-h-[80vh] w-[min(480px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-xl border bg-background p-6 shadow-2xl">
            <Dialog.Title className="pr-8 text-lg font-semibold">
              Simulated destination
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              No real navigation or mutation occurs. This is a mock of the
              linked page.
            </Dialog.Description>
            <div className="mt-5 space-y-3">
              <code className="text-sm">{destination?.destination}</code>
              {scenario === "denied" ? (
                <p role="alert">
                  Access is no longer available. The destination must
                  reauthorize; a notification is not permission.
                </p>
              ) : scenario === "handled" ? (
                <p>
                  This request or entitlement has changed since the
                  notification. Show the current status here; do not offer an
                  obsolete action.
                </p>
              ) : (
                <p className="text-sm leading-7">{destination?.body}</p>
              )}
              <p className="text-xs text-muted-foreground">
                An unread item becoming read does not resolve a Refund Request
                or change a Seat.
              </p>
            </div>
            <Dialog.Close asChild>
              <Button
                className="absolute top-3 right-3"
                size="icon-sm"
                variant="ghost"
                aria-label="Close simulated destination"
              >
                <X />
              </Button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <PrototypeSwitcher />
    </div>
  );
}
