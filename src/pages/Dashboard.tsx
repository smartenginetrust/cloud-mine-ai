import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { MiningDetails } from "@/components/dashboard/MiningDetails";
import { LatestTransactions } from "@/components/dashboard/LatestTransactions";
import { RecentBlocks } from "@/components/dashboard/RecentBlocks";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Bitcoin, Server } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [balances, setBalances] = useState({
    btc: 0,
    eth: 0,
    rvn: 0,
    stx: 0
  });
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch balances
      const { data: balanceData, error: balanceError } = await supabase
        .from('balances')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (balanceError) throw balanceError;

      // Create balance record if it doesn't exist
      let balance = balanceData;
      if (!balance) {
        const { data: newBalance, error: createError } = await supabase
          .from('balances')
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (createError) throw createError;
        balance = newBalance;
      }
      
      if (balance) {
        setBalances({
          btc: parseFloat(String(balance.btc_balance || 0)),
          eth: parseFloat(String(balance.eth_balance || 0)),
          rvn: parseFloat(String(balance.rvn_balance || 0)),
          stx: parseFloat(String(balance.stx_balance || 0))
        });
      }

      // Fetch subscriptions
      const { data: subsData, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (subsError) throw subsError;
      setSubscriptions(subsData || []);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const activeBTCPlans = subscriptions.filter(s => s.plan_type === 'BTC').length;
  const activeETHPlans = subscriptions.filter(s => s.plan_type === 'ETH').length;
  const totalHashrate = subscriptions.reduce((sum, s) => sum + parseFloat(s.hashrate || 0), 0);
  const todayMined = subscriptions.reduce((sum, s) => sum + parseFloat(s.daily_profit || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back, User 👋</h1>
          <p className="text-muted-foreground">Here's your progress</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Balance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <BalanceCard
              currency="BTC"
              balance={balances.btc}
              icon={<Bitcoin className="h-10 w-10 text-orange-500" />}
              currentPrice={47990.00}
              activePlans={activeBTCPlans}
              showBuyButton={activeBTCPlans === 0}
            />
            <BalanceCard
              currency="ETH"
              balance={balances.eth}
              icon={<Bitcoin className="h-10 w-10 text-blue-500" />}
              currentPrice={47990.00}
              activePlans={activeETHPlans}
              showBuyButton={activeETHPlans === 0}
            />
            <BalanceCard
              currency="RVN"
              balance={balances.rvn}
              icon={<Bitcoin className="h-10 w-10 text-purple-500" />}
              currentPrice={0.08826}
            />
            <BalanceCard
              currency="STX"
              balance={balances.stx}
              icon={<Bitcoin className="h-10 w-10 text-indigo-500" />}
              currentPrice={2.13}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MiningDetails
              miningSpeed={totalHashrate}
              todayMined={todayMined}
              runningPlans={subscriptions.length}
              totalBalance={balances.btc}
              minWithdraw={0.0001}
              currency="BTC"
            />
          </div>
          
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20">
            <Server className="h-16 w-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-center mb-2">
              Boost Your Hashrate With Private Mining Devices
            </h3>
            <p className="text-center text-primary font-semibold mb-4">
              Up to 10 TH/s
            </p>
            <Button className="w-full" size="lg">
              Learn More →
            </Button>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LatestTransactions />
          <RecentBlocks />
        </div>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Daily Gains</h3>
          <div className="flex gap-2 mb-4">
            <Button variant="outline" size="sm">BTC</Button>
            <Button variant="outline" size="sm">ETH</Button>
            <Button variant="outline" size="sm">RVN</Button>
            <Button variant="outline" size="sm">STX</Button>
          </div>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Chart placeholder - Daily gains over last 7 days
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}