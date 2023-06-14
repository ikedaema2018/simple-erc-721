import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SampleErc721", function () {
  async function deploySampleErc721Fixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const SampleErc721 = await ethers.getContractFactory("SampleErc721");
    const sampleErc721 = await SampleErc721.deploy();

    return { sampleErc721, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Initial to token to owner", async function () {
      const { sampleErc721, owner } = await loadFixture(
        deploySampleErc721Fixture
      );
      const ownerBalanceNum = await sampleErc721.balanceOf(owner);
      expect(ownerBalanceNum).to.equal(2);

      const token1_Owner = await sampleErc721.ownerOf(0);
      const token2_Owner = await sampleErc721.ownerOf(1);

      expect(token1_Owner).to.equal(owner.address);
      expect(token2_Owner).to.equal(owner.address);
    });

    it("transfer token owner to other", async function () {
      const { sampleErc721, owner, otherAccount } = await loadFixture(
        deploySampleErc721Fixture
      );
      await sampleErc721.transferFrom(owner.address, otherAccount.address, 0);
      const token1_Owner = await sampleErc721.ownerOf(0);
      expect(token1_Owner).to.equal(otherAccount.address);
    });

    it("owner approve token to other, other transfer me", async function () {
      const { sampleErc721, owner, otherAccount } = await loadFixture(
        deploySampleErc721Fixture
      );
      await sampleErc721.approve(otherAccount.address, 0);

      const approvedOwner = await sampleErc721.getApproved(0);
      expect(approvedOwner).to.equal(otherAccount.address);

      await sampleErc721
        .connect(otherAccount)
        .transferFrom(owner.address, otherAccount.address, 0);
      const token1_Owner = await sampleErc721.ownerOf(0);
      expect(token1_Owner).to.equal(otherAccount.address);
    });

    it("owner approvedAll", async function () {
      const { sampleErc721, owner, otherAccount } = await loadFixture(
        deploySampleErc721Fixture
      );
      await sampleErc721.setApprovalForAll(otherAccount.address, true);
      const approvedAll = await sampleErc721.isApprovedForAll(
        owner,
        otherAccount
      );
      expect(approvedAll).to.equal(true);
    });

    it("owner safeTransferFrom", async function () {
      const { sampleErc721, owner, otherAccount } = await loadFixture(
        deploySampleErc721Fixture
      );
      // 型エラーになってる謎
      await sampleErc721["safeTransferFrom(address,address,uint256)"](
        owner.address,
        otherAccount.address,
        0
      );
      const token1_Owner = await sampleErc721.ownerOf(0);
      expect(token1_Owner).to.equal(otherAccount.address);
    });

    it("owner safeTransferFrom with data", async function () {
      const { sampleErc721, owner, otherAccount } = await loadFixture(
        deploySampleErc721Fixture
      );
      await sampleErc721["safeTransferFrom(address,address,uint256,bytes)"](
        owner.address,
        otherAccount.address,
        0,
        "0x1234"
      );
      const token1_Owner = await sampleErc721.ownerOf(0);
      expect(token1_Owner).to.equal(otherAccount.address);
    });
  });
});
