export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <SkeletonLine className="h-4 w-2/3" />
      <SkeletonLine className="mt-2 h-3 w-1/4" />
      <SkeletonLine className="mt-3 h-3 w-full" />
      <SkeletonLine className="mt-1.5 h-3 w-5/6" />
    </div>
  );
}

export function SkeletonStatsCard() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <SkeletonLine className="h-3 w-1/2" />
      <SkeletonLine className="mt-3 h-7 w-1/3" />
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <tr>
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <SkeletonLine className="h-4 w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
}