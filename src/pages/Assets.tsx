import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Eye, Edit, Trash2, Package, Wrench, AlertTriangle, CheckCircle, Calendar, DollarSign } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { Asset, AssetOverview } from "@/interfaces/assets_interface";
import { assetApiService } from "@/services/maintenance_assets/assetsapi";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/Pagination";
import { mockAssetCategories } from "@/data/mockMaintenanceData";

export default function Assets() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>();
  const [deleteAssetId, setDeleteAssetId] = useState<string | null>(null);
  const [assetOverview, setAssetOverview] = useState<AssetOverview>({
    totalAssets: 0,
    activeAssets: 0,
    totalValue: 0,
    assetsNeedingMaintenance: 0,
    lastMonthAssetPercentage: 0
  });
  const [page, setPage] = useState(1); // current page
  const [pageSize] = useState(5); // items per page
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    loadAssets();
  }, [page]);

  useEffect(() => {
    updateAssetPage();
  }, [searchTerm, categoryFilter, statusFilter]);

  const updateAssetPage = () => {
    if (page === 1) {
      loadAssets();  // already page 1 → reload
    } else {
      setPage(1);    // triggers the page effect
    }
    loadAssetOverView();
  }

  const loadAssetOverView = async () => {
    const response = await assetApiService.getAssetOverview();
    setAssetOverview(response);
  }

  const loadAssets = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    // build query params
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (categoryFilter) params.append("category", categoryFilter);
    if (statusFilter) params.append("status", statusFilter);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());
    const response = await assetApiService.getAssets(params);
    setAssets(response.assets);
    setTotalItems(response.total);
  }

  const handleCreate = () => {
    setSelectedAsset(undefined);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleView = (asset: Asset) => {
    setSelectedAsset(asset);
    setFormMode('view');
    setIsFormOpen(true);
  };

  const handleEdit = (asset: Asset) => {
    setSelectedAsset(asset);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDelete = (assetId: string) => {
    setDeleteAssetId(assetId);
  };

  const confirmDelete = async () => {
    if (deleteAssetId) {
      try {
        await assetApiService.deleteAsset(deleteAssetId);
        updateAssetPage();
        setDeleteAssetId(null);
        toast({
          title: "Tax Code Deleted",
          description: "The tax code has been removed successfully.",
        });
      } catch (error) {
        toast({
          title: "Techical Error!",
          variant: "destructive",
        });
      }

    }
  };

  const handleSave = async (assetData: Partial<Asset>) => {
    try {
      if (formMode === 'create') {
        await assetApiService.addAsset(assetData);
      } else if (formMode === 'edit' && selectedAsset) {
        const updatedAsset = { ...selectedAsset, ...assetData };
        await assetApiService.updateAsset(updatedAsset);
      }
      setIsFormOpen(false);
      toast({
        title: formMode === 'create' ? "Asset Created" : "Space Updated",
        description: `Asset name ${assetData.name} has been ${formMode === 'create' ? 'created' : 'updated'} successfully.`,
      });
      updateAssetPage();
    } catch (error) {
      toast({
        title: "Techical Error!",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      retired: "secondary",
      in_repair: "destructive"
    } as const;

    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status.replace('_', ' ')}</Badge>;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <PropertySidebar />

        <div className="flex-1 flex flex-col">
          <header className="bg-card border-b border-border">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold">Assets</h1>
                  <p className="text-sm text-muted-foreground">Manage facility assets and equipment</p>
                </div>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Asset
              </Button>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <div className="container mx-auto py-6 space-y-6">

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{assetOverview.totalAssets}</div>
                    <p className="text-xs text-muted-foreground">+{assetOverview.lastMonthAssetPercentage}% from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{assetOverview.activeAssets}</div>
                    <p className="text-xs text-muted-foreground">{((assetOverview.activeAssets / assetOverview.totalAssets) * 100).toFixed(1)}% of total</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">₹{assetOverview.totalValue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Asset book value</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{assetOverview.assetsNeedingMaintenance}</div>
                    <p className="text-xs text-muted-foreground">Warranty expired</p>
                  </CardContent>
                </Card>
              </div>

              {/* Assets Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Asset Inventory</CardTitle>
                  <CardDescription>Complete list of facility assets and equipment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search assets..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {mockAssetCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                        <SelectItem value="in_repair">In Repair</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset Tag</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Warranty</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assets.map((asset) => {
                        const isWarrantyExpired = asset.warrantyExpiry && new Date(asset.warrantyExpiry) < new Date();

                        return (
                          <TableRow key={asset.id}>
                            <TableCell className="font-mono font-medium">{asset.tag}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{asset.name}</div>
                                {asset.model && <div className="text-sm text-muted-foreground">{asset.model}</div>}
                              </div>
                            </TableCell>
                            <TableCell>{asset.categoryName || 'Unknown'}</TableCell>
                            <TableCell>{asset.siteId}</TableCell>
                            <TableCell>{getStatusBadge(asset.status)}</TableCell>
                            <TableCell>₹{asset.cost?.toLocaleString() || 'N/A'}</TableCell>
                            <TableCell>
                              {asset.warrantyExpiry ? (
                                <div className={`text-sm ${isWarrantyExpired ? 'text-red-600' : ''}`}>
                                  {new Date(asset.warrantyExpiry).toLocaleDateString()}
                                  {isWarrantyExpired && <div className="text-xs">Expired</div>}
                                </div>
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Wrench className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <Pagination
                    page={page}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={(newPage) => setPage(newPage)}
                  />
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
      <AlertDialog open={!!deleteAssetId} onOpenChange={() => setDeleteAssetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Space</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this asset? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}