interface ErrorDisplayProps {
  message: string;
}

export function ErrorDisplay({ message }: ErrorDisplayProps) {
  return (
    <div className="error-display">
      <h2>Error</h2>
      <p>{message}</p>
    </div>
  );
}
