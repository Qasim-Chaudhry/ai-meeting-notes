import ErrorMessage from "./ErrorMessage";

export default function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return <ErrorMessage message={message} onRetry={onRetry} fullPage />;
}