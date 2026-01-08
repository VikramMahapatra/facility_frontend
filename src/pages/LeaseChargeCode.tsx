import { useState, useEffect } from "react";
import { Plus, Eye, Edit, Trash2, Search, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PropertySidebar } from "@/components/PropertySidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,

} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { LogOut, } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pagination } from "@/components/Pagination";
import { useSkipFirstEffect } from "@/hooks/use-skipfirst-effect";
// import { useAuth } from "../context/AuthContext";
import { leaseChargeCodesApiService } from "@/services/leasing_tenants/leasechargecodesapi";
import { useLoader } from "@/context/LoaderContext";
import { LeaseChargeCodeForm } from "@/components/LeaseChargeCodeForm";
import LoaderOverlay from "@/components/LoaderOverlay";
import ContentContainer from "@/components/ContentContainer";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/PageHeader";

interface LeaseChargeCode {
  id?: string;
  code: string;
}

export default function LeaseChargeCode() {
  const [searchTerm, setSearchTerm] = useState("");
  const [chargeCodes, setChargeCodes] = useState<LeaseChargeCode[]>([]);
  const [selectedChargeCode, setSelectedChargeCode] = useState<
    LeaseChargeCode | undefined
  >(undefined);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [totalItems, setTotalItems] = useState(0);
  const { user, handleLogout } = useAuth();
  // const { canRead, canWrite, canDelete } = useAuth();
  const { withLoader } = useLoader();
  // const resource = "lease_charge_codes";

  useSkipFirstEffect(() => {
    loadChargeCodes();
  }, [page]);

  useEffect(() => {
    if (page === 1) {
      loadChargeCodes();
    } else {
      setPage(1);
    }
  }, [searchTerm]);

  const loadChargeCodes = async () => {
    const skip = (page - 1) * pageSize;
    const limit = pageSize;

    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    params.append("skip", skip.toString());
    params.append("limit", limit.toString());

    const response = await withLoader(async () => {
      return await leaseChargeCodesApiService.getLeaseChargeCodes(params);
    });

    if (response?.success) {
      setChargeCodes(response.data || []);
      setTotalItems(response.data?.total || response.data?.data?.length || 0);
    }
  };

  const handleCreate = () => {
    setSelectedChargeCode(undefined);
    setFormMode("create");
    setShowForm(true);
  };

  const handleView = (code: LeaseChargeCode) => {
    setSelectedChargeCode(code);
    setFormMode("view");
    setShowForm(true);
  };

  const handleEdit = (code: LeaseChargeCode) => {
    setSelectedChargeCode(code);
    setFormMode("edit");
    setShowForm(true);
  };

  const handleSave = async (codeData: Partial<LeaseChargeCode>) => {
    let response;
    if (formMode === "create") {
      response = await withLoader(async () => {
        return await leaseChargeCodesApiService.addLeaseChargeCode(codeData);
      });

      if (response?.success) loadChargeCodes();

    } else if (formMode === "edit" && selectedChargeCode) {
      const updatedCode = {
        ...selectedChargeCode,
        ...codeData,
      };
      response = await leaseChargeCodesApiService.updateLeaseChargeCode(updatedCode);

      if (response?.success) {
        setChargeCodes((prev) =>
          prev.map((c) => (c.id === updatedCode.id ? response.data : c))
        );
      }
    }

    if (response?.success) {
      setShowForm(false);
      toast.success(
        `Charge code ${codeData.code} has been ${formMode === "create" ? "created" : "updated"
        } successfully.`
      );
    }
    return response;
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      const response = await withLoader(async () => {
        return await leaseChargeCodesApiService.deleteLeaseChargeCode(deleteId);
      });
      if (response?.success) {
        toast.success("Charge code has been deleted successfully.");
        setDeleteId(null);
        loadChargeCodes();
      }
    }
  };

  return (
    <div>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-sidebar-primary">
              All Charge Codes
            </h2>
            <p className="text-muted-foreground">
              Manage lease charge codes
            </p>
          </div>
          {/* {canWrite(resource) && ( */}
          <Button className="gap-2" onClick={handleCreate}>
            <Plus className="h-4 w-4" />
            Add Charge Code
          </Button>
          {/* )} */}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search charge codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="relative rounded-md border">
          <ContentContainer>
            <LoaderOverlay />
            <Card>
              <CardHeader>
                <CardTitle>Charge Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chargeCodes.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className="text-center text-muted-foreground h-32"
                        >
                          No charge codes found
                        </TableCell>
                      </TableRow>
                    ) : (
                      chargeCodes.map((code, index) => (
                        <TableRow key={code.id || code.code || index}>
                          <TableCell className="font-medium">
                            {code.code}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleView(code)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {/* {canWrite(resource) && ( */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(code)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              {/* )} */}
                              {/* {canDelete(resource) && ( */}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleDelete(code.id || "")}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              {/* )} */}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                {totalItems > 0 && (
                  <Pagination
                    page={page}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={setPage}
                  />
                )}
              </CardContent>
            </Card>
          </ContentContainer>
        </div>
      </div>
      {/* Create/Edit/View Form */}
      <LeaseChargeCodeForm
        leaseChargeCode={selectedChargeCode}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedChargeCode(undefined);
          setFormMode("create");
        }}
        onSave={handleSave}
        mode={formMode}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Charge Code</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this charge code? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
