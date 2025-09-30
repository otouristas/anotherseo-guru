import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const breadcrumbNameMap: Record<string, string> = {
    "": "Home",
    "dashboard": "Dashboard",
    "seo": "SEO Suite",
    "repurpose": "Repurpose Content",
    "pricing": "Pricing",
    "about": "About",
    "contact": "Contact",
    "help": "Help",
    "auth": "Authentication",
    "privacy": "Privacy Policy",
    "terms": "Terms of Service",
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    ...pathnames.map((path, index) => {
      const href = `/${pathnames.slice(0, index + 1).join("/")}`;
      return {
        label: breadcrumbNameMap[path] || path.charAt(0).toUpperCase() + path.slice(1),
        href: index === pathnames.length - 1 ? undefined : href,
      };
    }),
  ];

  if (pathnames.length === 0) return null;

  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
      <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
        <Home className="w-4 h-4" />
      </Link>
      {breadcrumbs.slice(1).map((crumb, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4" />
          {crumb.href ? (
            <Link to={crumb.href} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{crumb.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
};
