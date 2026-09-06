import LoadingSpinner from "./LoadingSpinner";

export default function LoadingState({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-20">
      <LoadingSpinner message={message} />
    </div>
  );
}