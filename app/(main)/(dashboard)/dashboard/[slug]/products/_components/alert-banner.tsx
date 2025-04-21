import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

export function AlertBanner({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <div className="bg-primary px-4 py-3 text-primary-foreground">
      <p className="flex justify-center text-sm">
        <Link href={href} target="_blank" className="group">
          <span className="me-1 text-base leading-none">✨</span>
          {children}
          <ArrowRight
            className="-mt-0.5 ms-2 inline-flex opacity-60 transition-transform group-hover:translate-x-0.5"
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
        </Link>
      </p>
    </div>
  );
}
