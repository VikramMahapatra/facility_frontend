// pages/Assets.tsx
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Eye, Edit, Trash2, Package, Wrench, AlertTriangle, CheckCircle, DollarSign } from "lucide-react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PropertySidebar } from "@/components/PropertySidebar";
import { Asset, AssetOverview } from "@/interfaces/assets_interface";
import { assetApiService } from "@/services/maintenance_assets/assetsapi";
import { useToast } from "@/hooks/use-toast";
import { Pagination } from "@/components/Pagination";
import { AssetForm, AssetFormValues } from "@/components/AssetForm";

export default function Assets() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // NEW: dynamic filter sources
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);

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
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    loadAssets();
  }, [page]);

  useEffect(() => {
    updateAssetPage();
  }, [searchTerm, categoryFilter, statusFilter]);

  useEffect(() => {
    // load cards + filter sources once
    loadAssetOverView();
    (async () => {
      try {
        const [cats, stats] = await Promise.all([
          assetApiService.getCategories(),
          assetApiService.getStatuses(),
        ]);
        setCategoryOptions(cats);
        setStatusOptions(stats);
      } catch {
        // non-blocking
      }
    })();
  }, []);

  const updateAssetPage = () => {
    if (page === 1) {
      loadAssets();
    } else {
      setPage(1);
    }
  };

  const loadAssetOverView = async () => {
    const response = await assetApiService.getAssetOverview();
    setAssetOverview(response);
  };

  const loadAssets = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (categoryFilter) params.append("category", categoryFilter);
    if (statusFilter) params.append("status", statusFilter);
    params.append("skip", String(skip));
    params.append("limit", String(limit));

    const response = await assetApiService.getAssets(params);
    setAssets(response.assets);
    setTotalItems(response.total);
  };

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

  const handleDelete = (assetId: string) => setDeleteAssetId(assetId);

  const confirmDelete = async () => {
    if (!deleteAssetId) return;
    try {
      await assetApiService.deleteAsset(deleteAssetId);
      updateAssetPage();
      loadAssetOverView();
      toast({ title: "Asset Deleted", description: "Asset has been removed successfully." });
    } catch {
      toast({ title: "Techical Error!", variant: "destructive" });
    } finally {
      setDeleteAssetId(null);
    }
  };

  const handleSave = async (values: Partial<AssetFormValues>) => {
    try {
      if (formMode === 'create') {
        await assetApiService.addAsset(values);
      } else if (formMode === 'edit' && selectedAsset) {
        await assetApiService.updateAsset({ ...selectedAsset, ...values });
      }
      setIsFormOpen(false);
      toast({
        title: formMode === 'create' ? "Asset Created" : "Asset Updated",
        description: `Asset ${values.name || selectedAsset?.name || ''} saved successfully.`,
      });
      updateAssetPage();
      loadAssetOverView();
    } catch {
      toast({ title: "Techical Error!", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      retired: "secondary",
      in_repair: "destructive"
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status?.replace('_', ' ')}</Badge>;
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
              <Button onClick={handleCreate}>
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
                    <p className="text-xs text-muted-foreground">
                      +{assetOverview.lastMonthAssetPercentage}% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{assetOverview.activeAssets}</div>
                    <p className="text-xs text-muted-foreground">
                      {assetOverview.totalAssets
                        ? ((assetOverview.activeAssets / assetOverview.totalAssets) * 100).toFixed(1)
                        : 0}
                      % of total
                    </p>
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

              {/* Inventory */}
              <Card>
                <CardHeader>
                  <CardTitle>Asset Inventory</CardTitle>
                  <CardDescription>Complete list of facility assets and equipment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search & Filters */}
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
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categoryOptions.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {statusOptions.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Table */}
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
                        const isWarrantyExpired =
                          asset.warranty_expiry && new Date(asset.warranty_expiry) < new Date();

                        return (
                          <TableRow key={asset.id}>
                            <TableCell className="font-mono font-medium">{asset.tag}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{asset.name}</div>
                                {asset.model && <div className="text-sm text-muted-foreground">{asset.model}</div>}
                              </div>
                            </TableCell>
                            <TableCell>{(asset as any).category_name || 'Unknown'}</TableCell>
                            <TableCell>{asset.site_id}</TableCell>
                            <TableCell>{getStatusBadge(asset.status)}</TableCell>
                            <TableCell>₹{asset.cost?.toLocaleString() || 'N/A'}</TableCell>
                            <TableCell>
                              {asset.warranty_expiry ? (
                                <div className={`text-sm ${isWarrantyExpired ? 'text-red-600' : ''}`}>
                                  {new Date(asset.warranty_expiry).toLocaleDateString()}
                                  {isWarrantyExpired && <div className="text-xs">Expired</div>}
                                </div>
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleView(asset)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(asset)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Wrench className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                  onClick={() => handleDelete(asset.id)}
                                >
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

      {/* Delete dialog */}
      <AlertDialog open={!!deleteAssetId} onOpenChange={() => setDeleteAssetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
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

      {/* Create / Edit / View */}
      <AssetForm
        isOpen={isFormOpen}
        mode={formMode}
        asset={selectedAsset as unknown as AssetFormValues}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
      />
    </SidebarProvider>
  );
}
