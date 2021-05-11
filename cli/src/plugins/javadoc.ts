import { Plugin } from "..";

const Javadoc: Plugin = {
  async run(args): Promise<void> {
    // TODO
    console.log("It works! Temporary dir:", args.tempDir);
  },
};

export default Javadoc;
