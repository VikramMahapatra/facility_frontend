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
import { boolean } from "zod";

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
    onSubmit: (values: UserFormValues, isExistingUser: boolean) => void;
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
    const [existingUserWarning, setExistingUserWarning] = useState<string | null>(null);
    const [isGlobalUser, setIsGlobalUser] = useState(false);
    const [globalUserId, setGlobalUserId] = useState<string | null>(null);
    const [isCheckingGlobalUser, setIsCheckingGlobalUser] = useState(false);
    const isReadOnly = mode === "view" || mode === "edit";

    const loadAll = async () => {
        setFormLoading(true);

        const promises = [loadStatusLookup()];
        setExistingUserWarning(null);
        setIsGlobalUser(null);

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

    const checkGlobalUser = async (email?: string, phone?: string) => {
        if (!email && !phone) {
            setExistingUserWarning(null);
            setIsGlobalUser(false);
            setGlobalUserId(null);
            return;
        }

        setIsCheckingGlobalUser(true);

        try {
            const res = await userManagementApiService.checkUserGlobal({ email, phone });

            if (res?.success && res.data?.exists && res.data.user) {
                const user = res.data.user;

                reset(
                    {
                        full_name: user.full_name ?? "",
                        email: user.email ?? "",
                        phone: user.phone ?? "",
                        status: "active",
                    },
                    { keepDirty: false }
                );

                setIsGlobalUser(true);
                setGlobalUserId(user.id);

                setExistingUserWarning(
                    "This user already exists globally. It will be linked to the current organization."
                );
            } else {
                setExistingUserWarning(null);
                setIsGlobalUser(false);
                setGlobalUserId(null);
            }
        } catch (err) {
            console.error(err);
            setExistingUserWarning(null);
            setIsGlobalUser(false);
            setGlobalUserId(null);
        } finally {
            setIsCheckingGlobalUser(false); // 🔥 important
        }
    };


    const loadStatusLookup = async () => {
        const lookup = await userManagementApiService.getUserStatusOverview();
        if (lookup?.success) setStatusList(lookup.data || []);
    };

    const onSubmitForm = async (data: UserFormValues) => {
        // Process tenant_spaces for tenant account type
        let isExistingUser = false;
        if (existingUserWarning) isExistingUser = true;

        await onSubmit(data, isExistingUser); // create new user
    };

    const handleClose = () => {
        reset(emptyFormData);
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
                                    disabled={isReadOnly || isGlobalUser}
                                    render={({ field }) => (
                                        <div className="space-y-2">
                                            <Label>Full Name *</Label>
                                            <Input
                                                id="full_name"
                                                type="full_name"
                                                {...register("full_name")}
                                                placeholder="John Doe"
                                                disabled={isReadOnly || isGlobalUser}
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
                                                disabled={isReadOnly || isGlobalUser}
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
                            <div className="grid grid-cols-2 gap-4">
                                {/* Row 2: Email, Password, Phone */}
                                <Controller
                                    name="email"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="space-y-2">
                                            <Label>Email *</Label>
                                            <Input
                                                {...field}
                                                placeholder="john@example.com"
                                                disabled={isReadOnly || isGlobalUser}
                                                onBlur={() => checkGlobalUser(field.value, getValues("phone"))}
                                            />
                                        </div>
                                    )}
                                />
                                <Controller
                                    name="phone"
                                    control={control}

                                    render={({ field }) => (
                                        <div className="space-y-2">
                                            <Label>Phone</Label>
                                            <PhoneInput
                                                country="in"
                                                value={field.value || ""}
                                                onChange={(value) => {
                                                    const digits = value.replace(/\D/g, "");
                                                    const finalValue = "+" + digits;
                                                    field.onChange(finalValue);
                                                }}
                                                onBlur={() => checkGlobalUser(getValues("email"), getValues("phone"))}
                                                inputProps={{
                                                    name: "phone",
                                                    required: true,
                                                }}
                                                containerClass="w-full relative"
                                                inputClass="!w-full !h-10 !pl-12 !rounded-md !border !border-input !bg-background !px-3 !py-2 !text-base !ring-offset-background placeholder:!text-muted-foreground focus-visible:!outline-none focus-visible:!ring-2 focus-visible:!ring-ring focus-visible:!ring-offset-2 disabled:!cursor-not-allowed disabled:!opacity-50 md:!text-sm"
                                                buttonClass="!border-none !bg-transparent !absolute !left-2 !top-1/2 !-translate-y-1/2 z-10"
                                                dropdownClass="!absolute !z-50 !bg-white !border !border-gray-200 !rounded-md !shadow-lg max-h-60 overflow-y-auto"
                                                enableSearch={true}
                                                disabled={isReadOnly || isGlobalUser}
                                            />
                                        </div>
                                    )}
                                />
                            </div>
                            {existingUserWarning && (
                                <div className="flex items-start gap-3 rounded-md border border-yellow-300 bg-yellow-50 px-4 py-3">
                                    <UserCog className="h-5 w-5 text-yellow-600 mt-0.5" />
                                    <div className="text-sm text-yellow-800">
                                        <p className="font-medium">User already exists</p>
                                        <p className="text-yellow-700">
                                            {existingUserWarning}
                                        </p>
                                    </div>
                                </div>
                            )}
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
                            <Button
                                type="submit"
                                form="user-form"
                                disabled={isSubmitting || isCheckingGlobalUser}
                            >
                                {isSubmitting
                                    ? "Saving..."
                                    : isCheckingGlobalUser
                                        ? "Checking user..."
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
