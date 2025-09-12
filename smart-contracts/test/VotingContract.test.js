const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("VotingContract", function () {
  let BRTVToken;
  let VotingContract;
  let brtvToken;
  let votingContract;
  let owner;
  let voter1;
  let voter2;
  let voter3;

  beforeEach(async function () {
    [owner, voter1, voter2, voter3] = await ethers.getSigners();
    
    // Deploy BRTV Token
    BRTVToken = await ethers.getContractFactory("BRTVToken");
    brtvToken = await BRTVToken.deploy(owner.address);
    
    // Deploy Voting Contract
    VotingContract = await ethers.getContractFactory("VotingContract");
    votingContract = await VotingContract.deploy(
      await brtvToken.getAddress(),
      owner.address
    );
    
    // Register voters
    await brtvToken.registerVoter(voter1.address);
    await brtvToken.registerVoter(voter2.address);
    await brtvToken.registerVoter(voter3.address);
  });

  describe("Deployment", function () {
    it("Should set the correct BRTV token address", async function () {
      expect(await votingContract.brtvToken()).to.equal(await brtvToken.getAddress());
    });

    it("Should set the correct owner", async function () {
      expect(await votingContract.owner()).to.equal(owner.address);
    });

    it("Should initialize with voting closed", async function () {
      expect(await votingContract.votingOpen()).to.be.false;
    });
  });

  describe("Candidate Management", function () {
    it("Should add a candidate", async function () {
      await votingContract.addCandidate("1001", "João Silva", "Partido A");
      
      const candidate = await votingContract.getCandidate("1001");
      expect(candidate[0]).to.equal("1001"); // number
      expect(candidate[1]).to.equal("João Silva"); // name
      expect(candidate[2]).to.equal("Partido A"); // party
      expect(candidate[3]).to.equal(0); // voteCount
    });

    it("Should emit CandidateAdded event", async function () {
      await expect(votingContract.addCandidate("1001", "João Silva", "Partido A"))
        .to.emit(votingContract, "CandidateAdded")
        .withArgs("1001", "João Silva", "Partido A");
    });

    it("Should not add duplicate candidates", async function () {
      await votingContract.addCandidate("1001", "João Silva", "Partido A");
      
      await expect(votingContract.addCandidate("1001", "Maria Santos", "Partido B"))
        .to.be.revertedWith("Candidate already exists");
    });

    it("Should not add candidate with empty number", async function () {
      await expect(votingContract.addCandidate("", "João Silva", "Partido A"))
        .to.be.revertedWith("Number cannot be empty");
    });

    it("Should not add candidate with empty name", async function () {
      await expect(votingContract.addCandidate("1001", "", "Partido A"))
        .to.be.revertedWith("Name cannot be empty");
    });

    it("Should only allow owner to add candidates", async function () {
      await expect(
        votingContract.connect(voter1).addCandidate("1001", "João Silva", "Partido A")
      ).to.be.revertedWithCustomError(votingContract, "OwnableUnauthorizedAccount");
    });

    it("Should get all candidate numbers", async function () {
      await votingContract.addCandidate("1001", "João Silva", "Partido A");
      await votingContract.addCandidate("2002", "Maria Santos", "Partido B");
      
      const numbers = await votingContract.getAllCandidateNumbers();
      expect(numbers).to.deep.equal(["1001", "2002"]);
    });
  });

  describe("Voting Management", function () {
    beforeEach(async function () {
      await votingContract.addCandidate("1001", "João Silva", "Partido A");
      await votingContract.addCandidate("2002", "Maria Santos", "Partido B");
    });

    it("Should start voting", async function () {
      await votingContract.startVoting(24); // 24 horas
      
      expect(await votingContract.votingOpen()).to.be.true;
    });

    it("Should emit VotingStarted event", async function () {
      await expect(votingContract.startVoting(24))
        .to.emit(votingContract, "VotingStarted");
    });

    it("Should not start voting without candidates", async function () {
      await votingContract.resetVoting();
      
      await expect(votingContract.startVoting(24))
        .to.be.revertedWith("No candidates registered");
    });

    it("Should not start voting twice", async function () {
      await votingContract.startVoting(24);
      
      await expect(votingContract.startVoting(24))
        .to.be.revertedWith("Voting already open");
    });

    it("Should end voting", async function () {
      await votingContract.startVoting(24);
      await votingContract.endVoting();
      
      expect(await votingContract.votingOpen()).to.be.false;
    });

    it("Should emit VotingEnded event", async function () {
      await votingContract.startVoting(24);
      
      await expect(votingContract.endVoting())
        .to.emit(votingContract, "VotingEnded");
    });
  });

  describe("Voting Process", function () {
    beforeEach(async function () {
      await votingContract.addCandidate("1001", "João Silva", "Partido A");
      await votingContract.addCandidate("2002", "Maria Santos", "Partido B");
      await votingContract.startVoting(24);
      
      // Approve voting contract to burn tokens
      await brtvToken.connect(voter1).approve(await votingContract.getAddress(), ethers.parseEther("10"));
      await brtvToken.connect(voter2).approve(await votingContract.getAddress(), ethers.parseEther("10"));
    });

    it("Should allow voting for a candidate", async function () {
      await votingContract.connect(voter1).vote("1001");
      
      expect(await votingContract.hasVoted(voter1.address)).to.be.true;
      expect(await votingContract.voterChoice(voter1.address)).to.equal("1001");
      expect(await votingContract.totalVotes()).to.equal(1);
      
      const candidate = await votingContract.getCandidate("1001");
      expect(candidate[3]).to.equal(1); // voteCount
    });

    it("Should allow blank vote", async function () {
      await votingContract.connect(voter1).vote("0000");
      
      expect(await votingContract.hasVoted(voter1.address)).to.be.true;
      expect(await votingContract.voterChoice(voter1.address)).to.equal("0000");
      expect(await votingContract.totalVotes()).to.equal(1);
    });

    it("Should emit VoteCast event", async function () {
      await expect(votingContract.connect(voter1).vote("1001"))
        .to.emit(votingContract, "VoteCast")
        .withArgs(voter1.address, "1001");
    });

    it("Should burn BRTV tokens when voting", async function () {
      const initialBalance = await brtvToken.balanceOf(voter1.address);
      
      await votingContract.connect(voter1).vote("1001");
      
      const finalBalance = await brtvToken.balanceOf(voter1.address);
      expect(finalBalance).to.equal(initialBalance - ethers.parseEther("1"));
    });

    it("Should not allow voting twice", async function () {
      await votingContract.connect(voter1).vote("1001");
      
      await expect(votingContract.connect(voter1).vote("2002"))
        .to.be.revertedWith("Already voted");
    });

    it("Should not allow voting for non-existent candidate", async function () {
      await expect(votingContract.connect(voter1).vote("9999"))
        .to.be.revertedWith("Candidate does not exist");
    });

    it("Should not allow voting without sufficient tokens", async function () {
      // Transfer all tokens away
      await brtvToken.connect(voter1).transfer(owner.address, ethers.parseEther("10"));
      
      await expect(votingContract.connect(voter1).vote("1001"))
        .to.be.revertedWith("Insufficient BRTV tokens");
    });

    it("Should not allow voting when voting is closed", async function () {
      await votingContract.endVoting();
      
      await expect(votingContract.connect(voter1).vote("1001"))
        .to.be.revertedWith("Voting is not open");
    });
  });

  describe("Results and Information", function () {
    beforeEach(async function () {
      await votingContract.addCandidate("1001", "João Silva", "Partido A");
      await votingContract.addCandidate("2002", "Maria Santos", "Partido B");
      await votingContract.startVoting(24);
      
      // Setup voting
      await brtvToken.connect(voter1).approve(await votingContract.getAddress(), ethers.parseEther("10"));
      await brtvToken.connect(voter2).approve(await votingContract.getAddress(), ethers.parseEther("10"));
      
      // Cast some votes
      await votingContract.connect(voter1).vote("1001");
      await votingContract.connect(voter2).vote("2002");
    });

    it("Should get voting results", async function () {
      const results = await votingContract.getResults();
      
      expect(results[0]).to.deep.equal(["1001", "2002"]); // numbers
      expect(results[1]).to.deep.equal(["João Silva", "Maria Santos"]); // names
      expect(results[2]).to.deep.equal(["Partido A", "Partido B"]); // parties
      expect(results[3][0]).to.equal(1); // vote count for 1001
      expect(results[3][1]).to.equal(1); // vote count for 2002
    });

    it("Should get voting information", async function () {
      const info = await votingContract.getVotingInfo();
      
      expect(info[0]).to.be.true; // isOpen
      expect(info[3]).to.equal(2); // totalVotesCount
      expect(info[4]).to.equal(2); // candidatesCount
    });

    it("Should check if voter has voted", async function () {
      expect(await votingContract.hasVoterVoted(voter1.address)).to.be.true;
      expect(await votingContract.hasVoterVoted(voter3.address)).to.be.false;
    });
  });

  describe("Reset Functionality", function () {
    beforeEach(async function () {
      await votingContract.addCandidate("1001", "João Silva", "Partido A");
      await votingContract.startVoting(24);
    });

    it("Should reset voting", async function () {
      await votingContract.resetVoting();
      
      expect(await votingContract.votingOpen()).to.be.false;
      expect(await votingContract.totalVotes()).to.equal(0);
      
      const numbers = await votingContract.getAllCandidateNumbers();
      expect(numbers.length).to.equal(0);
    });

    it("Should emit VotingReset event", async function () {
      await expect(votingContract.resetVoting())
        .to.emit(votingContract, "VotingReset");
    });

    it("Should only allow owner to reset", async function () {
      await expect(votingContract.connect(voter1).resetVoting())
        .to.be.revertedWithCustomError(votingContract, "OwnableUnauthorizedAccount");
    });
  });
});