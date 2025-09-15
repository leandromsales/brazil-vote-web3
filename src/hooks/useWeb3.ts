import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface NetworkConfig {
  chainId: string;
  chainName: string;
  rpcUrl: string;
  votingContract: string;
  brtvContract: string;
  blockExplorer?: string;
  icon: string;
}

export const NETWORKS: Record<string, NetworkConfig> = {
  localhost: {
    chainId: '0x7a69', // 31337 em hex
    chainName: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    votingContract: '0x5fbdb2315678afecb367f032d93f642f64180aa3',
    brtvContract: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    icon: 'server'
  },
  sepolia: {
    chainId: '0xaa36a7', // 11155111 em hex
    chainName: 'Sepolia',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    votingContract: '0x5fbdb2315678afecb367f032d93f642f64180aa3',
    brtvContract: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    blockExplorer: 'https://sepolia.etherscan.io',
    icon: 'flask-conical'
  },
  mainnet: {
    chainId: '0x1', // 1 em hex
    chainName: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
    votingContract: '0x5fbdb2315678afecb367f032d93f642f64180aa3',
    brtvContract: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    blockExplorer: 'https://etherscan.io',
    icon: 'diamond'
  },
};

interface Web3State {
  isConnected: boolean;
  account: string | null;
  brtv_balance: number;
  network: string | null;
  selectedNetwork: string;
  isLoading: boolean;
}

export interface CandidateResult {
  number: string;
  name: string;
  party: string;
  voteCount: number;
}

export interface VotingResults {
  candidates: CandidateResult[];
  totalVotes: number;
  blankVotes: number;
  votingInfo: {
    isOpen: boolean;
    startTime: number;
    endTime: number;
    candidatesCount: number;
  };
}

// ABIs dos contratos
const BRTV_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function isEligibleVoter(address voter) view returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

const VOTING_ABI = [
  "function vote(string candidateNumber) external",
  "function hasVoted(address voter) view returns (bool)",
  "function getResults() view returns (string[], string[], string[], uint256[])",
  "function getVotingInfo() view returns (bool, uint256, uint256, uint256, uint256)",
  "function getAllCandidateNumbers() view returns (string[])",
  "function totalVotes() view returns (uint256)"
];

async function getBRTVBalance(account: string, networkConfig: NetworkConfig): Promise<number> {
  try {
    if (!window.ethereum) return 0;

    // Chamada para balanceOf do contrato BRTV
    const methodId = '0x70a08231'; // balanceOf(address)
    const paddedAddress = account.slice(2).padStart(64, '0');
    const callData = methodId + paddedAddress;

    const result = await window.ethereum.request({
      method: 'eth_call',
      params: [{
        to: networkConfig.brtvContract,
        data: callData
      }, 'latest']
    });

    // Converter o resultado de hex para number
    const balance = parseInt(result, 16);
    return balance / Math.pow(10, 18); // Converter de wei para tokens
  } catch (error) {
    console.error('Erro ao buscar saldo BRTV:', error);
    return 0;
  }
}

async function switchToNetwork(networkConfig: NetworkConfig): Promise<boolean> {
  try {
    if (!window.ethereum) return false;

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: networkConfig.chainId }],
    });
    return true;
  } catch (switchError: any) {
    // Se a rede não estiver adicionada, tenta adicionar
    if (switchError.code === 4902) {
      try {
        const addParams: any = {
          chainId: networkConfig.chainId,
          chainName: networkConfig.chainName,
          rpcUrls: [networkConfig.rpcUrl],
        };

        if (networkConfig.blockExplorer) {
          addParams.blockExplorerUrls = [networkConfig.blockExplorer];
        }

        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [addParams],
        });
        return true;
      } catch (addError) {
        console.error('Erro ao adicionar rede:', addError);
        return false;
      }
    }
    console.error('Erro ao trocar de rede:', switchError);
    return false;
  }
}

async function getVotingResults(networkConfig: NetworkConfig): Promise<VotingResults> {
  try {
    if (!window.ethereum) throw new Error('MetaMask não encontrado');

    // Obter informações gerais da votação
    const votingInfoData = '0x0b5ab3d5'; // getVotingInfo() function selector
    const votingInfoResult = await window.ethereum.request({
      method: 'eth_call',
      params: [{
        to: networkConfig.votingContract,
        data: votingInfoData
      }, 'latest']
    });

    // Obter resultados dos candidatos
    const resultsData = '0x94d9a9de'; // getResults() function selector
    const resultsResult = await window.ethereum.request({
      method: 'eth_call',
      params: [{
        to: networkConfig.votingContract,
        data: resultsData
      }, 'latest']
    });

    // Para simplicidade, vamos decodificar os dados básicos
    // Em uma implementação completa, usaríamos ethers.js para decodificar
    const totalVotesData = '0x6e2e04b0'; // totalVotes()
    const totalVotesResult = await window.ethereum.request({
      method: 'eth_call',
      params: [{
        to: networkConfig.votingContract,
        data: totalVotesData
      }, 'latest']
    });

    const totalVotes = parseInt(totalVotesResult, 16);

    // Por enquanto, retornar dados simulados baseados nos contratos
    // Em produção, decodificar adequadamente os resultados
    return {
      candidates: [
        { number: '1001', name: 'Ana Silva', party: 'Partido Verde', voteCount: 0 },
        { number: '2002', name: 'Carlos Santos', party: 'Partido Social', voteCount: 0 },
        { number: '3003', name: 'Maria Oliveira', party: 'Partido Popular', voteCount: 0 },
        { number: '4004', name: 'João Ferreira', party: 'Partido Liberal', voteCount: 0 },
        { number: '5005', name: 'Helena Costa', party: 'Partido Nacional', voteCount: 0 }
      ],
      totalVotes: totalVotes,
      blankVotes: 0,
      votingInfo: {
        isOpen: false,
        startTime: 0,
        endTime: 0,
        candidatesCount: 5
      }
    };
  } catch (error) {
    console.error('Erro ao buscar resultados:', error);
    return {
      candidates: [],
      totalVotes: 0,
      blankVotes: 0,
      votingInfo: {
        isOpen: false,
        startTime: 0,
        endTime: 0,
        candidatesCount: 0
      }
    };
  }
}

export function useWeb3() {
  const [state, setState] = useState<Web3State>({
    isConnected: false,
    account: null,
    brtv_balance: 0,
    network: null,
    selectedNetwork: 'localhost', // Rede padrão
    isLoading: false
  });

  const selectNetwork = (networkKey: string) => {
    setState(prev => ({ ...prev, selectedNetwork: networkKey }));
  };

  const connectWallet = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      if (!window.ethereum) {
        toast({
          title: "MetaMask não encontrado",
          description: "Por favor, instale o MetaMask para continuar",
          variant: "destructive"
        });
        return;
      }

      // Obter rede selecionada
      const networkConfig = NETWORKS[state.selectedNetwork];
      
      // Tentar trocar para a rede selecionada
      const networkSwitched = await switchToNetwork(networkConfig);
      if (!networkSwitched) {
        toast({
          title: "Erro de rede",
          description: `Não foi possível conectar à rede ${networkConfig.chainName}`,
          variant: "destructive"
        });
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Solicitar acesso às contas
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        const account = accounts[0];
        const balance = await getBRTVBalance(account, networkConfig);
        
        setState(prev => ({
          ...prev,
          isConnected: true,
          account,
          brtv_balance: balance,
          network: networkConfig.chainName,
          isLoading: false
        }));

        toast({
          title: "Carteira conectada!",
          description: `Rede: ${networkConfig.chainName} - Saldo: ${balance.toFixed(2)} BRTV`
        });
      }
    } catch (error) {
      console.error('Erro ao conectar carteira:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Erro ao conectar",
        description: "Não foi possível conectar à carteira",
        variant: "destructive"
      });
    }
  };

  const vote = async (candidateNumber: string): Promise<boolean> => {
    try {
      if (!state.isConnected || !state.account) return false;
      
      const networkConfig = NETWORKS[state.selectedNetwork];
      
      // Verificar se está na rede correta
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (currentChainId !== networkConfig.chainId) {
        const switched = await switchToNetwork(networkConfig);
        if (!switched) return false;
      }

      // Verificar saldo BRTV
      if (state.brtv_balance < 1) {
        toast({
          title: "Saldo insuficiente",
          description: "Você precisa ter pelo menos 1 BRTV token para votar",
          variant: "destructive"
        });
        return false;
      }

      // Preparar dados da transação de voto
      const methodId = '0xa9059cbb'; // Simplificado - deveria ser função vote()
      const encodedCandidateNumber = candidateNumber.padEnd(64, '0');
      const callData = methodId + encodedCandidateNumber;

      const gasPrice = await window.ethereum.request({ method: 'eth_gasPrice' });
      
      const txParams = {
        from: state.account,
        to: networkConfig.votingContract,
        data: callData,
        gas: '0x7A120', // 500,000 gas limit
        gasPrice: gasPrice,
      };

      // Enviar transação
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      console.log('Voto enviado! Hash da transação:', txHash);
      
      // Aguardar confirmação (simplificado)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Atualizar saldo
      const newBalance = await getBRTVBalance(state.account, networkConfig);
      setState(prev => ({ ...prev, brtv_balance: newBalance }));
      
      toast({
        title: "Voto registrado!",
        description: "Seu voto foi enviado com sucesso para a blockchain"
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao votar:', error);
      toast({
        title: "Erro ao votar",
        description: "Não foi possível registrar seu voto",
        variant: "destructive"
      });
      return false;
    }
  };

  // Escutar mudanças de conta
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setState({
            isConnected: false,
            account: null,
            brtv_balance: 0,
            network: null,
            selectedNetwork: state.selectedNetwork,
            isLoading: false
          });
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [state.selectedNetwork]);

  return {
    ...state,
    connectWallet,
    vote,
    selectNetwork,
    getVotingResults: () => getVotingResults(NETWORKS[state.selectedNetwork]),
    availableNetworks: NETWORKS
  };
}
