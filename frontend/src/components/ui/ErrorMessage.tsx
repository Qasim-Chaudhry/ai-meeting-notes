import Button from "./Button";

export default function ErrorMessage({
  message,
  onRetry,
  fullPage = false,
}: {
  message: string;
  onRetry?: () => void;
  fullPage?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-6 text-center ${
        fullPage ? "py-16" : "py-4"
      }`}
    >
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}