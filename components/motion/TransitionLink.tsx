"use client";

import type { ComponentProps, MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { navigateWithTransition } from "./RouteTransition";

type TransitionLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/**
 * next/link that routes through a browser view transition.
 *
 * Still a real <Link>, deliberately: the rendered href stays crawlable and
 * works without JS, and Link's prefetching keeps the target route's RSC
 * payload warm — which matters here, because the view transition holds the
 * old frame frozen until the new route commits. An unprefetched route would
 * show as a stall rather than a morph.
 *
 * Modified clicks (new tab, download, middle click) fall through to the
 * browser untouched.
 */
export default function TransitionLink({ href, onClick, ...rest }: TransitionLinkProps) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;

    event.preventDefault();
    navigateWithTransition(href, (to) => router.push(to));
  };

  return <Link href={href} onClick={handleClick} {...rest} />;
}
