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

  async function deployERC721ReceiveTestContract() {
    const ERC721ReceiveTestContract = await ethers.getContractFactory(
      "ERC721ReceiveTestContract"
    );
    const erc721ReceiveTestContract = await ERC721ReceiveTestContract.deploy();

    return erc721ReceiveTestContract;
  }

  async function deployERC721NotReceiveTestContract() {
    const ERC721NotReceiveTestContract = await ethers.getContractFactory(
      "ERC721NotReceiveTestContract"
    );
    const erc721NotReceiveTestContract =
      await ERC721NotReceiveTestContract.deploy();

    return erc721NotReceiveTestContract;
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
      await expect(
        sampleErc721.transferFrom(owner.address, otherAccount.address, 0)
      )
        .to.emit(sampleErc721, "Transfer")
        .withArgs(owner.address, otherAccount.address, 0);
      const token1_Owner = await sampleErc721.ownerOf(0);
      expect(token1_Owner).to.equal(otherAccount.address);
    });

    it("owner approve token to other, other transfer me", async function () {
      const { sampleErc721, owner, otherAccount } = await loadFixture(
        deploySampleErc721Fixture
      );
      await expect(sampleErc721.approve(otherAccount.address, 0))
        .to.emit(sampleErc721, "Approval")
        .withArgs(owner.address, otherAccount.address, 0);

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
      await expect(sampleErc721.setApprovalForAll(otherAccount.address, true))
        .to.emit(sampleErc721, "ApprovalForAll")
        .withArgs(owner.address, otherAccount.address, true);
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
      await expect(
        sampleErc721["safeTransferFrom(address,address,uint256)"](
          owner.address,
          otherAccount.address,
          0
        )
      )
        .to.emit(sampleErc721, "Transfer")
        .withArgs(owner.address, otherAccount.address, 0);

      const token1_Owner = await sampleErc721.ownerOf(0);
      expect(token1_Owner).to.equal(otherAccount.address);
    });

    it("owner safeTransferFrom with data with data", async function () {
      const { sampleErc721, owner, otherAccount } = await loadFixture(
        deploySampleErc721Fixture
      );
      await expect(
        sampleErc721["safeTransferFrom(address,address,uint256,bytes)"](
          owner.address,
          otherAccount.address,
          0,
          "0x1234"
        )
      )
        .to.emit(sampleErc721, "Transfer")
        .withArgs(owner.address, otherAccount.address, 0);
      const token1_Owner = await sampleErc721.ownerOf(0);
      expect(token1_Owner).to.equal(otherAccount.address);
    });

    it("safeTransferFrom to erc721receiver contract", async function () {
      const { sampleErc721, owner, otherAccount } = await loadFixture(
        deploySampleErc721Fixture
      );
      const erc721ReceiveTestContract = await loadFixture(
        deployERC721ReceiveTestContract
      );
      const targetAddress = await erc721ReceiveTestContract.getAddress();
      await expect(
        sampleErc721["safeTransferFrom(address,address,uint256)"](
          owner.address,
          targetAddress,
          0
        )
      )
        .to.emit(sampleErc721, "Transfer")
        .withArgs(owner.address, targetAddress, 0);

      const token1_Owner = await sampleErc721.ownerOf(0);
      expect(token1_Owner).to.equal(targetAddress);
    });

    it("safeTransferFrom to erc721receiver contract with data", async function () {
      const { sampleErc721, owner, otherAccount } = await loadFixture(
        deploySampleErc721Fixture
      );
      const erc721ReceiveTestContract = await loadFixture(
        deployERC721ReceiveTestContract
      );
      const targetAddress = await erc721ReceiveTestContract.getAddress();
      await expect(
        sampleErc721["safeTransferFrom(address,address,uint256,bytes)"](
          owner.address,
          targetAddress,
          0,
          "0x1234"
        )
      )
        .to.emit(sampleErc721, "Transfer")
        .withArgs(owner.address, targetAddress, 0);

      const token1_Owner = await sampleErc721.ownerOf(0);
      expect(token1_Owner).to.equal(targetAddress);
    });

    it("safeTransferFrom to erc721__not__receiver contract", async function () {
      const { sampleErc721, owner } = await loadFixture(
        deploySampleErc721Fixture
      );
      const erc721_Not_ReceiveTestContract = await loadFixture(
        deployERC721NotReceiveTestContract
      );
      const targetAddress = await erc721_Not_ReceiveTestContract.getAddress();
      await expect(
        sampleErc721["safeTransferFrom(address,address,uint256,bytes)"](
          owner.address,
          targetAddress,
          0,
          "0x1234"
        )
      ).to.be.rejectedWith();
    });

    it("getApprove not exists token", async function () {
      const { sampleErc721, owner } = await loadFixture(
        deploySampleErc721Fixture
      );
      await expect(
        sampleErc721.getApproved("d46641e1f3547af87a93")
      ).to.be.rejectedWith();
    });
  });
});
