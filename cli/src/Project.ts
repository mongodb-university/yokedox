import { Entity } from "./Entity";
import { LinkNode } from "./mdast";
import { Page } from "./Page";

/**
  Represents a collection of documentated entities and pages to be written to
  the filesystem.
 */
export type Project = {
  /**
    To be called when an entity is discovered.

    This resolves any pending links, which allows pages with pending links to be
    written to disk.
   */
  addEntity(entity: Entity): void;

  /**
    Returns the entity with the given id if it has been added.
   */
  getEntity(id: string): Entity | undefined;

  /**
    Creates a link node for the given entity if it has been registered. If the
    entity does not exist, issues a warning and creates a broken link node.
   */
  makeLink(args: MakeLinkArgs): LinkNode;

  /**
    To be called when a page is complete and ready to be committed to the
    output.
   */
  writePage(page: Page): void;

  /**
    Flushes any remaining page writes.
   */
  finalize(): Promise<void>;
};

export type MakeLinkArgs = {
  /**
    The page uri the link originates from. This is used for error tracking. 
   */
  fromUri: string;

  /**
    The id of the entity to link to.
   */
  toEntityId: string;

  /**
    The text of the link. If undefined, uses the name or id of the target entity.
   */
  title?: string;
};
