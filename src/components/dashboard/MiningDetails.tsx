import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bitcoin, Zap, TrendingUp, Activity } from "lucide-react";

interface MiningDetailsProps {
  miningSpeed: number;
  todayMined: number;
  runningPlans: number;
  totalBalance: number;
  minWithdraw: number;
  currency: string;
}

export function MiningDetails({
  miningSpeed,
  todayMined,
  runningPlans,
  totalBalance,
  minWithdraw,
  currency
}: MiningDetailsProps) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Currency Mining Details</h3>
        <Tabs defaultValue="BTC" className="w-auto">
          <TabsList>
            <TabsTrigger value="BTC">BTC</TabsTrigger>
            <TabsTrigger value="ETH">ETH</TabsTrigger>
            <TabsTrigger value="RVN">RVN</TabsTrigger>
            <TabsTrigger value="STX">STX</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="flex items-center gap-3">
          <Zap className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Mining speed</p>
            <p className="text-2xl font-bold">{miningSpeed.toLocaleString()} H/s</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Today Mined</p>
            <p className="text-2xl font-bold">{todayMined.toFixed(10)} {currency}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Running plans</p>
            <p className="text-2xl font-bold">{runningPlans} active plan{runningPlans !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="text-center bg-muted/50 rounded-lg p-6">
        <Bitcoin className="h-12 w-12 text-primary mx-auto mb-4" />
        <p className="text-3xl font-bold mb-2">{totalBalance.toFixed(8)} {currency}</p>
        <p className="text-sm text-muted-foreground mb-6">Min Withdraw: {minWithdraw} {currency}</p>
        <Button size="lg" className="gap-2">
          <Bitcoin className="h-5 w-5" />
          Withdraw {currency}
        </Button>
      </div>
    </Card>
  );
}