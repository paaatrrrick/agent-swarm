
type LoaderProps = {
  text?: string,
  className?: string,
}

export function Loader({ text, className }: LoaderProps) {
  const parentClass = className ? className : 'full-screen-loader';
  return (
    <div className={parentClass}>
      <div className="flex flex-col items-center justify-center gap-8">
        {text && <p className="text-lg mr-4 font-mono">{text}</p>}
        <span className="loader border-primary border-2"></span>
      </div>
    </div>
  );
}