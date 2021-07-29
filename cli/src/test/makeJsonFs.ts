import { promises } from "fs";
import { createFsFromVolume, DirectoryJSON, Volume } from "memfs";

/**
  Convenience function to make an fs.promises-compatible fs from a JSON
  directory.

  The keys of the provided object are virtual file paths and the values are the
  string contents of those files. For example:

      { "/path/to/foo.txt": "this is the content of foo.txt" }

 */
export function makeJsonFs(directoryJson: DirectoryJSON = {}): typeof promises {
  const fsFromVolume = createFsFromVolume(Volume.fromJSON(directoryJson));
  return fsFromVolume.promises as unknown as typeof promises;
}
