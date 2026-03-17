import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export function WithdrawalsManager() {
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    const { data, error } = await supabase
      .from("withdrawals")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setWithdrawals(data || []);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("withdrawals")
        .update({ status, processed_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Success", description: `Withdrawal ${status}` });
      fetchWithdrawals();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive"; icon: React.ReactNode }> = {
      pending: { variant: "secondary", icon: <Clock className="h-3 w-3" /> },
      completed: { variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
      failed: { variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
    };
    const c = config[status] || config.pending;
    return (
      <Badge variant={c.variant} className="flex items-center gap-1 w-fit">
        {c.icon} {status.toUpperCase()}
      </Badge>
    );
  };

  if (loading) return <p className="text-center py-8 text-muted-foreground">Loading withdrawals...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdrawal Management</CardTitle>
        <CardDescription>Review and process user withdrawal requests</CardDescription>
      </CardHeader>
      <CardContent>
        {withdrawals.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No withdrawals found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Wallet Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="text-xs font-mono">{w.user_id?.substring(0, 8)}...</TableCell>
                  <TableCell className="font-semibold">{parseFloat(w.amount).toFixed(8)}</TableCell>
                  <TableCell>{w.currency}</TableCell>
                  <TableCell className="text-xs font-mono max-w-[150px] truncate">{w.wallet_address}</TableCell>
                  <TableCell>{getStatusBadge(w.status)}</TableCell>
                  <TableCell className="text-xs">{new Date(w.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {w.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updateStatus(w.id, "completed")}>
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => updateStatus(w.id, "failed")}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
