import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Server, FlaskConical, Diamond } from 'lucide-react';
import { NETWORKS, NetworkConfig } from '@/hooks/useWeb3';

interface NetworkSelectorProps {
  selectedNetwork: string;
  onNetworkSelect: (networkKey: string) => void;
  isConnected: boolean;
}

const networkIcons = {
  server: Server,
  'flask-conical': FlaskConical,
  diamond: Diamond,
};

export function NetworkSelector({ selectedNetwork, onNetworkSelect, isConnected }: NetworkSelectorProps) {
  const currentNetwork = NETWORKS[selectedNetwork];
  const IconComponent = networkIcons[currentNetwork.icon as keyof typeof networkIcons] || Server;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 min-w-[140px]"
          disabled={isConnected}
        >
          <IconComponent className="w-4 h-4" />
          <span className="truncate">{currentNetwork.chainName}</span>
          <ChevronDown className="w-4 h-4 ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-popover border border-border shadow-lg z-50"
      >
        {Object.entries(NETWORKS).map(([key, network]) => {
          const Icon = networkIcons[network.icon as keyof typeof networkIcons] || Server;
          
          return (
            <DropdownMenuItem
              key={key}
              onClick={() => onNetworkSelect(key)}
              className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-accent focus:bg-accent"
            >
              <Icon className="w-4 h-4" />
              <div className="flex flex-col">
                <span className="font-medium">{network.chainName}</span>
                <span className="text-xs text-muted-foreground">
                  {key === 'localhost' ? 'Desenvolvimento' : 
                   key === 'sepolia' ? 'Rede de Teste' : 'Rede Principal'}
                </span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}