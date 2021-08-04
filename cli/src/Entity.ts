/**
  An entity is anything that can be documented and linked to.
 */
export type Entity<UserDataType = unknown> = {
  /**
    The complete, unique name of the entity.
   */
  canonicalName: string;
  pageUri: string;
  data?: UserDataType;
};
