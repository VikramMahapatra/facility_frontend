import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { spacesApiService } from "@/services/spaces_sites/spacesapi";
import { SpaceOwnershipSection } from "@/components/SpaceOwnershipSection";
import { useLoader } from "@/context/LoaderContext";
import { getKindColor, getKindIcon, getStatusColor } from "@/interfaces/spaces_interfaces";
import ContentContainer from "@/components/ContentContainer";
import LoaderOverlay from "@/components/LoaderOverlay";
import { Space } from "./Spaces";
import { ArrowLeft, FileText, Home } from "lucide-react";

export default function SpaceDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [space, setSpace] = useState<Space>(null);
    const { withLoader } = useLoader();
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) return;
        loadSpace();
    }, [id]);

    const loadSpace = async () => {
        const response = await withLoader(async () => {
            return await spacesApiService.getSpaceById(id);
        });
        if (response.success) setSpace(response.data);
    }

    return (
        <ContentContainer>
            <LoaderOverlay />
            {space && (
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4">
                            {/* Back button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(-1)}
                                className="mt-1"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>

                            {/* Icon + content */}
                            <div className="flex items-start gap-3">
                                {/* Space kind icon */}
                                <span className="text-3xl mt-1">
                                    {getKindIcon(space?.kind)}
                                </span>

                                {/* Text content */}
                                <div className="flex flex-col gap-1">
                                    {/* Title */}
                                    <h1 className="text-2xl font-semibold leading-tight">
                                        {space.name || "Unnamed Space"}
                                    </h1>

                                    {/* Code */}
                                    <p className="text-sm text-muted-foreground">
                                        Code: {space.code}
                                    </p>

                                    {/* Badges */}
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge
                                            className={getKindColor(space?.kind)}
                                        >
                                            {space?.kind.replace("_", " ")}
                                        </Badge>

                                        <Badge
                                            className={getStatusColor(space?.status)}
                                        >
                                            {space?.status.replace("_", " ")}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Separator />

                    {/* Space Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                <h1 className="flex items-center gap-2">
                                    <Home className="h-5 w-5" /> Space Information
                                </h1>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4 text-sm">
                            <Info label="Site" value={space.site_name} />
                            <Info label="Building" value={space.building_block} />
                            <Info label="Floor" value={space.floor} />
                            <Info label="Area (sqft)" value={space.area_sqft} />
                            <Info label="Beds" value={space.beds} />
                            <Info label="Baths" value={space.baths} />
                            <Info label="View" value={space.attributes?.view} />
                            <Info label="Furnished" value={space.attributes?.furnished} />
                        </CardContent>
                    </Card>

                    {/* Ownership */}
                    <Card>
                        <CardHeader>
                            <CardTitle><h1 className="flex items-center gap-2">
                                <FileText className="h-5 w-5" /> Ownership
                            </h1></CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SpaceOwnershipSection spaceId={id!} />
                        </CardContent>
                    </Card>
                </div>
            )}
        </ContentContainer>
    );
}

function Info({ label, value }: { label: string; value?: any }) {
    const displayValue = (v?: string | number | null) =>
        v === null || v === undefined || v === "" ? "-" : v;
    return (
        <div>
            <p className="text-muted-foreground">{label}</p>
            <p>{displayValue(value)}</p>
        </div>
    );
}
