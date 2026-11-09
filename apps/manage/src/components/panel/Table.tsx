import type {
  ReactNode,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";
import { cn } from "@repo/ui";

export function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(10,10,10,0.03)]">
      <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
        {children}
      </table>
    </div>
  );
}

export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-line bg-paper/60 px-3 py-3 font-mono text-[10px] font-medium tracking-[0.14em] whitespace-nowrap text-muted uppercase",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-3 py-3 align-middle text-ink/80", className)}
      {...props}
    />
  );
}

export function EmptyRow({ children }: { children: ReactNode }) {
  return (
    <tr>
      <td
        colSpan={99}
        className="px-6 py-12 text-center text-sm text-muted"
      >
        {children}
      </td>
    </tr>
  );
}
