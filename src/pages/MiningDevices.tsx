import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Server, Cpu, Zap, Activity } from "lucide-react";

export default function MiningDevices() {
  const [devices, setDevices] = useState<any[]>([]);
  const [userDevices, setUserDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch available devices
      const { data: devicesData, error: devicesError } = await supabase
        .from('devices')
        .select('*')
        .order('price', { ascending: true });

      if (devicesError) throw devicesError;

      // Fetch user's devices
      const { data: userDevicesData, error: userDevicesError } = await supabase
        .from('user_devices')
        .select(`
          *,
          devices (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (userDevicesError) throw userDevicesError;

      setDevices(devicesData || []);
      setUserDevices(userDevicesData || []);
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

  const handlePurchaseDevice = async (device: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase a device",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_devices')
        .insert({
          user_id: user.id,
          device_id: device.id,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: `${device.name} purchased successfully`,
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
          <h1 className="text-3xl font-bold mb-2">Mining Devices</h1>
          <p className="text-muted-foreground">Boost your hashrate with dedicated mining hardware</p>
        </div>

        {/* User's Active Devices */}
        {userDevices.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Active Devices</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userDevices.map((userDevice: any) => (
                <Card key={userDevice.id} className="p-6 border-primary/50">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="default">Active</Badge>
                    <Activity className="h-5 w-5 text-primary animate-pulse" />
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <Server className="h-10 w-10 text-primary" />
                    <div>
                      <h3 className="text-lg font-bold">{userDevice.devices.name}</h3>
                      <p className="text-sm text-muted-foreground">{userDevice.devices.device_type}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Hashrate:</span>
                      <span className="font-semibold">{parseFloat(userDevice.devices.hashrate).toFixed(2)} TH/s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Purchased:</span>
                      <span className="font-semibold">
                        {new Date(userDevice.purchase_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Devices */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Available Devices</h2>
          {devices.length === 0 ? (
            <Card className="p-12 text-center">
              <Server className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Devices Available Yet</h3>
              <p className="text-muted-foreground">Check back soon for new mining devices!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {devices.map((device) => (
                <Card key={device.id} className="p-6 hover:border-primary/50 transition-smooth">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Cpu className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{device.name}</h3>
                      <p className="text-sm text-muted-foreground">{device.device_type}</p>
                    </div>
                  </div>
                  
                  {device.description && (
                    <p className="text-sm text-muted-foreground mb-4">{device.description}</p>
                  )}
                  
                  <div className="flex items-center gap-2 mb-4 p-3 bg-muted rounded-lg">
                    <Zap className="h-5 w-5 text-primary" />
                    <div>
                      <span className="text-sm text-muted-foreground">Hashrate: </span>
                      <span className="font-semibold">{parseFloat(device.hashrate).toFixed(2)} TH/s</span>
                    </div>
                  </div>
                  
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold gradient-text">${parseFloat(device.price).toFixed(2)}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    onClick={() => handlePurchaseDevice(device)}
                  >
                    Purchase Device
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
