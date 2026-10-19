import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ArrowUpRight, ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import logoMark from "@/assets/logo-mark.png";

const navigation = [
  { label: "Research", items: [
    { to: "/reports", label: "Reports", detail: "Long & short equity research" },
    { to: "/services", label: "Services", detail: "Weekly 5/5 & tailored diligence" },
    { to: "/feeds", label: "Feeds", detail: "Latest releases & updates" },
  ] },
  { label: "About", items: [
    { to: "/about", label: "Our Firm", detail: "Independent. New York-based." },
    { to: "/philosophy", label: "Philosophy", detail: "Our margin-first approach" },
    { to: "/contact", label: "Contact", detail: "Speak with our team" },
    { to: "/faq", label: "FAQ", detail: "Access, subscriptions & more" },
  ] },
] as const;

function NavigationItem({ item }: { item: typeof navigation[number]["items"][number] }) {
  return (
    <DropdownMenuItem asChild className="group cursor-pointer rounded-sm px-4 py-3 focus:bg-muted focus:text-foreground">
      <Link to={item.to} className="flex items-center justify-between gap-6">
        <span><span className="block text-sm font-medium">{item.label}</span><span className="mt-1 block text-xs font-normal text-muted-foreground">{item.detail}</span></span>
        <ArrowUpRight className="text-muted-foreground opacity-0 transition-opacity group-focus:opacity-100 group-hover:opacity-100" />
      </Link>
    </DropdownMenuItem>
  );
}

export function Header() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-6">
        <Link to="/" aria-label="Froth City Research home" className="flex shrink-0 items-center gap-3">
          <img src={logoMark} alt="" width={203} height={351} className="h-12 w-auto shrink-0" />
          <span className="border-r pr-4 font-serif text-[32px] font-semibold leading-none">Froth City<span className="text-accent">.</span></span>
          <span className="text-[10px] font-medium uppercase leading-relaxed text-muted-foreground">Independent<br />Equity Research</span>
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-3 md:flex">
          {navigation.map((group) => (
            <DropdownMenu key={group.label}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={`h-10 gap-2 px-4 hover:bg-muted hover:text-foreground data-[state=open]:bg-muted ${group.items.some((item) => pathname.startsWith(item.to)) ? "text-foreground" : "text-muted-foreground"}`}>
                  {group.label}<ChevronDown className="size-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={18} className="w-72 rounded-sm p-2 shadow-lg">
                <DropdownMenuLabel className="px-4 py-2 text-[10px] font-normal uppercase text-muted-foreground">{group.label}</DropdownMenuLabel>
                {group.items.map((item) => <NavigationItem key={item.to} item={item} />)}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
          <Button variant="ghost" asChild className="h-10 px-4 text-muted-foreground hover:bg-muted hover:text-foreground"><Link to="/pricing" activeProps={{ className: "text-foreground" }}>Pricing</Link></Button>
          <span className="mx-3 h-5 border-l" />
          <Button asChild className="h-10 rounded-sm px-5 shadow-none"><Link to="/pricing">Subscribe<ArrowUpRight /></Link></Button>
        </nav>
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Open navigation" className="hover:bg-muted hover:text-foreground"><Menu /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={18} className="w-72 max-w-[calc(100vw-3rem)] p-2">
              {navigation.map((group, index) => <div key={group.label}>
                {index > 0 && <DropdownMenuSeparator />}
                <DropdownMenuLabel className="px-4 py-2 text-[10px] font-normal uppercase text-muted-foreground">{group.label}</DropdownMenuLabel>
                {group.items.map((item) => <NavigationItem key={item.to} item={item} />)}
              </div>)}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="px-4 py-3 focus:bg-muted"><Link to="/pricing">Pricing & subscriptions<ArrowUpRight className="ml-auto" /></Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-serif text-3xl font-semibold">Froth City Research</p>
          <p className="mt-3 max-w-sm text-sm opacity-70">Independent equity research from Lower Manhattan. Exposing hype. Rewarding margins.</p>
        </div>
        <div className="space-y-2 text-sm opacity-80">
          <Link to="/about" className="block hover:opacity-100">Our Firm</Link>
          <Link to="/philosophy" className="block">Philosophy</Link>
          <Link to="/services" className="block">Services</Link>
          <Link to="/reports" className="block">Reports</Link>
        </div>
        <div className="space-y-2 text-sm opacity-80">
          <Link to="/pricing" className="block">Pricing</Link>
          <Link to="/contact" className="block">Contact</Link>
          <Link to="/feeds" className="block">Feeds</Link>
          <Link to="/faq" className="block">FAQ</Link>
        </div>
      </div>
      <div className="border-t border-ink-foreground/15">
        <p className="mx-auto max-w-6xl px-6 py-6 text-xs leading-relaxed opacity-50">
          © {new Date().getFullYear()} Froth City Research LLC · frothcity.com · Research is opinion, not investment advice. Froth City Research and its affiliates may hold positions in securities discussed.
        </p>
      </div>
    </footer>
  );
}

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <section className="border-b">
      <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-5 max-w-3xl text-4xl leading-[1.1] md:text-6xl">{title}</h1>
        {children && <div className="mt-6 max-w-2xl text-lg text-muted-foreground">{children}</div>}
      </div>
    </section>
  );
}

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-6xl px-6 ${className}`}>{children}</div>;
}

export function Direction({ d }: { d: "Long" | "Short" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider ${d === "Long" ? "text-long" : "text-short"}`}>
      {d === "Long" ? "▲" : "▼"} {d}
    </span>
  );
}

export function meta(title: string, description: string) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
