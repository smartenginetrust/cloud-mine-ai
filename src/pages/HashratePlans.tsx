import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, Zap } from "lucide-react";

export default function HashratePlans() {
  const [plans, setPlans] = useState<any[]>([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: plansData } = await supabase
        .from('hashrate_plans' as any)
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (plansData) setPlans(plansData as any);

      if (user) {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active');

        if (error) throw error;
        setActiveSubscriptions(data || []);
      }
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

  const handleSelectPlan = async (plan: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to select a plan",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          plan_name: plan.name,
          plan_type: plan.plan_type,
          hashrate: plan.hashrate,
          daily_profit: plan.daily_profit,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `${plan.name} plan activated successfully`,
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Hashrate Plans</h1>
          <p className="text-muted-foreground">Choose a plan to boost your mining power</p>
        </div>

        {/* Active Plans Section */}
        {activeSubscriptions.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Active Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSubscriptions.map((sub) => (
                <Card key={sub.id} className="p-6 border-primary/50">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="default">Active</Badge>
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{sub.plan_name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hashrate:</span>
                      <span className="font-semibold">{parseFloat(sub.hashrate).toLocaleString()} TH/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Daily Profit:</span>
                      <span className="font-semibold">{parseFloat(sub.daily_profit).toFixed(8)} BTC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Profit:</span>
                      <span className="font-semibold">{parseFloat(sub.total_profit).toFixed(8)} BTC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Started:</span>
                      <span className="font-semibold">
                        {new Date(sub.start_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Plans Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card 
                key={plan.id}
                className={`p-8 relative overflow-hidden transition-smooth ${
                  plan.is_popular 
                    ? 'border-primary glow-effect-strong scale-105' 
                    : 'border-border hover:border-primary/50 hover:glow-effect'
                }`}
              >
                {plan.is_popular && (
                  <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 text-xs font-semibold rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold gradient-text">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {(plan.features || []).map((feature: string, featureIndex: number) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  variant={plan.is_popular ? "default" : "outline"} 
                  className="w-full"
                  size="lg"
                  onClick={() => handleSelectPlan(plan)}
                >
                  Activate Plan
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
