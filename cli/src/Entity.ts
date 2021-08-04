/**
  An entity is anything that can be documented and linked to.
 */
export type Entity = {
  /**
    The complete, unique name of the entity.
   */
  canonicalName: string;
  pageUri: string;
  anchorName: string;
};
