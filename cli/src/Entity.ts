export type InternalEntity<UserDataType = unknown> = {
  /**
    The complete, unique name of the entity.
   */
  canonicalName: string;

  /**
    The location of the entity.
   */
  pageUri: string;

  /**
    Custom data.
   */
  data?: UserDataType;
};

export type EntityType = "internal" | "external" | "builtIn";

/**
  An entity is anything that can be documented and linked to.
 */
export type Entity<UserDataType = unknown> = InternalEntity<UserDataType> & {
  /**
    The entity type.
   */
  type: EntityType;
};

export type EntityTransformer<UserDataType = unknown> = (
  canonicalName: string
) => Entity<UserDataType> | undefined;
