// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BRTVToken
 * @dev Token ERC-20 para o sistema de votação eletrônica brasileiro
 * Símbolo: BRTV
 * Nome: Brazil Vote Token
 * Decimais: 18
 * Supply inicial: 1,000,000 tokens
 */
contract BRTVToken is ERC20, ERC20Burnable, Ownable {
    uint256 private constant INITIAL_SUPPLY = 1_000_000 * 10**18; // 1 milhão de tokens
    
    // Mapeamento para controlar quais endereços podem votar
    mapping(address => bool) public canVote;
    
    // Eventos
    event VoterRegistered(address indexed voter);
    event VoterRemoved(address indexed voter);
    
    constructor(address initialOwner) 
        ERC20("Brazil Vote Token", "BRTV") 
        Ownable(initialOwner)
    {
        _mint(initialOwner, INITIAL_SUPPLY);
    }
    
    /**
     * @dev Registra um eleitor elegível para receber tokens de voto
     * @param voter Endereço do eleitor
     */
    function registerVoter(address voter) external onlyOwner {
        require(voter != address(0), "Invalid voter address");
        require(!canVote[voter], "Voter already registered");
        
        canVote[voter] = true;
        
        // Transferir 1 tokens BRTV para o novo eleitor
        _transfer(owner(), voter, 1 * 10**18);
        
        emit VoterRegistered(voter);
    }
    
    /**
     * @dev Remove um eleitor do sistema
     * @param voter Endereço do eleitor
     */
    function removeVoter(address voter) external onlyOwner {
        require(canVote[voter], "Voter not registered");
        
        canVote[voter] = false;
        emit VoterRemoved(voter);
    }
    
    /**
     * @dev Permite ao owner fazer mint de novos tokens
     * @param to Endereço que receberá os tokens
     * @param amount Quantidade de tokens
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Verifica se um endereço pode votar
     * @param voter Endereço do eleitor
     * @return true se pode votar
     */
    function isEligibleVoter(address voter) external view returns (bool) {
        return canVote[voter] && balanceOf(voter) == 1 * 10**18; // Precisa ter pelo menos 1 token
    }
}
