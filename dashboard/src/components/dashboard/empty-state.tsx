import { Inbox } from "lucide-react";

interface EmptyStateProps {
  message: string;
  className?: string;
}

export function EmptyState({ message, className = "" }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-stone-300 px-3 py-8 text-center ${className}`}
    >
      <Inbox className="mb-2 h-5 w-5 text-stone-400" />
      <p className="text-sm text-stone-500">{message}</p>
    </div>
  );
}
