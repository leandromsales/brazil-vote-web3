const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BRTVToken", function () {
  let BRTVToken;
  let brtvToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  const INITIAL_SUPPLY = ethers.parseEther("1000000"); // 1 milhão de tokens

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    
    BRTVToken = await ethers.getContractFactory("BRTVToken");
    brtvToken = await BRTVToken.deploy(owner.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await brtvToken.owner()).to.equal(owner.address);
    });

    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await brtvToken.balanceOf(owner.address);
      expect(await brtvToken.totalSupply()).to.equal(ownerBalance);
      expect(ownerBalance).to.equal(INITIAL_SUPPLY);
    });

    it("Should have correct token details", async function () {
      expect(await brtvToken.name()).to.equal("Brazil Vote Token");
      expect(await brtvToken.symbol()).to.equal("BRTV");
      expect(await brtvToken.decimals()).to.equal(18);
    });
  });

  describe("Voter Registration", function () {
    it("Should register a voter and transfer tokens", async function () {
      await brtvToken.registerVoter(addr1.address);
      
      expect(await brtvToken.canVote(addr1.address)).to.be.true;
      expect(await brtvToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("10"));
    });

    it("Should emit VoterRegistered event", async function () {
      await expect(brtvToken.registerVoter(addr1.address))
        .to.emit(brtvToken, "VoterRegistered")
        .withArgs(addr1.address);
    });

    it("Should not register the same voter twice", async function () {
      await brtvToken.registerVoter(addr1.address);
      
      await expect(brtvToken.registerVoter(addr1.address))
        .to.be.revertedWith("Voter already registered");
    });

    it("Should not register zero address", async function () {
      await expect(brtvToken.registerVoter(ethers.ZeroAddress))
        .to.be.revertedWith("Invalid voter address");
    });

    it("Should only allow owner to register voters", async function () {
      await expect(brtvToken.connect(addr1).registerVoter(addr2.address))
        .to.be.revertedWithCustomError(brtvToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Voter Removal", function () {
    beforeEach(async function () {
      await brtvToken.registerVoter(addr1.address);
    });

    it("Should remove a voter", async function () {
      await brtvToken.removeVoter(addr1.address);
      
      expect(await brtvToken.canVote(addr1.address)).to.be.false;
    });

    it("Should emit VoterRemoved event", async function () {
      await expect(brtvToken.removeVoter(addr1.address))
        .to.emit(brtvToken, "VoterRemoved")
        .withArgs(addr1.address);
    });

    it("Should not remove unregistered voter", async function () {
      await expect(brtvToken.removeVoter(addr2.address))
        .to.be.revertedWith("Voter not registered");
    });

    it("Should only allow owner to remove voters", async function () {
      await expect(brtvToken.connect(addr1).removeVoter(addr1.address))
        .to.be.revertedWithCustomError(brtvToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Eligibility Check", function () {
    it("Should return true for eligible voter", async function () {
      await brtvToken.registerVoter(addr1.address);
      
      expect(await brtvToken.isEligibleVoter(addr1.address)).to.be.true;
    });

    it("Should return false for unregistered voter", async function () {
      expect(await brtvToken.isEligibleVoter(addr1.address)).to.be.false;
    });

    it("Should return false for voter with insufficient balance", async function () {
      await brtvToken.registerVoter(addr1.address);
      
      // Transferir todos os tokens para fora
      await brtvToken.connect(addr1).transfer(owner.address, ethers.parseEther("10"));
      
      expect(await brtvToken.isEligibleVoter(addr1.address)).to.be.false;
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");
      await brtvToken.mint(addr1.address, mintAmount);
      
      expect(await brtvToken.balanceOf(addr1.address)).to.equal(mintAmount);
    });

    it("Should only allow owner to mint", async function () {
      await expect(brtvToken.connect(addr1).mint(addr2.address, ethers.parseEther("1000")))
        .to.be.revertedWithCustomError(brtvToken, "OwnableUnauthorizedAccount");
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      await brtvToken.registerVoter(addr1.address);
    });

    it("Should allow token burning", async function () {
      const burnAmount = ethers.parseEther("5");
      await brtvToken.connect(addr1).burn(burnAmount);
      
      expect(await brtvToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("5"));
    });

    it("Should allow burning from approved address", async function () {
      const burnAmount = ethers.parseEther("5");
      
      await brtvToken.connect(addr1).approve(owner.address, burnAmount);
      await brtvToken.burnFrom(addr1.address, burnAmount);
      
      expect(await brtvToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("5"));
    });
  });
});