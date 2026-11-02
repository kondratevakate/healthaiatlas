import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const SECTIONS = [
  { to: "/", label: "Home" },
  { to: "/discovery", label: "Discovery" },
  { to: "/directory", label: "Directory" },
  { to: "/founders/context", label: "Context" },
  { to: "/about", label: "About" },
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="max-w-md text-center">
        <h1 className="mb-2 text-6xl font-bold">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">
          We couldn't find{" "}
          <code className="font-mono text-base">{location.pathname}</code>
        </p>
        <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
          Try one of the main sections
        </p>
        <nav className="flex flex-wrap justify-center gap-2">
          {SECTIONS.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="border border-primary/40 px-3 py-1.5 text-sm hover:bg-primary/5"
            >
              {s.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default NotFound;
