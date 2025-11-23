import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Box, Award } from "lucide-react";

interface Block {
  id: string;
  number: number;
  hash: string;
  miner: string;
  reward: number;
  transactions: number;
  timestamp: Date;
  size: number; // in KB
}

export function RecentBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [blockNumber, setBlockNumber] = useState(850000);

  const generateRandomHash = () => {
    return '0x' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };

  const generateBlock = (number: number): Block => {
    return {
      id: Math.random().toString(36).substring(7),
      number,
      hash: generateRandomHash(),
      miner: '0x' + Array.from({ length: 40 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join(''),
      reward: 6.25 + Math.random() * 0.5, // BTC block reward with fees
      transactions: Math.floor(Math.random() * 2000) + 1000,
      timestamp: new Date(),
      size: Math.floor(Math.random() * 500) + 800 // KB
    };
  };

  useEffect(() => {
    // Initialize with some blocks
    const initialBlocks = Array.from({ length: 5 }, (_, i) => 
      generateBlock(blockNumber - i)
    );
    setBlocks(initialBlocks);

    // Add new block every 8-12 seconds (simulating ~10min block time in faster demo mode)
    const interval = setInterval(() => {
      setBlockNumber(prev => {
        const newBlockNum = prev + 1;
        setBlocks(prevBlocks => {
          const newBlock = generateBlock(newBlockNum);
          return [newBlock, ...prevBlocks].slice(0, 8); // Keep only latest 8
        });
        return newBlockNum;
      });
    }, Math.random() * 4000 + 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Box className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Recent Blocks</h3>
        <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live
        </span>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {blocks.map((block) => (
          <div 
            key={block.id}
            className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-all animate-in slide-in-from-top duration-300"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Box className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg">Block #{block.number.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {block.timestamp.toLocaleTimeString()} • {block.timestamp.toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-green-500">
                <Award className="h-4 w-4" />
                <span className="font-semibold">{block.reward.toFixed(8)} BTC</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Hash:</span>
                <span className="font-mono text-xs">
                  {block.hash.substring(0, 16)}...{block.hash.substring(56)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Miner:</span>
                <span className="font-mono text-xs">
                  {block.miner.substring(0, 10)}...{block.miner.substring(36)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-muted-foreground">{block.transactions.toLocaleString()} transactions</span>
                <span className="text-muted-foreground">{block.size} KB</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
