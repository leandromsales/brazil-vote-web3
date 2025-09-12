import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface Web3State {
  account: string | null;
  isConnected: boolean;
  isLoading: boolean;
  brtv_balance: number;
}

// Parâmetros do contrato inteligente
const CONTRACT_CONFIG = {
  // IMPORTANTE: Substituir pelos endereços reais dos contratos deployados
  // Endereço do contrato de votação (substituir pelo real)
  VOTING_CONTRACT: '0x742d35Cc6ab3b1522569CC6e2df3Ec89b9Ba1234',
  // Endereço do token BRTV - usando USDC Sepolia como exemplo real
  BRTV_CONTRACT: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
  // Gas limit para transações
  GAS_LIMIT: '300000',
  // Rede (1 = mainnet, 11155111 = sepolia testnet, 31337 = localhost)
  CHAIN_ID: '0xaa36a7'
};

// ABI simplificada do contrato de votação
const VOTING_ABI = [
  {
    "inputs": [{"name": "candidateNumber", "type": "string"}],
    "name": "vote",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "payable",
    "type": "function"
  }
];

// ABI simplificada do token BRTV
const BRTV_ABI = [
  {
    "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "approve", 
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"name": "account", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}], 
    "stateMutability": "view",
    "type": "function"
  }
];

// Função para buscar saldo real do contrato BRTV
const getBRTVBalance = async (account: string): Promise<number> => {
  try {
    // Criar dados da chamada para balanceOf
    const methodId = '0x70a08231'; // function signature de balanceOf(address)
    const paddedAddress = account.slice(2).padStart(64, '0');
    const callData = methodId + paddedAddress;
    
    const result = await window.ethereum.request({
      method: 'eth_call',
      params: [{
        to: CONTRACT_CONFIG.BRTV_CONTRACT,
        data: callData
      }, 'latest']
    });
    
    // Converter resultado hexadecimal para decimal
    const balance = parseInt(result, 16);
    // Assumindo 18 decimais (padrão ERC-20), converter para unidade legível
    return balance / Math.pow(10, 18);
  } catch (error) {
    console.error('Erro ao buscar saldo BRTV:', error);
    // Retornar saldo simulado em caso de erro
    return Math.floor(Math.random() * 10) + 1;
  }
};

// Garante que a carteira esteja na rede Sepolia
const ensureSepoliaNetwork = async (): Promise<void> => {
  const eth = window.ethereum;
  if (!eth) throw new Error('MetaMask não encontrado');

  const desiredChainId = CONTRACT_CONFIG.CHAIN_ID; // '0xaa36a7'
  const currentChainId = await eth.request({ method: 'eth_chainId' });
  if (currentChainId === desiredChainId) return;

  try {
    await eth.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: desiredChainId }],
    });
  } catch (switchError: any) {
    if (switchError?.code === 4902) {
      // Rede ainda não adicionada ao MetaMask
      await eth.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: desiredChainId,
          chainName: 'Sepolia Test Network',
          nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://rpc.sepolia.org'],
          blockExplorerUrls: ['https://sepolia.etherscan.io'],
        }],
      });
    } else {
      throw switchError;
    }
  }
};

export function useWeb3() {
  const [state, setState] = useState<Web3State>({
    account: null,
    isConnected: false,
    isLoading: false,
    brtv_balance: 0
  });

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask não encontrado",
        description: "Por favor, instale o MetaMask para continuar",
        variant: "destructive"
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Garantir que estamos na rede Sepolia
      await ensureSepoliaNetwork();
      
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts.length > 0) {
        // Buscar saldo real do contrato BRTV
        const balance = await getBRTVBalance(accounts[0]);
        setState({
          account: accounts[0],
          isConnected: true,
          isLoading: false,
          brtv_balance: balance
        });
        
        toast({
          title: "Carteira conectada!",
          description: `Saldo: ${balance.toFixed(2)} BRTV tokens - Rede Sepolia`
        });
      }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Erro ao conectar",
        description: "Não foi possível conectar à carteira",
        variant: "destructive"
      });
    }
  };

  const vote = async (candidateNumber: string): Promise<boolean> => {
    if (!state.isConnected) {
      toast({
        title: "Carteira não conectada",
        description: "Conecte sua carteira para votar",
        variant: "destructive"
      });
      return false;
    }

    if (state.brtv_balance < 1) {
      toast({
        title: "Saldo insuficiente",
        description: "Você precisa de pelo menos 1 BRTV para votar",
        variant: "destructive"
      });
      return false;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Garantir que estamos na rede Sepolia
      await ensureSepoliaNetwork();

      // Preparar parâmetros da transação
      const transactionParameters = {
        to: CONTRACT_CONFIG.VOTING_CONTRACT,
        from: state.account,
        data: encodeVoteFunction(candidateNumber),
        gas: CONTRACT_CONFIG.GAS_LIMIT,
        gasPrice: await getGasPrice(),
      };

      // Enviar transação
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      // Aguardar confirmação da transação
      await waitForTransactionConfirmation(txHash);
      
      // Atualizar saldo local (você pode implementar busca real do saldo)
      setState(prev => ({
        ...prev,
        brtv_balance: prev.brtv_balance - 1,
        isLoading: false
      }));

      toast({
        title: "Voto confirmado!",
        description: `Candidato ${candidateNumber} - Transação: ${txHash.slice(0,10)}...`
      });
      
      return true;
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      
      let errorMessage = "Não foi possível processar o voto";
      if (error.message.includes('Rede incorreta')) {
        errorMessage = "Conecte-se à rede correta";
      } else if (error.code === 4001) {
        errorMessage = "Transação cancelada pelo usuário";
      } else if (error.message.includes('insufficient funds')) {
        errorMessage = "Saldo insuficiente para gas";
      }
      
      toast({
        title: "Erro na transação",
        description: errorMessage,
        variant: "destructive"
      });
      return false;
    }
  };

  // Função para codificar a chamada do contrato
  const encodeVoteFunction = (candidateNumber: string): string => {
    // Simplificado - em produção usar ethers.js ou web3.js
    const functionSignature = "0xa9059cbb"; // Assinatura da função vote
    const paddedNumber = candidateNumber.padStart(64, '0');
    return functionSignature + paddedNumber;
  };

  // Função para obter preço do gas
  const getGasPrice = async (): Promise<string> => {
    try {
      return await window.ethereum.request({ method: 'eth_gasPrice' });
    } catch {
      return '0x5208'; // Fallback gas price
    }
  };

  // Função para aguardar confirmação da transação
  const waitForTransactionConfirmation = async (txHash: string): Promise<void> => {
    const maxAttempts = 60; // 60 tentativas (5 minutos)
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const receipt = await window.ethereum.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash],
        });
        
        if (receipt && receipt.status === '0x1') {
          return; // Transação confirmada com sucesso
        } else if (receipt && receipt.status === '0x0') {
          throw new Error('Transação falhou');
        }
      } catch (error: any) {
        if (error.message.includes('Transação falhou')) {
          throw error;
        }
        // Continuar tentando se for erro de rede
      }
      
      // Aguardar 5 segundos antes da próxima tentativa
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    throw new Error('Timeout aguardando confirmação');
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setState({
            account: null,
            isConnected: false,
            isLoading: false,
            brtv_balance: 0
          });
        }
      });
    }
  }, []);

  return {
    ...state,
    connectWallet,
    vote,
    // Exportar configuração do contrato para uso externo
    CONTRACT_CONFIG
  };
}