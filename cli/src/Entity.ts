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

/**
  An entity is anything that can be documented and linked to.
 */
export type Entity<UserDataType = unknown> = InternalEntity<UserDataType> & {
  /**
    Whether this entity exists outside of the site.
   */
  isExternal: boolean;
};

export type ExternalEntity<UserDataType = unknown> = Entity<UserDataType> & {
  isExternal: true;
};

export type ExternalEntityTransformer<UserDataType = unknown> = (
  canonicalName: string
) => ExternalEntity<UserDataType> | undefined;
