import { Diagnostic } from "./Diagnostic";
import { Entity } from "./Entity";
import { LinkNode } from "./mdast";
import { Page } from "./Page";

export type Project = {
  /**
    To be called when a non-fatal warning or error is encountered.
   */
  onDiagnostic(diagnostic: Diagnostic): void;

  /**
    To be called when an entity is discovered.
   */
  addEntity(entity: Entity): void;

  /**
    Creates a link node for the given entity if it has been registered.
   */
  makeLinkToEntity(entity: Entity, title?: string): LinkNode;

  /**
    To be called when a page is complete and ready to be committed to the
    output.
   */
  addPage(page: Page): void;
};
