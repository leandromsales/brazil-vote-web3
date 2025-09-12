const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy BRTV Token
  console.log("\n=== Deploying BRTV Token ===");
  const BRTVToken = await ethers.getContractFactory("BRTVToken");
  const brtvToken = await BRTVToken.deploy(deployer.address);
  await brtvToken.waitForDeployment();
  
  const brtvTokenAddress = await brtvToken.getAddress();
  console.log("BRTV Token deployed to:", brtvTokenAddress);

  // Deploy Voting Contract
  console.log("\n=== Deploying Voting Contract ===");
  const VotingContract = await ethers.getContractFactory("VotingContract");
  const votingContract = await VotingContract.deploy(brtvTokenAddress, deployer.address);
  await votingContract.waitForDeployment();
  
  const votingContractAddress = await votingContract.getAddress();
  console.log("Voting Contract deployed to:", votingContractAddress);

  // Verify deployment
  console.log("\n=== Verifying Deployment ===");
  const tokenName = await brtvToken.name();
  const tokenSymbol = await brtvToken.symbol();
  const totalSupply = await brtvToken.totalSupply();
  
  console.log("Token Name:", tokenName);
  console.log("Token Symbol:", tokenSymbol);
  console.log("Total Supply:", ethers.formatEther(totalSupply), "BRTV");
  
  const votingTokenAddress = await votingContract.brtvToken();
  console.log("Voting Contract Token Address:", votingTokenAddress);
  console.log("Addresses Match:", votingTokenAddress === brtvTokenAddress);

  // Setup example candidates
  console.log("\n=== Setting up Example Candidates ===");
  
  const candidates = [
    { number: "1001", name: "João Silva", party: "Partido Democrático" },
    { number: "2002", name: "Maria Santos", party: "Partido Liberal" },
    { number: "3003", name: "Pedro Oliveira", party: "Partido Social" },
    { number: "4004", name: "Ana Costa", party: "Partido Verde" },
    { number: "5005", name: "Carlos Ferreira", party: "Partido Trabalhista" }
  ];

  for (const candidate of candidates) {
    const tx = await votingContract.addCandidate(
      candidate.number,
      candidate.name,
      candidate.party
    );
    await tx.wait();
    console.log(`Added candidate ${candidate.number}: ${candidate.name} (${candidate.party})`);
  }

  // Register example voters
  console.log("\n=== Registering Example Voters ===");
  const [, voter1, voter2, voter3] = await ethers.getSigners();
  
  if (voter1) {
    await brtvToken.registerVoter(voter1.address);
    console.log("Registered voter 1:", voter1.address);
  }
  
  if (voter2) {
    await brtvToken.registerVoter(voter2.address);
    console.log("Registered voter 2:", voter2.address);
  }
  
  if (voter3) {
    await brtvToken.registerVoter(voter3.address);
    console.log("Registered voter 3:", voter3.address);
  }

  // Summary
  console.log("\n=== Deployment Summary ===");
  console.log("BRTV Token Address:", brtvTokenAddress);
  console.log("Voting Contract Address:", votingContractAddress);
  console.log("Deployer Address:", deployer.address);
  console.log("Candidates Added:", candidates.length);
  console.log("Voters Registered:", 3);
  
  console.log("\n=== Next Steps ===");
  console.log("1. Update frontend CONTRACT_CONFIG with these addresses:");
  console.log(`   BRTV_CONTRACT: '${brtvTokenAddress}'`);
  console.log(`   VOTING_CONTRACT: '${votingContractAddress}'`);
  console.log("2. Start voting with: await votingContract.startVoting(24) // 24 hours");
  console.log("3. Verify contracts on Etherscan if deploying to testnet/mainnet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });