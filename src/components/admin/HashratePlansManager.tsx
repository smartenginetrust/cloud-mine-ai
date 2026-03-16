import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Pencil, X, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HashratePlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  hashrate: number;
  daily_profit: number;
  plan_type: string;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  created_at: string;
}

const emptyPlan = {
  name: "",
  description: "",
  price: "",
  hashrate: "",
  daily_profit: "",
  plan_type: "BTC",
  features: "",
  is_popular: false,
  is_active: true,
};

export function HashratePlansManager() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<HashratePlan[]>([]);
  const [newPlan, setNewPlan] = useState(emptyPlan);
  const [editingPlan, setEditingPlan] = useState<HashratePlan | null>(null);
  const [editForm, setEditForm] = useState(emptyPlan);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    const { data } = await supabase
      .from("hashrate_plans" as any)
      .select("*")
      .order("price", { ascending: true });
    if (data) setPlans(data as any);
  };

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const featuresArray = newPlan.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      const { error } = await supabase.from("hashrate_plans" as any).insert({
        name: newPlan.name,
        description: newPlan.description || null,
        price: parseFloat(newPlan.price),
        hashrate: parseFloat(newPlan.hashrate),
        daily_profit: parseFloat(newPlan.daily_profit),
        plan_type: newPlan.plan_type,
        features: featuresArray,
        is_popular: newPlan.is_popular,
        is_active: newPlan.is_active,
      } as any);

      if (error) throw error;

      toast({ title: "Başarılı", description: "Plan eklendi" });
      setNewPlan(emptyPlan);
      await loadPlans();
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    }
  };

  const handleEditClick = (plan: HashratePlan) => {
    setEditingPlan(plan);
    setEditForm({
      name: plan.name,
      description: plan.description || "",
      price: String(plan.price),
      hashrate: String(plan.hashrate),
      daily_profit: String(plan.daily_profit),
      plan_type: plan.plan_type,
      features: plan.features.join("\n"),
      is_popular: plan.is_popular,
      is_active: plan.is_active,
    });
    setDialogOpen(true);
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      const featuresArray = editForm.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean);

      const { error } = await supabase
        .from("hashrate_plans" as any)
        .update({
          name: editForm.name,
          description: editForm.description || null,
          price: parseFloat(editForm.price),
          hashrate: parseFloat(editForm.hashrate),
          daily_profit: parseFloat(editForm.daily_profit),
          plan_type: editForm.plan_type,
          features: featuresArray,
          is_popular: editForm.is_popular,
          is_active: editForm.is_active,
        } as any)
        .eq("id", editingPlan.id);

      if (error) throw error;

      toast({ title: "Başarılı", description: "Plan güncellendi" });
      setDialogOpen(false);
      setEditingPlan(null);
      await loadPlans();
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      const { error } = await supabase.from("hashrate_plans" as any).delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Başarılı", description: "Plan silindi" });
      await loadPlans();
    } catch (error: any) {
      toast({ title: "Hata", description: error.message, variant: "destructive" });
    }
  };

  const PlanForm = ({
    values,
    onChange,
    onSubmit,
    submitLabel,
  }: {
    values: typeof emptyPlan;
    onChange: (v: typeof emptyPlan) => void;
    onSubmit: (e: React.FormEvent) => void;
    submitLabel: string;
  }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Plan Adı</Label>
          <Input value={values.name} onChange={(e) => onChange({ ...values, name: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Plan Tipi</Label>
          <Input value={values.plan_type} onChange={(e) => onChange({ ...values, plan_type: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Fiyat ($)</Label>
          <Input type="number" step="0.01" value={values.price} onChange={(e) => onChange({ ...values, price: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Hashrate (TH/s)</Label>
          <Input type="number" step="0.01" value={values.hashrate} onChange={(e) => onChange({ ...values, hashrate: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label>Günlük Kazanç</Label>
          <Input type="number" step="0.00000001" value={values.daily_profit} onChange={(e) => onChange({ ...values, daily_profit: e.target.value })} required />
        </div>
        <div className="space-y-2 flex items-end gap-6">
          <div className="flex items-center gap-2">
            <Switch checked={values.is_popular} onCheckedChange={(v) => onChange({ ...values, is_popular: v })} />
            <Label>Popüler</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={values.is_active} onCheckedChange={(v) => onChange({ ...values, is_active: v })} />
            <Label>Aktif</Label>
          </div>
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Açıklama</Label>
          <Input value={values.description} onChange={(e) => onChange({ ...values, description: e.target.value })} />
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Özellikler (her satıra bir özellik)</Label>
          <Textarea rows={4} value={values.features} onChange={(e) => onChange({ ...values, features: e.target.value })} />
        </div>
      </div>
      <Button type="submit" className="w-full">
        <Save className="h-4 w-4 mr-2" />
        {submitLabel}
      </Button>
    </form>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Yeni Plan Ekle
          </CardTitle>
          <CardDescription>Yeni bir hashrate planı oluşturun</CardDescription>
        </CardHeader>
        <CardContent>
          <PlanForm values={newPlan} onChange={setNewPlan} onSubmit={handleAddPlan} submitLabel="Plan Ekle" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mevcut Planlar</CardTitle>
          <CardDescription>Tüm hashrate planlarını yönetin</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Fiyat</TableHead>
                <TableHead>Hashrate</TableHead>
                <TableHead>Günlük Kazanç</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">
                    {plan.name}
                    {plan.is_popular && (
                      <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Popüler</span>
                    )}
                  </TableCell>
                  <TableCell>{plan.plan_type}</TableCell>
                  <TableCell>${plan.price}</TableCell>
                  <TableCell>{Number(plan.hashrate).toLocaleString()} TH/s</TableCell>
                  <TableCell>{Number(plan.daily_profit).toFixed(8)}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${plan.is_active ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"}`}>
                      {plan.is_active ? "Aktif" : "Pasif"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(plan)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeletePlan(plan.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Planı Düzenle</DialogTitle>
            <DialogDescription>Plan bilgilerini güncelleyin</DialogDescription>
          </DialogHeader>
          <PlanForm values={editForm} onChange={setEditForm} onSubmit={handleUpdatePlan} submitLabel="Güncelle" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
