import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { candidates } from '@/data/candidates';
import { useWeb3, VotingResults } from '@/hooks/useWeb3';
import { ArrowLeft, Trophy, Users, FileX, Ban, RefreshCw } from 'lucide-react';

export default function Results() {
  const { getVotingResults, selectedNetwork, isConnected } = useWeb3();
  const [results, setResults] = useState<VotingResults>({
    candidates: [],
    totalVotes: 0,
    blankVotes: 0,
    votingInfo: {
      isOpen: false,
      startTime: 0,
      endTime: 0,
      candidatesCount: 0
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadResults = async () => {
    setIsLoading(true);
    try {
      const contractResults = await getVotingResults();
      
      // Combinar dados do contrato com dados locais dos candidatos
      const enrichedCandidates = contractResults.candidates.map(contractCandidate => {
        const localCandidate = candidates.find(c => c.number === contractCandidate.number);
        return {
          ...contractCandidate,
          photo: localCandidate?.photo || '',
          id: contractCandidate.number
        };
      });

      setResults({
        ...contractResults,
        candidates: enrichedCandidates
      });
    } catch (error) {
      console.error('Erro ao carregar resultados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
    
    // Atualizar resultados a cada 30 segundos
    const interval = setInterval(loadResults, 30000);
    return () => clearInterval(interval);
  }, [selectedNetwork]);

  // Ordenar candidatos por número de votos
  const sortedCandidates = results.candidates
    .map(candidate => {
      const localCandidate = candidates.find(c => c.number === candidate.number);
      return {
        ...candidate,
        photo: localCandidate?.photo || '',
        percentage: results.totalVotes > 0 ? (candidate.voteCount / results.totalVotes) * 100 : 0
      };
    })
    .sort((a, b) => b.voteCount - a.voteCount);

  const blankPercentage = results.totalVotes > 0 ? (results.blankVotes / results.totalVotes) * 100 : 0;
  const nullVotes = 0; // Por enquanto, vamos calcular isso mais tarde
  const nullPercentage = 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/voting">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-primary">
              Resultados da Eleição
            </h1>
            <p className="text-muted-foreground">
              Apuração em tempo real - Sistema Web 3.0 ({selectedNetwork})
            </p>
          </div>
          <Button 
            onClick={loadResults} 
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Estatísticas gerais */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{results.totalVotes}</div>
                <div className="text-sm text-muted-foreground">Total de Votos</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-urna-yellow" />
              <div>
                <div className="text-2xl font-bold">
                  {sortedCandidates[0]?.voteCount || 0}
                </div>
                <div className="text-sm text-muted-foreground">Mais Votado</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <FileX className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{results.blankVotes}</div>
                <div className="text-sm text-muted-foreground">Votos Brancos</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Ban className="w-8 h-8 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{nullVotes}</div>
                <div className="text-sm text-muted-foreground">Votos Nulos</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Status da votação */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Status da Votação</h3>
              <p className="text-sm text-muted-foreground">
                {results.votingInfo.isOpen ? 'Votação Aberta' : 'Votação Encerrada'} • 
                Rede: {selectedNetwork} • 
                Candidatos: {results.votingInfo.candidatesCount}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              results.votingInfo.isOpen 
                ? 'bg-urna-green/20 text-urna-green' 
                : 'bg-destructive/20 text-destructive'
            }`}>
              {results.votingInfo.isOpen ? 'ABERTA' : 'ENCERRADA'}
            </div>
          </div>
        </Card>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Resultados dos Candidatos */}
          <div>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-urna-yellow" />
              Candidatos
            </h2>
            
            <div className="space-y-4">
              {sortedCandidates.length > 0 ? sortedCandidates.map((candidate, index) => (
                <Card key={candidate.number} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {candidate.photo ? (
                        <img 
                          src={candidate.photo}
                          alt={candidate.name}
                          className="w-16 h-20 object-cover rounded border-2 border-border"
                        />
                      ) : (
                        <div className="w-16 h-20 bg-muted rounded border-2 border-border flex items-center justify-center">
                          <Users className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      {index === 0 && candidate.voteCount > 0 && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-urna-yellow rounded-full flex items-center justify-center">
                          <Trophy className="w-3 h-3 text-urna-dark" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{candidate.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {candidate.number} - {candidate.party}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {candidate.voteCount}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {candidate.percentage.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      
                      <Progress 
                        value={candidate.percentage} 
                        className="h-2"
                      />
                    </div>
                  </div>
                </Card>
              )) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    {isLoading ? 'Carregando resultados...' : 'Nenhum resultado encontrado'}
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* Votos Especiais */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Votos Especiais</h2>
            
            <div className="space-y-4">
              {/* Votos Brancos */}
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-blue-100 rounded border-2 border-blue-300 flex items-center justify-center">
                    <FileX className="w-8 h-8 text-blue-500" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">Voto em Branco</h3>
                        <p className="text-sm text-muted-foreground">0000</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {results.blankVotes}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {blankPercentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <Progress 
                      value={blankPercentage} 
                      className="h-2"
                    />
                  </div>
                </div>
              </Card>

              {/* Votos Nulos */}
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 bg-red-100 rounded border-2 border-red-300 flex items-center justify-center">
                    <Ban className="w-8 h-8 text-red-500" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">Voto Nulo</h3>
                        <p className="text-sm text-muted-foreground">Números inválidos</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">
                          {nullVotes}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {nullPercentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    
                    <Progress 
                      value={nullPercentage} 
                      className="h-2"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Informações adicionais */}
            <Card className="p-4 mt-6">
              <h3 className="font-semibold mb-3">Informações da Eleição</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Sistema de votação descentralizado</p>
                <p>• Blockchain: {selectedNetwork}</p>
                <p>• Token: BRTV (1 token = 1 voto)</p>
                <p>• Resultados atualizados em tempo real</p>
                <p>• Status: {results.votingInfo.isOpen ? 'Votação Ativa' : 'Votação Encerrada'}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}