import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePageHeader } from "@/hooks/use-pageheader";
import { Separator } from "@/components/ui/separator";

export const PageHeader = () => {
    const { title, icon: Icon } = usePageHeader();

    return (
    <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        {Icon && (
            <Icon className="h-5 w-5 text-sidebar-primary" />
        )}

        <h1 className="text-lg font-semibold text-sidebar-primary">
            {title}
        </h1>
    </div>
);
};
