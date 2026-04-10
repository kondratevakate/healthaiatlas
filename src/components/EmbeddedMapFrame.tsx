interface EmbeddedMapFrameProps {
  src: string;
  title: string;
  heightClassName?: string;
}

export function EmbeddedMapFrame({
  src,
  title,
  heightClassName = "h-[58rem]",
}: EmbeddedMapFrameProps) {
  return (
    <div className="artifact-viewport overflow-hidden border border-border bg-white">
      <iframe
        className={`${heightClassName} w-full border-0 bg-white`}
        loading="lazy"
        src={src}
        title={title}
      />
    </div>
  );
}
