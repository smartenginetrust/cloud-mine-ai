import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Wallet, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const withdrawSchema = z.object({
  currency: z.string().min(1, "Please select a currency"),
  amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be greater than 0"),
  wallet_address: z.string().trim().min(10, "Please enter a valid wallet address").max(100),
});

type WithdrawFormValues = z.infer<typeof withdrawSchema>;

const MIN_WITHDRAW = {
  BTC: 0.0001,
  ETH: 0.001,
  RVN: 10,
  STX: 5,
};

export default function Withdraw() {
  const [balances, setBalances] = useState({ btc: 0, eth: 0, rvn: 0, stx: 0 });
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      currency: "BTC",
      amount: "",
      wallet_address: "",
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch balances
      const { data: balanceData, error: balanceError } = await supabase
        .from('balances')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (balanceError) throw balanceError;

      if (balanceData) {
        setBalances({
          btc: parseFloat(String(balanceData.btc_balance || 0)),
          eth: parseFloat(String(balanceData.eth_balance || 0)),
          rvn: parseFloat(String(balanceData.rvn_balance || 0)),
          stx: parseFloat(String(balanceData.stx_balance || 0)),
        });
      }

      // Fetch withdrawal history
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (withdrawalsError) throw withdrawalsError;
      setWithdrawals(withdrawalsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (values: WithdrawFormValues) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const amount = parseFloat(values.amount);
    const currency = values.currency as keyof typeof MIN_WITHDRAW;
    const balance = balances[currency.toLowerCase() as keyof typeof balances];
    const minWithdraw = MIN_WITHDRAW[currency];

    if (amount < minWithdraw) {
      toast({
        title: "Amount Too Low",
        description: `Minimum withdrawal for ${currency} is ${minWithdraw}`,
        variant: "destructive",
      });
      return;
    }

    if (amount > balance) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${currency} to withdraw`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          amount,
          currency,
          wallet_address: values.wallet_address,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request has been submitted for processing",
      });

      form.reset();
      fetchData();
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      completed: "default",
      failed: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status.toUpperCase()}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Withdraw</h1>
          <p className="text-muted-foreground">Transfer your earnings to your wallet</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Withdraw Form */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Wallet className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Withdraw Funds</h2>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BTC">BTC (Bitcoin)</SelectItem>
                          <SelectItem value="ETH">ETH (Ethereum)</SelectItem>
                          <SelectItem value="RVN">RVN (Ravencoin)</SelectItem>
                          <SelectItem value="STX">STX (Stacks)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="wallet_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your wallet address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Processing..." : "Submit Withdrawal"}
                </Button>
              </form>
            </Form>
          </Card>

          {/* Balance Overview */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Available Balance</h3>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">BTC</span>
                  <span className="text-lg font-bold">{balances.btc.toFixed(8)}</span>
                </div>
                <span className="text-xs text-muted-foreground">Min: {MIN_WITHDRAW.BTC} BTC</span>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">ETH</span>
                  <span className="text-lg font-bold">{balances.eth.toFixed(8)}</span>
                </div>
                <span className="text-xs text-muted-foreground">Min: {MIN_WITHDRAW.ETH} ETH</span>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">RVN</span>
                  <span className="text-lg font-bold">{balances.rvn.toFixed(2)}</span>
                </div>
                <span className="text-xs text-muted-foreground">Min: {MIN_WITHDRAW.RVN} RVN</span>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">STX</span>
                  <span className="text-lg font-bold">{balances.stx.toFixed(2)}</span>
                </div>
                <span className="text-xs text-muted-foreground">Min: {MIN_WITHDRAW.STX} STX</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Withdrawal History */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Withdrawal History</h2>
          {withdrawals.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No withdrawals yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(withdrawal.status)}
                    <div>
                      <div className="font-semibold">
                        {parseFloat(withdrawal.amount).toFixed(8)} {withdrawal.currency}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(withdrawal.created_at).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono mt-1">
                        {withdrawal.wallet_address.substring(0, 20)}...
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(withdrawal.status)}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
