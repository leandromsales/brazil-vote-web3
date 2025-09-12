import { Button } from '@/components/ui/button';

interface UrnaKeypadProps {
  onNumberClick: (number: string) => void;
  onConfirm: () => void;
  onCorrect: () => void;
  onBlank: () => void;
  isVoting: boolean;
  canConfirm: boolean;
}

export function UrnaKeypad({ 
  onNumberClick, 
  onConfirm, 
  onCorrect, 
  onBlank, 
  isVoting,
  canConfirm 
}: UrnaKeypadProps) {
  const numbers = [
    ['1', '2', '3'],
    ['4', '5', '6'], 
    ['7', '8', '9'],
    ['', '0', '']
  ];

  return (
    <div className="p-6 bg-gradient-to-b from-urna-button to-urna-button-hover rounded-lg shadow-[var(--shadow-button)]">
      {/* Teclado numérico */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {numbers.flat().map((num, index) => (
          <Button
            key={index}
            onClick={() => num && onNumberClick(num)}
            disabled={!num || isVoting}
            variant="outline"
            size="lg"
            className={`h-16 text-2xl font-bold ${
              num 
                ? 'bg-white hover:bg-gray-100 text-black border-2 border-gray-300 shadow-md' 
                : 'invisible'
            }`}
          >
            {num}
          </Button>
        ))}
      </div>

      {/* Botões de ação */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          onClick={onBlank}
          disabled={isVoting}
          className="h-16 text-lg font-bold bg-white hover:bg-gray-100 text-black border-2 border-gray-300"
        >
          BRANCO
        </Button>
        
        <Button
          onClick={onCorrect}
          disabled={isVoting}
          className="h-16 text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-400"
        >
          CORRIGE
        </Button>
        
        <Button
          onClick={onConfirm}
          disabled={!canConfirm || isVoting}
          className="h-16 text-lg font-bold bg-green-600 hover:bg-green-700 text-white border-2 border-green-500 shadow-lg"
        >
          {isVoting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              VOTANDO...
            </div>
          ) : (
            'CONFIRMA'
          )}
        </Button>
      </div>
    </div>
  );
}