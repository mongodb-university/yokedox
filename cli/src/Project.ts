import { Page } from "./Page";

/**
  Represents a collection of documentated pages to be written to the filesystem.
 */
export type Project = {
  /**
    To be called when a page is complete and ready to be committed to the
    output.

    Before writing to disk, we validate any links to other pages. A link is
    "resolvable" if the target page was already passed to `writePage()`. If the
    link has a fragment in the URI (i.e. a link to an 'anchor' or subsection
    within a page), the link is only resolvable if that specific anchor was
    added on that page.

    If all links on the page are resolvable, the page gets written to disk.
    Otherwise, the page is held until you call `finalize()`, at which point we
    make a final attempt to resolve the links.
   */
  writePage(page: Page): void;

  /**
    Flushes any remaining page writes after a final attempt to resolve any links
    to other entities.
   */
  finalize(): Promise<void>;
};
