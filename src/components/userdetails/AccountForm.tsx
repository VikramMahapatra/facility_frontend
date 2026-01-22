import { UseFormReturn, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";
import { RolesSelector } from "../common/role-selector";
import { AccountFormValues } from "@/schemas/account.schema";
import TenantSpacesForm from "./TenantSpaceForm";
import StaffSitesForm from "./StaffSitesForm";
import { useEffect, useState } from "react";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { userManagementApiService } from "@/services/access_control/usermanagementapi";
import { Building2, Truck, UserCog, Users } from "lucide-react";

type Mode = 'create' | 'edit' | 'view';

interface Props {
    form: UseFormReturn<AccountFormValues>;
    onSubmit: () => void;
    onCancel: () => void;
    mode: Mode;
}

export default function AccountForm({
    form,
    onSubmit,
    onCancel,
    mode = "create"
}: Props) {
    const {
        control,
        register,
        watch,
        formState: { errors, isSubmitting },
    } = form;
    const [formLoading, setFormLoading] = useState(true);
    const [siteList, setSiteList] = useState<any[]>([]);
    const [roleList, setRoleList] = useState([]);

    const accountType = watch("account_type");
    const isEdit = mode === "edit";
    const isView = mode === "view";

    const loadAll = async () => {
        setFormLoading(true);
        await Promise.all([loadSites(), loadRolesLookup()]);
        setFormLoading(false);
    }

    useEffect(() => {
        loadAll();
    }, [form]);

    const loadSites = async () => {
        const lookup = await siteApiService.getSiteLookup();;
        if (lookup.success) setSiteList(lookup.data || []);
    };

    const loadRolesLookup = async () => {
        const lookup = await userManagementApiService.getUserRolesLookup();
        if (lookup?.success) setRoleList(lookup.data || []);
    };


    const accountTypes = [
        {
            value: "organization",
            label: "Organization",
            description: "Property owners and facility managers",
            icon: <Building2 className="w-5 h-5" />,
        },
        {
            value: "staff",
            label: "Staff",
            description: "manages the sites of properties",
            icon: <UserCog className="w-5 h-5" />,
        },
        {
            value: "tenant",
            label: "Tenant",
            description: "Renters and occupants of properties",
            icon: <Users className="w-5 h-5" />,
        },
        {
            value: "vendor",
            label: "Vendor",
            description: "Service providers and contractors",
            icon: <Truck className="w-5 h-5" />,
        },
    ];

    const selectedAccountType = accountTypes.find(
        (x) => x.value === accountType
    );

    return (
        <div className="overflow-y-auto flex-1 pr-2 -mr-2">
            <form onSubmit={onSubmit} id="account-form">
                {formLoading ? (
                    <p className="text-center">Loading...</p>
                ) : (
                    <div className="space-y-4">
                        {/* Account Type (read-only for edit) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Account Type</label>
                                {mode === "create" ? (
                                    <Controller
                                        name="account_type"
                                        control={control}
                                        render={({ field }) => (

                                            <Select
                                                value={field.value || ""}
                                                onValueChange={field.onChange}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select your account type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {accountTypes.map((type) => (
                                                        <SelectItem
                                                            key={type.value}
                                                            value={type.value}
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                {type.icon}
                                                                <div>
                                                                    <div className="font-medium">
                                                                        {type.label}
                                                                    </div>
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {type.description}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                ) : (
                                    <div className="w-full">
                                        <div
                                            className="
                                                flex items-center justify-between
                                                h-10 w-full
                                                rounded-md border
                                                bg-muted
                                                px-3 py-2
                                                text-sm
                                            "
                                        >
                                            <div className="flex items-center gap-3">
                                                {selectedAccountType?.icon}
                                                <div className="leading-tight">
                                                    <div className="font-medium">
                                                        {selectedAccountType?.label}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {selectedAccountType?.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>


                            {/* Status */}
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <div>
                                        <label className="text-sm font-medium">Status</label>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.status && (
                                            <p className="text-sm text-red-500">{errors.status.message}</p>
                                        )}
                                    </div>
                                )}
                            />
                        </div>

                        {/* Roles */}
                        <RolesSelector control={control} errors={errors} roleList={roleList} />

                        {/* Tenant */}
                        {
                            accountType === "tenant" && (
                                <TenantSpacesForm form={form} mode={mode} />
                            )
                        }

                        {/* Staff */}
                        {
                            accountType === "staff" && (
                                <StaffSitesForm form={form} mode={mode} siteList={siteList} />
                            )
                        }

                        {/* Footer */}
                        <div className="flex justify-end gap-2 ">
                            <Button variant="outline" type="button" onClick={onCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}

