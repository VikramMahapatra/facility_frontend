import { UseFormReturn, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/select";

import { RolesSelector } from "../common/role-selector";
import { AccountFormValues } from "@/schemas/account.schema";
import TenantSpacesForm from "./TenantSpaceForm";
import StaffSitesForm from "./StaffSitesForm";


type Mode = 'create' | 'edit' | 'view';

interface Props {
    form: UseFormReturn<AccountFormValues>;
    onSubmit: () => void;
    onCancel: () => void;
    mode: Mode
}

export default function AccountForm({
    form,
    onSubmit,
    onCancel,
    mode = "create",
}: Props) {
    const {
        control,
        register,
        watch,
        formState: { errors, isSubmitting },
    } = form;

    const accountType = watch("account_type");
    const isEdit = mode === "edit";
    const isView = mode === "view";

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* Account Type (read-only for edit) */}
            <div>
                <label className="text-sm font-medium">Account Type</label>

                {mode === "create" ? (
                    <Controller
                        name="account_type"
                        control={control}
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select account type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tenant">Tenant</SelectItem>
                                    <SelectItem value="staff">Staff</SelectItem>
                                    <SelectItem value="organization">Organization</SelectItem>
                                    <SelectItem value="owner">Owner</SelectItem>
                                    <SelectItem value="vendor">Vendor</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                ) : (
                    <input
                        value={accountType}
                        disabled
                        className="mt-1 w-full rounded-md border px-3 py-2 bg-muted"
                    />
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

            {/* Roles */}
            <RolesSelector control={control} errors={errors} />

            {/* Tenant */}
            {accountType === "tenant" && (
                <TenantSpacesForm form={form} mode={mode} />
            )}

            {/* Staff */}
            {accountType === "staff" && (
                <StaffSitesForm form={form} mode={mode} />
            )}

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" type="button" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </form>
    );
}

