import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Users, Server, Pickaxe, ArrowDownToLine, Wallet } from "lucide-react";
import { HashratePlansManager } from "@/components/admin/HashratePlansManager";
import { DepositsManager } from "@/components/admin/DepositsManager";
import { WithdrawalsManager } from "@/components/admin/WithdrawalsManager";

export default function Admin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [newDevice, setNewDevice] = useState({
    name: "",
    description: "",
    device_type: "",
    hashrate: "",
    price: "",
    image_url: ""
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roles) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin panel.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      await loadData();
    } catch (error) {
      console.error("Error checking admin access:", error);
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    const [devicesResult, profilesResult] = await Promise.all([
      supabase.from("devices").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false })
    ]);

    if (devicesResult.data) setDevices(devicesResult.data);
    if (profilesResult.data) setUsers(profilesResult.data);
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.from("devices").insert({
        name: newDevice.name,
        description: newDevice.description,
        device_type: newDevice.device_type,
        hashrate: parseFloat(newDevice.hashrate),
        price: parseFloat(newDevice.price),
        image_url: newDevice.image_url || null
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Device added successfully",
      });

      setNewDevice({
        name: "",
        description: "",
        device_type: "",
        hashrate: "",
        price: "",
        image_url: ""
      });

      await loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteDevice = async (id: string) => {
    try {
      const { error } = await supabase.from("devices").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Device deleted successfully",
      });

      await loadData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <p>Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Admin Panel</h1>
          <p className="text-muted-foreground">Manage devices and view users</p>
        </div>

        <Tabs defaultValue="devices" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="devices" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Devices
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <Pickaxe className="h-4 w-4" />
              Plans
            </TabsTrigger>
            <TabsTrigger value="deposits" className="flex items-center gap-2">
              <ArrowDownToLine className="h-4 w-4" />
              Deposits
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Withdrawals
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="devices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Device
                </CardTitle>
                <CardDescription>Create a new mining device for users to purchase</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddDevice} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Device Name</Label>
                      <Input
                        id="name"
                        value={newDevice.name}
                        onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="device_type">Device Type</Label>
                      <Input
                        id="device_type"
                        value={newDevice.device_type}
                        onChange={(e) => setNewDevice({ ...newDevice, device_type: e.target.value })}
                        placeholder="e.g., GPU, ASIC"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hashrate">Hashrate (TH/s)</Label>
                      <Input
                        id="hashrate"
                        type="number"
                        step="0.01"
                        value={newDevice.hashrate}
                        onChange={(e) => setNewDevice({ ...newDevice, hashrate: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={newDevice.price}
                        onChange={(e) => setNewDevice({ ...newDevice, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="image_url">Image URL (optional)</Label>
                      <Input
                        id="image_url"
                        value={newDevice.image_url}
                        onChange={(e) => setNewDevice({ ...newDevice, image_url: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newDevice.description}
                        onChange={(e) => setNewDevice({ ...newDevice, description: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Add Device</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Devices</CardTitle>
                <CardDescription>Manage all mining devices</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Hashrate</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {devices.map((device) => (
                      <TableRow key={device.id}>
                        <TableCell className="font-medium">{device.name}</TableCell>
                        <TableCell>{device.device_type}</TableCell>
                        <TableCell>{device.hashrate} TH/s</TableCell>
                        <TableCell>${device.price}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteDevice(device.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans">
            <HashratePlansManager />
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Registered Users</CardTitle>
                <CardDescription>Overview of all users in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>User ID</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.full_name || "N/A"}</TableCell>
                        <TableCell className="font-mono text-xs">{user.user_id}</TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
