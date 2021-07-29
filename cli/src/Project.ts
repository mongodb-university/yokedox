import { AnchorNode, LinkToEntityNode } from "./mdast.js";
import { Page } from "./Page.js";

export type Entity = {
  canonicalName: string;
  pageUri: string;
  anchorName: string;
};

/**
  Represents a collection of documentated pages to be written to the filesystem.
 */
export type Project = {
  /**
    Create an anchor node for the given entity.

    Use this method to create anchors to sections. Anchors are not official node
    types in mdast. Using this method ensures consistency and enables link
    validation. Anchors made without this function may not be validated.
   */
  declareEntity(entity: Entity): AnchorNode;

  /**
    Create a link to a specific entity.

    Using this function enables link validation. Links made without this
    function may not be validated.
   */
  linkToEntity(
    entityCanonicalName: string,
    linkText?: string
  ): LinkToEntityNode;

  /**
    To be called when a page is complete and ready to be committed to the
    output.

    Before writing to disk, we validate any links to other pages. A link is
    "resolvable" if the target page was already passed to `writePage()`. If the
    link has a fragment (i.e. a link to an 'anchor' or subsection within a
    page), the link is only resolvable if that specific anchor was added on that
    page.

    If all links on the page are resolvable, the page gets written to disk.
    Otherwise, the page is held until you call `finalize()`, at which point we
    make a final attempt to resolve the links.

    You do not need to await this.
   */
  writePage(page: Page): Promise<void> | void;

  /**
    Flushes any remaining page writes after a final attempt to resolve any links
    to other entities.
   */
  finalize(): Promise<void>;
};
