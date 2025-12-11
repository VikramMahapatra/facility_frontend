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
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { PropertySidebar } from "@/components/PropertySidebar";
import { Asset, AssetOverview } from "@/interfaces/assets_interface";
import { assetApiService } from "@/services/maintenance_assets/assetsapi";
import { toast } from "sonner";
import { Pagination } from "@/components/Pagination";
import { AssetForm } from "@/components/AssetForm";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
import { useAuth } from "../context/AuthContext";
import { useLoader } from "@/context/LoaderContext";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";

export default function Assets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { canRead, canWrite, canDelete } = useAuth();
  const resource = "assets";
 
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);

  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>();
  const [deleteAssetId, setDeleteAssetId] = useState<string | null>(null);
  const { withLoader } = useLoader();
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

  useSkipFirstEffect(() => {
    loadAssets();
  }, [page]);

  useEffect(() => {
    updateAssetPage();
  }, [searchTerm, categoryFilter, statusFilter]);

  useEffect(() => {
    loadAssetOverView();
    loadCategories();
    loadStatuses();
  }, []);

  const updateAssetPage = () => {
    if (page === 1) {
      loadAssets();
    } else {
      setPage(1);
    }
  };

  const loadCategories = async () => {
    const response = await withLoader(async () => {
      return await assetApiService.getCategories();
    });
    if (response?.success) setCategoryOptions(response.data);
  }

  const loadStatuses = async () => {
    const response = await withLoader(async () => {
      return await assetApiService.getStatuses();
    });
    if (response?.success) setStatusOptions(response.data);
  }

  const loadAssetOverView = async () => {
    const response = await assetApiService.getAssetOverview();
    if (response?.success) setAssetOverview(response.data);
  };

  const loadAssets = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (categoryFilter && categoryFilter !== "all") params.append("category", categoryFilter);
    if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
    params.append("skip", String(skip));
    params.append("limit", String(limit));

    const response = await withLoader(async () => {
      return await assetApiService.getAssets(params);
    });
    
    if (response?.success) {
      setAssets(response.data?.assets || []);
      setTotalItems(response.data?.total || 0);
    }
  };

  const handleCreate = () => {
    setSelectedAsset(null);
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
    if (deleteAssetId) {
      const response = await assetApiService.deleteAsset(deleteAssetId);
      if (response.success) {
        updateAssetPage();
        loadAssetOverView();
        setDeleteAssetId(null);
        toast.success("Asset deleted successfully");
      }
    }
  };

 const handleSave = async (values: Partial<Asset>) => {
    let response;
    if (formMode === 'create') {
      response = await assetApiService.addAsset(values);
      if (response.success) updateAssetPage()
        loadAssetOverView();
    } else if (formMode === 'edit' && selectedAsset) {
      const updatedAsset = {
        ...selectedAsset,
        ...values,
        updated_at: new Date().toISOString(),
      };
      response = await assetApiService.updateAsset(updatedAsset);

      if (response.success) {
        loadAssetOverView();
        setAssets((prev) =>
          prev.map((a) => (a.id === updatedAsset.id ? response.data || updatedAsset : a))
        );
      }
    }

    if (response.success) {
      setIsFormOpen(false);
      toast.success(
        `Asset ${values.name || selectedAsset?.name || ''} has been ${formMode === 'create' ? 'created' : 'updated'} successfully.`
      );
    }
    return response;
  };

  const getStatusBadge = (status: string) => {
    if (!status || status === "unknown") {
      return <Badge variant="outline">Unknown</Badge>;
    }
    status = status.toLowerCase();
    const variants = {
      active: "default",
      inactive: "secondary",
      retired: "secondary",
      in_repair: "destructive"
    } as const;
    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status?.replace('_', ' ')}</Badge>;
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <PropertySidebar />
        <SidebarInset className="flex-1">
          <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-lg font-semibold">Assets</h1>
            </div>
          </div>

          <div className="flex-1 space-y-6 p-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-sidebar-primary">
                 All Assets
                </h2>
                <p className="text-muted-foreground">
                  Manage facility assets and equipment
                </p>
              </div>
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Asset
              </Button>
            </div>

            <div className="space-y-6">
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
                        <SelectItem
                          key={c.id}
                          value={c.name || c.id}
                        >
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        {statusOptions.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative rounded-md border">
                    <ContentContainer>
                      <LoaderOverlay />
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
                            <TableCell>{(asset as any).category?.name || (asset as any).category_name || 'Unknown'}</TableCell>
                            <TableCell>{asset.location || '-'}</TableCell>
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
                                {canWrite(resource) && <Button variant="ghost" size="sm" onClick={() => handleEdit(asset)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                }
                                {/* <Button variant="ghost" size="sm">
                                  <Wrench className="h-4 w-4" />
                                </Button> */}
                                {canDelete(resource) && <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                  onClick={() => handleDelete(asset.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                }
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
                    </ContentContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
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
        asset={selectedAsset}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
      />
    </SidebarProvider>
  );
}
