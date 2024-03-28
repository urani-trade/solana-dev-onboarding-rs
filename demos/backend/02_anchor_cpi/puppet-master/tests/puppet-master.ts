import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PuppetMaster } from "../target/types/puppet_master";

describe("puppet-master", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.PuppetMaster as Program<PuppetMaster>;

  it("Is initialized!", async () => {
    console.log("Hello");
  });
});
