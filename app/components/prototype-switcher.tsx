import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";

const variants = [
  { key: "A", name: "Bell popover" },
  { key: "B", name: "Side-panel inbox" },
  { key: "C", name: "Notification centre" },
];

export function PrototypeSwitcher() {
  const [params, setParams] = useSearchParams();
  const index = Math.max(
    0,
    variants.findIndex((v) => v.key === params.get("variant"))
  );

  function cycle(direction: number) {
    const next = new URLSearchParams(params);
    next.set(
      "variant",
      variants[(index + direction + variants.length) % variants.length].key
    );
    setParams(next, { replace: true, preventScrollReset: true });
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target;
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        (target instanceof HTMLElement &&
          target.closest(
            "input, textarea, select, [contenteditable], [role=dialog]"
          ))
      )
        return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        cycle(event.key === "ArrowLeft" ? -1 : 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [params]);

  if (!import.meta.env.DEV) return null;

  return (
    <nav
      aria-label="Prototype variations"
      className="fixed bottom-4 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full bg-zinc-950 px-2 py-2 text-white shadow-xl"
    >
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Previous variant"
        onClick={() => cycle(-1)}
        className="hover:bg-white/20 hover:text-white"
      >
        <ArrowLeft />
      </Button>
      <span className="min-w-44 text-center text-xs">
        <span className="font-semibold">{variants[index].key}</span>
        {" / "}
        {variants[index].name}
        <span className="block text-[10px] text-zinc-400">
          THROWAWAY PROTOTYPE
        </span>
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Next variant"
        onClick={() => cycle(1)}
        className="hover:bg-white/20 hover:text-white"
      >
        <ArrowRight />
      </Button>
    </nav>
  );
}
