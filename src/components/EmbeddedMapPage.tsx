type EmbeddedMapPageProps = {
  title: string;
  subtitle: string;
  iframeSrc: string;
  iframeTitle: string;
};

export default function EmbeddedMapPage({
  title,
  subtitle,
  iframeSrc,
  iframeTitle,
}: EmbeddedMapPageProps) {
  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="px-5 py-4 border-b border-border">
        <h1 className="text-accent font-bold text-lg">{title}</h1>
        <p className="text-muted text-sm">{subtitle}</p>
      </div>
      <iframe
        src={iframeSrc}
        className="flex-1 w-full border-0"
        title={iframeTitle}
      />
    </div>
  );
}
