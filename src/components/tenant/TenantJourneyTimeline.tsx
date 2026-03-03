import { EVENT_META, TimelineEvent } from "@/interfaces/spaces_interfaces";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface Props {
    history: TimelineEvent[];
}

export default function TenantJourneyTimeline({ history }: Props) {
    if (!history?.length) {
        return (
            <p className="text-sm text-muted-foreground">
                No journey available
            </p>
        );
    }

    return (
        <div className="w-full overflow-x-auto pb-2">
            <div className="flex items-start min-w-max px-2">
                {history.map((e, i) => {
                    const meta = EVENT_META[e.event] || {};
                    const Icon = meta.icon || Clock;
                    const isLatest = i === history.length - 1;

                    return (
                        <div key={i} className="flex items-center">

                            {/* EVENT */}
                            <div className="flex flex-col items-center text-center w-36">
                                {/* ICON */}
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full ${meta.color}`}
                                >
                                    <Icon className="h-5 w-5" />
                                </div>

                                {/* LABEL */}
                                <p className="mt-2 text-sm font-medium">
                                    {meta.label || e.event}
                                </p>

                                {/* DATE */}
                                <p className="text-xs text-muted-foreground">
                                    {new Date(e.date).toLocaleDateString()}
                                </p>
                            </div>

                            {/* CONNECTOR LINE */}
                            {i !== history.length - 1 && (
                                <div className="h-px w-16 bg-border mb-10" />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}