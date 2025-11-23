import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft, Hash } from "lucide-react";

interface Transaction {
  id: string;
  hash: string;
  amount: number;
  currency: string;
  type: 'sent' | 'received';
  timestamp: Date;
  status: 'confirmed' | 'pending';
}

export function LatestTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const generateRandomHash = () => {
    return '0x' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };

  const generateTransaction = (): Transaction => {
    const currencies = ['BTC', 'ETH', 'RVN', 'STX'];
    const types: ('sent' | 'received')[] = ['sent', 'received'];
    
    return {
      id: Math.random().toString(36).substring(7),
      hash: generateRandomHash(),
      amount: Math.random() * 10,
      currency: currencies[Math.floor(Math.random() * currencies.length)],
      type: types[Math.floor(Math.random() * types.length)],
      timestamp: new Date(),
      status: Math.random() > 0.2 ? 'confirmed' : 'pending'
    };
  };

  useEffect(() => {
    // Initialize with some transactions
    const initialTransactions = Array.from({ length: 5 }, generateTransaction);
    setTransactions(initialTransactions);

    // Add new transaction every 5-10 seconds
    const interval = setInterval(() => {
      setTransactions(prev => {
        const newTransaction = generateTransaction();
        return [newTransaction, ...prev].slice(0, 10); // Keep only latest 10
      });
    }, Math.random() * 5000 + 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Hash className="h-5 w-5 text-primary" />
        <h3 className="text-xl font-semibold">Latest Transactions</h3>
        <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
          <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Live
        </span>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {transactions.map((tx) => (
          <div 
            key={tx.id}
            className="flex items-center gap-4 p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-all animate-in slide-in-from-top duration-300"
          >
            <div className={`p-2 rounded-full ${
              tx.type === 'received' 
                ? 'bg-green-500/10 text-green-500' 
                : 'bg-orange-500/10 text-orange-500'
            }`}>
              {tx.type === 'received' ? (
                <ArrowDownLeft className="h-4 w-4" />
              ) : (
                <ArrowUpRight className="h-4 w-4" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm font-medium">
                  {tx.hash.substring(0, 10)}...{tx.hash.substring(58)}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  tx.status === 'confirmed' 
                    ? 'bg-green-500/10 text-green-500' 
                    : 'bg-yellow-500/10 text-yellow-500'
                }`}>
                  {tx.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {tx.timestamp.toLocaleTimeString()} • {tx.timestamp.toLocaleDateString()}
              </p>
            </div>

            <div className="text-right">
              <p className={`font-semibold ${
                tx.type === 'received' ? 'text-green-500' : 'text-foreground'
              }`}>
                {tx.type === 'received' ? '+' : '-'}{tx.amount.toFixed(8)} {tx.currency}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
