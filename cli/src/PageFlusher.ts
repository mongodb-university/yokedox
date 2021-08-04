import { promises } from "fs";
import { gfmTableToMarkdown } from "mdast-util-gfm-table";
import { toMarkdown } from "mdast-util-to-markdown";
import * as Path from "path";
import { toRst } from "./mdastToRst.js";
import { Page } from "./Page.js";

/**
  Converts the page to a string.
 */
export type PageStringifier = {
  fileExtension: string;
  stringify(page: Page): string | Promise<string>;
};

export const flushPage = async ({
  page,
  stringifiers,
  outputDirectoryPath,
  fs,
}: {
  stringifiers: PageStringifier[];
  outputDirectoryPath: string;
  page: Page;
  fs: typeof promises;
}): Promise<void> => {
  const files: { outputPath: string; data: string | Promise<string> }[] =
    stringifiers.map(({ stringify, fileExtension }) => {
      return {
        outputPath: Path.join(
          outputDirectoryPath,
          `${page.path}.${fileExtension}`
        ),
        data: stringify(page),
      };
    });

  await Promise.all(
    files.map(async (file) => {
      const { outputPath } = file;
      await fs.mkdir(Path.dirname(outputPath), { recursive: true });
      fs.writeFile(outputPath, await file.data, "utf8");
    })
  );
};

const makePageStringifier = (
  fileExtension: string,
  stringify: (page: Page) => string | Promise<string>
): PageStringifier => ({
  fileExtension,
  stringify,
});

export const mdastJsonPageStringifier = makePageStringifier(
  "json",
  JSON.stringify
);

export const markdownPageStringifier = makePageStringifier("md", (page) => {
  return toMarkdown(page.root, {
    extensions: [gfmTableToMarkdown()],
  });
});

export const rstPageStringifier = makePageStringifier("txt", (page) => {
  return toRst(page.root);
});
