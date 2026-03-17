import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowDownToLine, Clock, CheckCircle2, XCircle, Copy } from "lucide-react";

const depositSchema = z.object({
  currency: z.string().min(1, "Please select a currency"),
  amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be greater than 0"),
  transaction_hash: z.string().min(5, "Please enter the transaction hash"),
});

type DepositFormValues = z.infer<typeof depositSchema>;

const WALLET_ADDRESSES: Record<string, string> = {
  BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  ETH: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
  USDT: "TN2Y5sPDfDZVKtS7bG2oXTEAfmSAkLLrfN",
};

export default function Deposit() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const referenceType = searchParams.get("type"); // 'plan' or 'device'
  const referenceId = searchParams.get("id");
  const referenceName = searchParams.get("name");
  const referencePrice = searchParams.get("price");

  const form = useForm<DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      currency: "BTC",
      amount: referencePrice || "",
      transaction_hash: "",
    },
  });

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('deposits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) setDeposits(data || []);
  };

  const onSubmit = async (values: DepositFormValues) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          amount: parseFloat(values.amount),
          currency: values.currency,
          transaction_hash: values.transaction_hash,
          reference_type: referenceType || null,
          reference_id: referenceId || null,
          reference_name: referenceName || null,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: "Deposit Submitted!",
        description: "Your deposit is being reviewed. It will be confirmed shortly.",
      });

      form.reset({ currency: "BTC", amount: "", transaction_hash: "" });
      fetchDeposits();
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

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({ title: "Copied!", description: "Wallet address copied to clipboard" });
  };

  const selectedCurrency = form.watch("currency");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'rejected': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      confirmed: "default",
      rejected: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status.toUpperCase()}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Deposit</h1>
          <p className="text-muted-foreground">Fund your account to activate plans or purchase devices</p>
        </div>

        {/* Purchase Context Banner */}
        {referenceType && referenceName && (
          <Card className="p-4 border-primary/50 bg-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {referenceType === 'plan' ? 'Activating Plan' : 'Purchasing Device'}
                </p>
                <p className="text-lg font-bold">{referenceName}</p>
              </div>
              {referencePrice && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Required Amount</p>
                  <p className="text-2xl font-bold gradient-text">${referencePrice}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Deposit Form */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <ArrowDownToLine className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Make a Deposit</h2>
            </div>

            {/* Wallet Address */}
            {selectedCurrency && WALLET_ADDRESSES[selectedCurrency] && (
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Send {selectedCurrency} to this address:
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-xs sm:text-sm font-mono bg-background p-2 rounded flex-1 break-all">
                    {WALLET_ADDRESSES[selectedCurrency]}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyAddress(WALLET_ADDRESSES[selectedCurrency])}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

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
                          <SelectItem value="USDT">USDT (Tether)</SelectItem>
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
                      <FormLabel>Amount (USD)</FormLabel>
                      <FormControl>
                        <Input type="number" step="any" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="transaction_hash"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction Hash / TX ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your transaction hash after sending" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Deposit"}
                </Button>
              </form>
            </Form>
          </Card>

          {/* Instructions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">How to Deposit</h3>
            <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
              <li>Select your preferred cryptocurrency</li>
              <li>Copy the wallet address shown</li>
              <li>Send the required amount from your wallet</li>
              <li>Paste the transaction hash/TX ID</li>
              <li>Submit and wait for confirmation</li>
            </ol>
            <div className="mt-6 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                ⏱ Deposits are typically confirmed within 10-30 minutes. Your plan or device will be activated automatically after confirmation.
              </p>
            </div>
          </Card>
        </div>

        {/* Deposit History */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Deposit History</h2>
          {deposits.length === 0 ? (
            <div className="text-center py-12">
              <ArrowDownToLine className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No deposits yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deposits.map((deposit) => (
                <div key={deposit.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(deposit.status)}
                    <div>
                      <div className="font-semibold">
                        ${parseFloat(deposit.amount).toFixed(2)} ({deposit.currency})
                      </div>
                      {deposit.reference_name && (
                        <div className="text-sm text-primary">
                          {deposit.reference_type === 'plan' ? '📋 Plan: ' : '🖥️ Device: '}
                          {deposit.reference_name}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {new Date(deposit.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(deposit.status)}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
