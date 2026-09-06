export default function LoadingSpinner({
  size = "md",
  message,
}: {
  size?: "sm" | "md";
  message?: string;
}) {
  const dimension = size === "sm" ? "h-4 w-4" : "h-6 w-6";
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <span
        className={`${dimension} animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600`}
      />
      {message && <p className="text-sm text-gray-500">{message}</p>}
    </div>
  );
}