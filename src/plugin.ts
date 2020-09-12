import { Document } from "./document";

export interface Plugin {
  convert: (XmlDocument) => Document;
}
