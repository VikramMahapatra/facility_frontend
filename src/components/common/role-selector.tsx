import { userManagementApiService } from "@/services/access_control/usermanagementapi";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";

export function RolesSelector({ control, errors, roleList }) {
    return (
        <Controller
            name="role_ids"
            control={control}
            render={({ field }) => (
                <div>
                    <label className="text-sm font-medium">Roles *</label>
                    <div className="grid grid-cols-4 gap-x-6 gap-y-3 border rounded-md p-4 max-h-[180px] overflow-y-auto">
                        {roleList.map((role) => (
                            <label key={role.id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={field.value?.includes(role.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            field.onChange([...field.value, role.id]);
                                        } else {
                                            field.onChange(
                                                field.value.filter((id) => id !== role.id)
                                            );
                                        }
                                    }}
                                />
                                {role.name}
                            </label>
                        ))}
                    </div>
                    {errors.role_ids && (
                        <p className="text-sm text-red-500">
                            {errors.role_ids.message}
                        </p>
                    )}
                </div>
            )}
        />
    );
}