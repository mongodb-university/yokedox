/**
  Any uniquely-identifiable, documentable object.
 */
export type Entity = {
  /**
    Every entity has exactly one unique URI. This might include the page path
    and subsection anchor (#fragment). The URI is the Entity's identity.
   */
  uri: string;
  // TODO
};
