import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WalletConnection } from '@/components/WalletConnection';
import { UrnaDisplay } from '@/components/UrnaDisplay';
import { UrnaKeypad } from '@/components/UrnaKeypad';
import { useWeb3 } from '@/hooks/useWeb3';
import { candidates } from '@/data/candidates';
import { voteStore } from '@/store/voteStore';
import { BarChart3 } from 'lucide-react';

export default function Voting() {
  const [currentNumber, setCurrentNumber] = useState('');
  const [voteStatus, setVoteStatus] = useState<'idle' | 'confirming' | 'success' | 'error'>('idle');
  const { isConnected, account, brtv_balance, isLoading, selectedNetwork, network, connectWallet, vote, selectNetwork } = useWeb3();

  const selectedCandidate = candidates.find(c => c.number === currentNumber);

  const handleNumberClick = (number: string) => {
    if (currentNumber.length < 4) {
      setCurrentNumber(currentNumber + number);
    }
  };

  const handleCorrect = () => {
    setCurrentNumber('');
    setVoteStatus('idle');
  };

  const handleBlank = () => {
    setCurrentNumber('0000');
  };

  const handleConfirm = async () => {
    if (!isConnected) return;
    
    if (currentNumber.length !== 4) return;

    setVoteStatus('confirming');
    
    try {
      const success = await vote(currentNumber);
      if (success) {
        // Registrar voto no store local
        voteStore.addVote(currentNumber);
        setVoteStatus('success');
        
        // Reset após 3 segundos
        setTimeout(() => {
          setCurrentNumber('');
          setVoteStatus('idle');
        }, 3000);
      } else {
        setVoteStatus('error');
        setTimeout(() => setVoteStatus('idle'), 2000);
      }
    } catch (error) {
      setVoteStatus('error');
      setTimeout(() => setVoteStatus('idle'), 2000);
    }
  };

  const canConfirm = currentNumber.length === 4 && isConnected && !isLoading && voteStatus === 'idle';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Urna Eletrônica Web 3.0
            </h1>
            <p className="text-muted-foreground">
              Sistema de votação descentralizado com blockchain
            </p>
          </div>
          
          <Link to="/results">
            <Button variant="outline" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Ver Resultados
            </Button>
          </Link>
        </div>

        <WalletConnection 
          isConnected={isConnected}
          account={account}
          brtv_balance={brtv_balance}
          isLoading={isLoading}
          selectedNetwork={selectedNetwork}
          network={network}
          connectWallet={connectWallet}
          selectNetwork={selectNetwork}
        />
      </div>

      {/* Urna Container */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-b from-urna-button to-urna-button-hover p-8 rounded-2xl shadow-[var(--shadow-urna)] border-4 border-urna-dark">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Display da Urna */}
            <div>
              <UrnaDisplay 
                currentNumber={currentNumber}
                selectedCandidate={selectedCandidate}
                isVoting={isLoading}
                voteStatus={voteStatus}
              />
            </div>

            {/* Teclado da Urna */}
            <div>
              <UrnaKeypad
                onNumberClick={handleNumberClick}
                onConfirm={handleConfirm}
                onCorrect={handleCorrect}
                onBlank={handleBlank}
                isVoting={isLoading}
                canConfirm={canConfirm}
              />
            </div>
          </div>
        </div>
      </div>

          {/* Instruções */}
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-card rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Como votar:</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <p>• Digite o número de 4 dígitos do candidato</p>
            <p>• Confirme os dados na tela</p>
            <p>• Clique em CONFIRMA para votar</p>
          </div>
          <div>
            <p>• BRANCO: voto em branco (0000)</p>
            <p>• CORRIGE: apagar número digitado</p>
            <p>• Custo: 1 BRTV token por voto</p>
          </div>
        </div>
        
        {/* Debug info - remover em produção */}
        <div className="mt-4 p-3 bg-muted rounded text-xs">
          <p>Debug: Número: {currentNumber} | Conectado: {isConnected ? 'Sim' : 'Não'} | 
          Carregando: {isLoading ? 'Sim' : 'Não'} | Status: {voteStatus} | 
          Pode Confirmar: {canConfirm ? 'Sim' : 'Não'}</p>
        </div>
      </div>
    </div>
  );
}