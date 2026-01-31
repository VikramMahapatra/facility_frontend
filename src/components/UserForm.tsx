import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { userManagementApiService } from "@/services/access_control/usermanagementapi";
import { UserFormValues, userFormSchema, userSchema } from "@/schemas/user.schema";
import { toast } from "sonner";
import {
    Building2,
    Truck,
    UserCog,
    Users,
    Eye,
    EyeOff,
    Trash2,
    Plus,
} from "lucide-react";
import PhoneInput from "react-phone-input-2";
import { siteApiService } from "@/services/spaces_sites/sitesapi";
import { buildingApiService } from "@/services/spaces_sites/buildingsapi";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";

// Define interfaces for API data
interface User {
    id: string;
    org_id: string;
    full_name: string;
    email: string;
    phone?: string;
    status: string;
    created_at: string;
    updated_at: string;
}


interface UserFormProps {
    user?: User;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (values: UserFormValues) => void;
    mode?: "create" | "edit" | "view";
}

const emptyFormData: UserFormValues = {
    full_name: "",
    email: "",
    phone: "",
    status: "active",
};


export function UserForm({
    user,
    open,
    onOpenChange,
    onSubmit,
    mode = "create",
}: UserFormProps) {
    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        getValues,
        formState: { errors, isSubmitting, isValid, isSubmitted },
    } = useForm<UserFormValues>({
        resolver: zodResolver(userSchema(mode === "create")),
        defaultValues: emptyFormData,
        mode: "onChange",
        reValidateMode: "onChange",
    });

    const [formLoading, setFormLoading] = useState(true);
    const [statusList, setStatusList] = useState([]);
    const [roleList, setRoleList] = useState([]);
    const [siteList, setSiteList] = useState<any[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [buildingList, setBuildingList] = useState<Record<string, any[]>>({});
    const [spaceList, setSpaceList] = useState<Record<string, any[]>>({});

    const isReadOnly = mode === "view";

    const loadAll = async () => {
        setFormLoading(true);

        const promises = [loadStatusLookup()];

        // Preload building and space lists for existing user spaces (edit mode)

        await Promise.all(promises);

        reset(
            user && mode !== "create"
                ? {
                    full_name: user.full_name || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    status: user.status as any || "active"
                }
                : emptyFormData
        );
        setFormLoading(false);
    };

    useEffect(() => {
        if (open) {
            loadAll();
        }
    }, [open, user, mode, reset]);


    const loadStatusLookup = async () => {
        const lookup = await userManagementApiService.getUserStatusOverview();
        if (lookup?.success) setStatusList(lookup.data || []);
    };

    const onSubmitForm = async (data: UserFormValues) => {
        // Process tenant_spaces for tenant account type
        let processedData = { ...data };
        await onSubmit(processedData);
    };

    const handleClose = () => {
        reset(emptyFormData);
        setBuildingList({});
        setSpaceList({});
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-[900px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create" && "Create New User"}
                        {mode === "edit" && "Edit User"}
                        {mode === "view" && "User Details"}
                    </DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto flex-1 pr-2 -mr-2">
                    <form
                        onSubmit={handleSubmit(onSubmitForm)}
                        className="space-y-4"
                        id="user-form"
                    >
                        <div className="space-y-4">
                            {/* Row 1: Name and Status */}
                            <div className="grid grid-cols-2 gap-4">
                                <Controller
                                    name="full_name"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="space-y-2">
                                            <Label>Full Name *</Label>
                                            <Input
                                                id="full_name"
                                                type="full_name"
                                                {...register("full_name")}
                                                placeholder="John Doe"
                                                disabled={isReadOnly || mode === "edit"}
                                                className={errors.email ? "border-red-500" : ""}
                                            />
                                            {errors.full_name && (
                                                <p className="text-sm text-red-500">
                                                    {errors.full_name.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                />

                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="space-y-2">
                                            <Label htmlFor="status">Status *</Label>
                                            <Select
                                                value={field.value || ""}
                                                onValueChange={field.onChange}
                                                disabled={isReadOnly}
                                            >
                                                <SelectTrigger
                                                    className={
                                                        errors.status ? "border-red-500" : ""
                                                    }
                                                >
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {statusList.map((status) => (
                                                        <SelectItem key={status.id} value={status.id}>
                                                            {status.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.status && (
                                                <p className="text-sm text-red-500">
                                                    {errors.status.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>

                            {/* Row 2: Email, Password, Phone */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        {...register("email")}
                                        placeholder="john@example.com"
                                        disabled={isReadOnly || mode === "edit"}
                                        className={errors.email ? "border-red-500" : ""}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>
                                <Controller
                                    name="phone"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone</Label>
                                            <PhoneInput
                                                country={"in"}
                                                value={field.value || ""}
                                                onChange={(value) => {
                                                    const digits = value.replace(/\D/g, "");
                                                    const finalValue = "+" + digits;
                                                    console.log("cleaned no :", finalValue);
                                                    field.onChange(finalValue);
                                                }}
                                                disabled={isReadOnly || mode === "edit"}
                                                inputProps={{
                                                    name: "phone",
                                                    required: true,
                                                }}
                                                containerClass="w-full relative"
                                                inputClass="!w-full !h-10 !pl-12 !rounded-md !border !border-input !bg-background !px-3 !py-2 !text-base !ring-offset-background placeholder:!text-muted-foreground focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!cursor-not-allowed disabled:!opacity-50 md:!text-sm"
                                                buttonClass="!border-none !bg-transparent !absolute !left-2 !top-1/2 !-translate-y-1/2 z-10"
                                                dropdownClass="!absolute !z-50 !bg-white !border !border-gray-200 !rounded-md !shadow-lg max-h-60 overflow-y-auto"
                                                enableSearch={true}
                                            />
                                            {errors.phone && (
                                                <p className="text-sm text-red-500">
                                                    {errors.phone.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                />
                            </div>
                        </div>
                    </form>
                </div>
                {!formLoading && (
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            {mode === "view" ? "Close" : "Cancel"}
                        </Button>
                        {mode !== "view" && (
                            <Button type="submit" form="user-form" disabled={isSubmitting}>
                                {isSubmitting
                                    ? "Saving..."
                                    : mode === "create"
                                        ? "Create User"
                                        : "Update User"}
                            </Button>
                        )}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
