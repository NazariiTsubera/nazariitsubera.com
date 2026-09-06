import type { MDXComponents } from "mdx/types";
import Link from "next/link";

import { Figure } from "@/components/marketing/Figure";

/**
 * Elements the MDX articles render. Internal links go through next/link; external ones open in a
 * new tab. `Figure` places a screenshot registered in content/projects.ts.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    a: ({ href = "", children, ...rest }) =>
      href.startsWith("/") || href.startsWith("#") ? (
        <Link href={href} {...rest}>
          {children}
        </Link>
      ) : (
        <a href={href} target="_blank" rel="noopener" {...rest}>
          {children}
        </a>
      ),
    Figure,
    ...components,
  };
}
