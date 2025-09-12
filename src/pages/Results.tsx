import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { candidates, specialCandidates } from '@/data/candidates';
import { voteStore } from '@/store/voteStore';
import { ArrowLeft, Trophy, Users, FileX, Ban } from 'lucide-react';

export default function Results() {
  const votes = voteStore.getVotes();
  const totalVotes = voteStore.getTotalVotes();

  // Ordenar candidatos por número de votos
  const sortedCandidates = candidates
    .map(candidate => ({
      ...candidate,
      votes: votes[candidate.number] || 0,
      percentage: totalVotes > 0 ? ((votes[candidate.number] || 0) / totalVotes) * 100 : 0
    }))
    .sort((a, b) => b.votes - a.votes);

  const blankVotes = votes['0000'] || 0;
  const nullVotes = votes['9999'] || 0;
  const blankPercentage = totalVotes > 0 ? (blankVotes / totalVotes) * 100 : 0;
  const nullPercentage = totalVotes > 0 ? (nullVotes / totalVotes) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-primary">
              Resultados da Eleição
            </h1>
            <p className="text-muted-foreground">
              Apuração em tempo real - Sistema Web 3.0
            </p>
          </div>
        </div>

        {/* Estatísticas gerais */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{totalVotes}</div>
                <div className="text-sm text-muted-foreground">Total de Votos</div>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-urna-yellow" />
              <div>
                <div className="text-2xl font-bold">
                  {sortedCandidates[0]?.votes || 0}
                </div>
                <div className="text-sm text-muted-foreground">Mais Votado</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <FileX className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{blankVotes}</div>
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
              {sortedCandidates.map((candidate, index) => (
                <Card key={candidate.id} className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img 
                        src={candidate.photo}
                        alt={candidate.name}
                        className="w-16 h-20 object-cover rounded border-2 border-border"
                      />
                      {index === 0 && candidate.votes > 0 && (
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
                            {candidate.votes}
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
              ))}
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
                          {blankVotes}
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
                        <p className="text-sm text-muted-foreground">9999</p>
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
                <p>• Blockchain: Ethereum (Simulado)</p>
                <p>• Token: BRTV (1 token = 1 voto)</p>
                <p>• Resultados atualizados em tempo real</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}