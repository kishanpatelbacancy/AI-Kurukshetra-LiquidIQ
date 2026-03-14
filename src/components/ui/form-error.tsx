export function FormError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-1 text-sm text-red-400" role="alert" aria-live="polite">
      {message}
    </p>
  );
}
