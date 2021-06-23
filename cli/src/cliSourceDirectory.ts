import path from "path";
import { URL } from "url";

export const cliSourceDirectory = path.dirname(
  new URL(import.meta.url).pathname
);
