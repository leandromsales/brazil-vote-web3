import { candidates } from '@/data/candidates';
import { Candidate } from '@/data/candidates';

interface UrnaDisplayProps {
  currentNumber: string;
  selectedCandidate: Candidate | null;
  isVoting: boolean;
  voteStatus: 'idle' | 'confirming' | 'success' | 'error';
}

export function UrnaDisplay({ currentNumber, selectedCandidate, isVoting, voteStatus }: UrnaDisplayProps) {
  return (
    <div className="bg-gradient-to-b from-urna-screen to-black p-6 rounded-lg shadow-[var(--shadow-screen)] border-4 border-urna-dark min-h-[400px]">
      <div className="text-urna-screen-text">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">URNA ELETRÔNICA WEB 3.0</h2>
          <div className="h-1 bg-gradient-to-r from-urna-green to-urna-yellow rounded"></div>
        </div>

        {/* Status da votação */}
        {voteStatus === 'confirming' && (
          <div className="text-center mb-6">
            <div className="animate-pulse text-urna-yellow text-lg font-semibold">
              Processando voto na blockchain...
            </div>
          </div>
        )}

        {voteStatus === 'success' && (
          <div className="text-center mb-6 p-4 bg-green-600/20 rounded-lg border-2 border-green-400">
            <div className="text-green-300 text-xl font-bold mb-2">✓ VOTO COMPUTADO</div>
            <div className="text-green-400">Transação confirmada na blockchain</div>
          </div>
        )}

        {/* Número digitado */}
        <div className="mb-6">
          <div className="text-lg mb-2">Número do candidato:</div>
          <div className="bg-white text-black p-4 rounded text-3xl font-mono text-center min-h-[60px] flex items-center justify-center">
            {currentNumber || "____"}
          </div>
        </div>

        {/* Informações do candidato */}
        {selectedCandidate && (
          <div className="flex gap-6 p-4 bg-white/10 rounded-lg">
            <div className="flex-shrink-0">
              <img 
                src={selectedCandidate.photo} 
                alt={selectedCandidate.name}
                className="w-24 h-32 object-cover rounded border-2 border-urna-yellow"
              />
            </div>
            <div className="flex-1">
              <div className="text-xl font-bold mb-2 text-urna-yellow">
                {selectedCandidate.name}
              </div>
              <div className="text-lg mb-1">
                Número: {selectedCandidate.number}
              </div>
              <div className="text-base text-urna-screen-text/80">
                Partido: {selectedCandidate.party}
              </div>
            </div>
          </div>
        )}

        {/* Candidato não encontrado */}
        {currentNumber.length === 4 && !selectedCandidate && currentNumber !== "0000" && currentNumber !== "9999" && (
          <div className="p-4 bg-red-600/20 rounded-lg border-2 border-red-400">
            <div className="text-red-300 text-lg font-bold">CANDIDATO NÃO ENCONTRADO</div>
            <div className="text-red-400">Número inválido: {currentNumber}</div>
          </div>
        )}

        {/* Voto Branco */}
        {currentNumber === "0000" && (
          <div className="p-4 bg-blue-600/20 rounded-lg border-2 border-blue-400">
            <div className="text-blue-300 text-xl font-bold">VOTO EM BRANCO</div>
          </div>
        )}

        {/* Voto Nulo */}
        {currentNumber === "9999" && (
          <div className="p-4 bg-red-600/20 rounded-lg border-2 border-red-400">
            <div className="text-red-300 text-xl font-bold">VOTO NULO</div>
          </div>
        )}

        {/* Instruções */}
        {!currentNumber && voteStatus === 'idle' && (
          <div className="text-center text-urna-screen-text/70">
            <p>Digite o número do seu candidato</p>
            <p className="text-sm mt-2">Use os botões numéricos abaixo</p>
          </div>
        )}
      </div>
    </div>
  );
}