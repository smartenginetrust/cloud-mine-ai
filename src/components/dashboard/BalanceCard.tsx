import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bitcoin, Wallet } from "lucide-react";

interface BalanceCardProps {
  currency: string;
  balance: number;
  icon: React.ReactNode;
  currentPrice: number;
  activePlans?: number;
  showBuyButton?: boolean;
}

export function BalanceCard({ 
  currency, 
  balance, 
  icon, 
  currentPrice, 
  activePlans = 0,
  showBuyButton = false 
}: BalanceCardProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-card to-muted/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <p className="text-sm text-muted-foreground">{currency} Balance</p>
            <p className="text-2xl font-bold">{balance.toFixed(8)} {currency}</p>
          </div>
        </div>
      </div>
      
      {activePlans > 0 && (
        <p className="text-sm text-primary mb-2">
          {activePlans} active plan{activePlans > 1 ? 's' : ''} • {activePlans} device{activePlans > 1 ? 's' : ''}
        </p>
      )}
      
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">Current Price</p>
        <p className="text-lg font-semibold">$ {currentPrice.toLocaleString()}</p>
      </div>
      
      <Button 
        className="w-full"
        variant={showBuyButton ? "default" : "outline"}
      >
        {showBuyButton ? "Buy Mining plan" : "Withdraw"}
      </Button>
    </Card>
  );
}