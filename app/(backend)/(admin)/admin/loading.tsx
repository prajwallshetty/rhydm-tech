export default function Loading() {
  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-100 overflow-hidden bg-transparent pointer-events-none">
      <div className="h-full bg-brand animate-loading-bar" />
    </div>
  );
}
