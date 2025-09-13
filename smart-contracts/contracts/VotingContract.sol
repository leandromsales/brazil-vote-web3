// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./BRTVToken.sol";

/**
 * @title VotingContract
 * @dev Contrato de votação eletrônica que usa tokens BRTV
 */
contract VotingContract is Ownable, ReentrancyGuard {
    BRTVToken public brtvToken;
    
    // Estrutura do candidato
    struct Candidate {
        string number;      // Número do candidato (ex: "1001")
        string name;        // Nome do candidato
        string party;       // Partido político
        uint256 voteCount;  // Quantidade de votos recebidos
        bool exists;        // Se o candidato existe
    }
    
    // Mapeamentos
    mapping(string => Candidate) public candidates; // número do candidato => dados do candidato
    mapping(address => bool) public hasVoted;       // endereço => já votou
    mapping(address => string) public voterChoice;  // endereço => escolha do eleitor
    
    // Arrays para facilitar iteração
    string[] public candidateNumbers;
    
    // Variáveis de controle
    bool public votingOpen;
    uint256 public votingStartTime;
    uint256 public votingEndTime;
    uint256 public totalVotes;
    uint256 public constant VOTING_COST = 1 * 10**18; // 1 token BRTV por voto
    
    // Eventos
    event CandidateAdded(string indexed number, string name, string party);
    event VoteCast(address indexed voter, string indexed candidateNumber);
    event VotingStarted(uint256 startTime, uint256 endTime);
    event VotingEnded(uint256 endTime);
    event VotingReset();
    
    constructor(address brtvTokenAddress, address initialOwner) Ownable(initialOwner) {
        brtvToken = BRTVToken(brtvTokenAddress);
        votingOpen = false;
    }
    
    /**
     * @dev Adiciona um novo candidato
     * @param number Número do candidato
     * @param name Nome do candidato
     * @param party Partido do candidato
     */
    function addCandidate(
        string memory number,
        string memory name,
        string memory party
    ) external onlyOwner {
        require(!candidates[number].exists, "Candidate already exists");
        require(bytes(number).length > 0, "Number cannot be empty");
        require(bytes(name).length > 0, "Name cannot be empty");
        
        candidates[number] = Candidate({
            number: number,
            name: name,
            party: party,
            voteCount: 0,
            exists: true
        });
        
        candidateNumbers.push(number);
        emit CandidateAdded(number, name, party);
    }
    
    /**
     * @dev Inicia o período de votação
     * @param durationInHours Duração da votação em horas
     */
    function startVoting(uint256 durationInHours) external onlyOwner {
        require(!votingOpen, "Voting already open");
        require(candidateNumbers.length > 0, "No candidates registered");
        
        votingOpen = true;
        votingStartTime = block.timestamp;
        votingEndTime = block.timestamp + (durationInHours * 1 hours);
        
        emit VotingStarted(votingStartTime, votingEndTime);
    }
    
    /**
     * @dev Encerra o período de votação
     */
    function endVoting() external onlyOwner {
        require(votingOpen, "Voting not open");
        
        votingOpen = false;
        emit VotingEnded(block.timestamp);
    }
    
    /**
     * @dev Função principal de votação
     * @param candidateNumber Número do candidato escolhido
     */
    function vote(string memory candidateNumber) external nonReentrant {
        require(votingOpen, "Voting is not open");
        require(block.timestamp <= votingEndTime, "Voting period ended");
        require(!hasVoted[msg.sender], "Already voted");
        require(brtvToken.balanceOf(msg.sender) >= VOTING_COST, "Insufficient BRTV tokens");
        require(brtvToken.isEligibleVoter(msg.sender), "Not eligible to vote");
        
        // Verificar se é voto em branco ou candidato válido
        bool isBlankVote = keccak256(bytes(candidateNumber)) == keccak256(bytes("0000"));
        if (!isBlankVote) {
            require(candidates[candidateNumber].exists, "Candidate does not exist");
        }
        
        // Queimar o token BRTV (custo do voto)
        brtvToken.burnFrom(msg.sender, VOTING_COST);
        
        // Registrar o voto
        hasVoted[msg.sender] = true;
        voterChoice[msg.sender] = candidateNumber;
        totalVotes++;
        
        // Incrementar contador do candidato (mesmo para voto em branco)
        if (!isBlankVote) {
            candidates[candidateNumber].voteCount++;
        }
        
        emit VoteCast(msg.sender, candidateNumber);
    }
    
    /**
     * @dev Obtém informações de um candidato
     * @param number Número do candidato
     * @return Dados do candidato
     */
    function getCandidate(string memory number) 
        external 
        view 
        returns (string memory, string memory, string memory, uint256) 
    {
        require(candidates[number].exists, "Candidate does not exist");
        Candidate memory candidate = candidates[number];
        return (candidate.number, candidate.name, candidate.party, candidate.voteCount);
    }
    
    /**
     * @dev Obtém todos os números de candidatos
     * @return Array com números dos candidatos
     */
    function getAllCandidateNumbers() external view returns (string[] memory) {
        return candidateNumbers;
    }
    
    /**
     * @dev Obtém resultados completos da votação
     */
    function getResults() 
        external 
        view 
        returns (
            string[] memory numbers,
            string[] memory names,
            string[] memory parties,
            uint256[] memory voteCounts
        ) 
    {
        uint256 length = candidateNumbers.length;
        numbers = new string[](length);
        names = new string[](length);
        parties = new string[](length);
        voteCounts = new uint256[](length);
        
        for (uint256 i = 0; i < length; i++) {
            string memory number = candidateNumbers[i];
            Candidate memory candidate = candidates[number];
            numbers[i] = candidate.number;
            names[i] = candidate.name;
            parties[i] = candidate.party;
            voteCounts[i] = candidate.voteCount;
        }
    }
    
    /**
     * @dev Verifica se um eleitor já votou
     * @param voter Endereço do eleitor
     * @return true se já votou
     */
    function hasVoterVoted(address voter) external view returns (bool) {
        return hasVoted[voter];
    }
    
    /**
     * @dev Obtém informações gerais da votação
     */
    function getVotingInfo() 
        external 
        view 
        returns (
            bool isOpen,
            uint256 startTime,
            uint256 endTime,
            uint256 totalVotesCount,
            uint256 candidatesCount
        ) 
    {
        return (
            votingOpen && block.timestamp <= votingEndTime,
            votingStartTime,
            votingEndTime,
            totalVotes,
            candidateNumbers.length
        );
    }
    
    /**
     * @dev Reset completo da votação (apenas owner)
     */
    function resetVoting() external onlyOwner {
        votingOpen = false;
        totalVotes = 0;
        votingStartTime = 0;
        votingEndTime = 0;
        
        // Limpar candidatos
        for (uint256 i = 0; i < candidateNumbers.length; i++) {
            delete candidates[candidateNumbers[i]];
        }
        delete candidateNumbers;
        
        emit VotingReset();
    }
}
