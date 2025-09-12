import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wallet, Coins } from 'lucide-react';

interface WalletConnectionProps {
  isConnected: boolean;
  account: string | null;
  brtv_balance: number;
  isLoading: boolean;
  connectWallet: () => void | Promise<void>;
}

export function WalletConnection({ isConnected, account, brtv_balance, isLoading, connectWallet }: WalletConnectionProps) {

  if (!isConnected) {
    return (
      <Card className="p-6 bg-gradient-to-r from-urna-green to-urna-yellow text-white">
        <div className="text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Conecte sua Carteira</h3>
          <p className="mb-4 opacity-90">
            Conecte sua carteira MetaMask para participar da votação
          </p>
          <Button 
            onClick={connectWallet}
            disabled={isLoading}
            className="bg-white text-urna-dark hover:bg-gray-100"
          >
            {isLoading ? 'Conectando...' : 'Conectar MetaMask'}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-r from-urna-green to-urna-yellow text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wallet className="w-6 h-6" />
          <div>
            <div className="font-semibold">Carteira Conectada</div>
            <div className="text-sm opacity-90">
              {account?.slice(0, 6)}...{account?.slice(-4)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5" />
          <span className="font-bold">{brtv_balance} BRTV</span>
        </div>
      </div>
    </Card>
  );
}