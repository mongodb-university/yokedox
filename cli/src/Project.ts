import { Entity, EntityTransformer, InternalEntity } from "./Entity.js";
import { Page } from "./Page.js";
import { EntityAnchorNode, LinkToEntityNode } from "./yokedast.js";

/**
  Represents a collection of documentated pages to be written to the filesystem.
 */
export type Project<UserDataType = unknown> = {
  /**
    The title of the project.
   */
  title: string;

  /**
    Create an anchor node for the given entity. The anchor name will be based on
    the entity's canonical name.

    Use this method to create anchors to sections. Anchors are not official node
    types in mdast. Using this method ensures consistency and enables link
    validation. Anchors made without this function may not be validated.
   */
  declareEntity(entity: InternalEntity<UserDataType>): EntityAnchorNode;

  /**
    Adds the given entity transformer to the project's list of entity
    transformers.

    This is used to handle entities that are not declared within the actual
    project -- e.g. built-ins (int, void) or externals (standard library
    entities that should link to other docs sites).

    A transformer accepts a canonical name and returns a complete entity if that
    name is relevant to it or undefined otherwise.

    Transformers run in the link resolution stage. Transformers run in the order
    they were added.

    If a transformer returns undefined, the link resolver tries the next
    transformer until one returns an entity or until all transformers have been
    tried.

    If no transformer returns a new entity, then the entity in question is
    considered to be internal. If an internal entity with that canonical name
    was never declared before the project was finalized, then any references to
    that entity are effectively broken links.
   */
  addEntityTransformer(transform: EntityTransformer<UserDataType>): void;

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

    When called before finalize(), writePage() validates any links to entities
    before writing to disk. A link is "resolvable" if the target entity was
    already declared with declareEntity(). If all links on the page are
    resolvable, the page gets written to disk. Otherwise, the page is held until
    you call `finalize()`, at which point we make a final attempt to resolve the
    links.

    When called before finalize(), you do not need to await. When called after
    finalize, you should await.
   */
  writePage(page: Page): Promise<void> | void;

  /**
    Seals the list of entities. Flushes any pending pages after a final attempt
    to resolve any links to other entities.
   */
  finalize(): Promise<FinalizedProject<UserDataType>>;
};

/**
  A finalized project cannot have additional entities added to it, but new pages
  can be written (for example, index pages) based on the existing entities.
 */
export type FinalizedProject<UserDataType = unknown> = Omit<
  Project<UserDataType>,
  "finalize" | "declareEntity"
> & {
  readonly entities: Entity<UserDataType>[];
};
