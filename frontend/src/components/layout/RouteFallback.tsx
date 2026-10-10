// Shown while a lazily loaded page chunk downloads (see App.tsx).
// Same ring as the boot loader in index.html so first load and later page
// switches look the same. Delayed fade-in: fast loads show nothing at all
// instead of a spinner that flashes for a few frames.
export function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Loading">
      <div className="boot-spinner boot-spinner--delayed" />
    </div>
  );
}
