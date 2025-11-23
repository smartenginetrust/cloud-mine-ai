import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, AlertCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  hash: string;
  amount: number;
  currency: string;
  type: 'sent' | 'received';
  timestamp: Date;
  status: 'confirmed' | 'pending';
  blockNumber?: number;
  confirmations?: number;
  gasUsed?: number;
  gasFee?: number;
  from?: string;
  to?: string;
}

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetailsModal({ 
  transaction, 
  open, 
  onOpenChange 
}: TransactionDetailsModalProps) {
  const { toast } = useToast();

  if (!transaction) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const DetailRow = ({ label, value, copyable = false }: { 
    label: string; 
    value: string | number; 
    copyable?: boolean 
  }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium font-mono">{value}</span>
        {copyable && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => copyToClipboard(value.toString(), label)}
          >
            <Copy className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );

  const statusIcon = transaction.status === 'confirmed' ? (
    <CheckCircle2 className="h-5 w-5 text-green-500" />
  ) : (
    <AlertCircle className="h-5 w-5 text-yellow-500" />
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${
              transaction.type === 'received' 
                ? 'bg-green-500/10 text-green-500' 
                : 'bg-orange-500/10 text-orange-500'
            }`}>
              {transaction.type === 'received' ? (
                <ArrowDownLeft className="h-5 w-5" />
              ) : (
                <ArrowUpRight className="h-5 w-5" />
              )}
            </div>
            Transaction Details
          </DialogTitle>
          <DialogDescription>
            Complete information about this transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Status Banner */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              {statusIcon}
              <div>
                <p className="font-semibold">
                  {transaction.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {transaction.status === 'confirmed' 
                    ? `${transaction.confirmations || 0} confirmations` 
                    : 'Waiting for confirmation'}
                </p>
              </div>
            </div>
            <Badge variant={transaction.status === 'confirmed' ? 'default' : 'secondary'}>
              {transaction.type === 'received' ? 'Received' : 'Sent'}
            </Badge>
          </div>

          {/* Amount */}
          <div className="p-6 rounded-lg border-2 border-primary/20 bg-primary/5 text-center">
            <p className="text-sm text-muted-foreground mb-2">Amount</p>
            <p className={`text-3xl font-bold ${
              transaction.type === 'received' ? 'text-green-500' : 'text-foreground'
            }`}>
              {transaction.type === 'received' ? '+' : '-'}
              {transaction.amount.toFixed(8)} {transaction.currency}
            </p>
          </div>

          <Separator />

          {/* Transaction Info */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Transaction Information
            </h4>
            
            <div className="space-y-1">
              <DetailRow 
                label="Transaction Hash" 
                value={transaction.hash} 
                copyable 
              />
              <Separator />
              
              <DetailRow 
                label="Timestamp" 
                value={`${transaction.timestamp.toLocaleString()}`}
              />
              <Separator />
              
              {transaction.blockNumber && (
                <>
                  <DetailRow 
                    label="Block Number" 
                    value={transaction.blockNumber.toLocaleString()}
                  />
                  <Separator />
                </>
              )}
              
              {transaction.from && (
                <>
                  <DetailRow 
                    label="From" 
                    value={transaction.from}
                    copyable
                  />
                  <Separator />
                </>
              )}
              
              {transaction.to && (
                <>
                  <DetailRow 
                    label="To" 
                    value={transaction.to}
                    copyable
                  />
                  <Separator />
                </>
              )}
              
              {transaction.gasUsed && (
                <>
                  <DetailRow 
                    label="Gas Used" 
                    value={transaction.gasUsed.toLocaleString()}
                  />
                  <Separator />
                </>
              )}
              
              {transaction.gasFee && (
                <>
                  <DetailRow 
                    label="Gas Fee" 
                    value={`${transaction.gasFee.toFixed(8)} ${transaction.currency}`}
                  />
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
