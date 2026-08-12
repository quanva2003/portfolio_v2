import { ui } from "@/content";
import ContactFooter from "@/components/ContactFooter";
import SiteHeader from "@/components/SiteHeader";

/**
 * Chrome shared by the portfolio routes: skip link, header, footer. Lives in a
 * route group so the header/footer render on the project case studies too
 * (`#contact` and `#main` have to exist on every one of these routes for the
 * nav and skip link to resolve) while `/styleguide` stays a bare token page
 * outside the group.
 *
 * The skip link is the document's first focusable element: everything the root
 * layout renders ahead of {children} — MotionProvider, RouteTransition,
 * SectionMotion, the WebGL layer, Cursor — is either `null` or aria-hidden.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        data-skip-link
        className="rounded-pill bg-ember text-small text-ink fixed top-4 left-4 z-50 -translate-y-24 px-5 py-2.5 font-medium transition-transform duration-(--dur-fast) focus-visible:translate-y-0"
      >
        {ui.skipToContent}
      </a>
      <SiteHeader />
      {children}
      <ContactFooter />
    </>
  );
}
