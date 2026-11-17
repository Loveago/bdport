import Link from "next/link";

interface AuthLegalNoticeProps {
  actionText: string;
  className?: string;
}

const LEGAL_LINKS = [
  { href: "/terms", label: "Terms & Conditions" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refund-policy", label: "Refund Policy" },
] as const;

/**
 * Displays clickable links to Terms & Conditions, Privacy Policy,
 * and Refund Policy on authentication pages.
 */
export function AuthLegalNotice({ actionText, className = "" }: AuthLegalNoticeProps) {
  return (
    <p
      className={`text-center text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed ${className}`.trim()}
    >
      By {actionText}, you agree to our{" "}
      {LEGAL_LINKS.map((link, index) => (
        <span key={link.href}>
          {index > 0 && (index === LEGAL_LINKS.length - 1 ? ", and " : ", ")}
          <Link
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00df82] hover:underline font-medium"
          >
            {link.label}
          </Link>
        </span>
      ))}
      .
    </p>
  );
}
