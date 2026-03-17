import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

export function DepositsManager() {
  const { toast } = useToast();
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    const { data, error } = await supabase
      .from("deposits")
      .select("*, profiles!inner(full_name)")
      .order("created_at", { ascending: false });

    if (error) {
      // Fallback without join if profiles relation fails
      const { data: fallback } = await supabase
        .from("deposits")
        .select("*")
        .order("created_at", { ascending: false });
      setDeposits(fallback || []);
    } else {
      setDeposits(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("deposits")
        .update({ status, processed_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Success", description: `Deposit ${status}` });
      fetchDeposits();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive"; icon: React.ReactNode }> = {
      pending: { variant: "secondary", icon: <Clock className="h-3 w-3" /> },
      confirmed: { variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
      rejected: { variant: "destructive", icon: <XCircle className="h-3 w-3" /> },
    };
    const c = config[status] || config.pending;
    return (
      <Badge variant={c.variant} className="flex items-center gap-1 w-fit">
        {c.icon} {status.toUpperCase()}
      </Badge>
    );
  };

  if (loading) return <p className="text-center py-8 text-muted-foreground">Loading deposits...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deposit Management</CardTitle>
        <CardDescription>Review and approve/reject user deposits</CardDescription>
      </CardHeader>
      <CardContent>
        {deposits.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No deposits found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>TX Hash</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deposits.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="text-xs font-mono">
                    {(d.profiles as any)?.full_name || d.user_id?.substring(0, 8) + "..."}
                  </TableCell>
                  <TableCell className="font-semibold">${parseFloat(d.amount).toFixed(2)}</TableCell>
                  <TableCell>{d.currency}</TableCell>
                  <TableCell className="text-xs">
                    {d.reference_name ? (
                      <span className="text-primary">{d.reference_type}: {d.reference_name}</span>
                    ) : "-"}
                  </TableCell>
                  <TableCell className="text-xs font-mono max-w-[120px] truncate">
                    {d.transaction_hash || "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(d.status)}</TableCell>
                  <TableCell className="text-xs">{new Date(d.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {d.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updateStatus(d.id, "confirmed")}>
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => updateStatus(d.id, "rejected")}>
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
