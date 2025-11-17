import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Copy, Gift, TrendingUp } from "lucide-react";

export default function Referrals() {
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalEarnings: 0,
    activeReferrals: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Generate referral code from user ID
      const code = 'REF' + user.id.substring(0, 8).toUpperCase();
      setReferralCode(code);

      // Fetch referrals
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (referralsError) throw referralsError;

      const referralsList = referralsData || [];
      setReferrals(referralsList);

      // Calculate stats
      const totalEarnings = referralsList.reduce((sum, ref) => sum + parseFloat(String(ref.reward_amount || 0)), 0);
      const activeReferrals = referralsList.filter(ref => ref.status === 'active').length;

      setStats({
        totalReferrals: referralsList.length,
        totalEarnings,
        activeReferrals,
      });
    } catch (error: any) {
      console.error('Error fetching referral data:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Referral Program</h1>
          <p className="text-muted-foreground">Earn rewards by inviting friends to join</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold">{stats.totalReferrals}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Referrals</p>
                <p className="text-2xl font-bold">{stats.activeReferrals}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <Gift className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">${stats.totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Referral Link Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Your Referral Code</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Share this code with friends:</p>
              <div className="flex gap-2">
                <Input 
                  value={referralCode} 
                  readOnly 
                  className="font-mono text-lg"
                />
                <Button onClick={copyReferralCode} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Or share your referral link:</p>
              <div className="flex gap-2">
                <Input 
                  value={`${window.location.origin}/?ref=${referralCode}`}
                  readOnly 
                  className="font-mono"
                />
                <Button onClick={copyReferralLink} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* How It Works */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Share Your Link</h3>
              <p className="text-sm text-muted-foreground">
                Send your unique referral link to friends and family
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">They Sign Up</h3>
              <p className="text-sm text-muted-foreground">
                Your friends create an account using your referral link
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">Earn Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Get 10% commission on their mining profits
              </p>
            </div>
          </div>
        </Card>

        {/* Referrals List */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Your Referrals</h2>
          {referrals.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No referrals yet. Start sharing your link!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">
                        Referred User
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Code: {referral.referral_code} • Joined {new Date(referral.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-500">
                      +${parseFloat(referral.reward_amount).toFixed(2)}
                    </div>
                    <Badge variant={referral.status === 'active' ? 'default' : 'secondary'}>
                      {referral.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
