import { useState } from "react";

// Example icon imports (replace with your icons)

interface Step {
    id: string;  // ✅ change from number to string
    title: string;
    completed: boolean;
    enabled: boolean;
    icon: any;
    action: () => void;
}

interface WorkflowProps {
    steps: Step[];
}

export default function WorkflowStepper({ steps }: WorkflowProps) {
    // State to track current step index
    const [currentStepIndex, setCurrentStepIndex] = useState(
        steps.findIndex(step => !step.completed) >= 0
            ? steps.findIndex(step => !step.completed)
            : steps.length - 1
    );

    const handleStepClick = (index: number) => {
        if (steps[index].enabled) {
            setCurrentStepIndex(index);
            steps[index].action();
        }
    };

    return (
        <div className="relative p-6 border rounded-xl ">
            <div className="flex justify-center items-center">
                {steps.map((step, index) => {
                    const Icon = step.icon;

                    // Determine status
                    const status =
                        step.completed
                            ? "completed"
                            : index === currentStepIndex
                                ? "current"
                                : "pending";

                    const iconColor =
                        status === "completed"
                            ? "text-green-500"
                            : status === "current"
                                ? "text-yellow-400"
                                : "text-gray-400";

                    return (
                        <div key={step.id} className="flex items-center flex-1">
                            {/* Step button + title */}
                            <div className="flex flex-col items-center z-10">
                                <button
                                    disabled={!step.enabled}
                                    onClick={() => handleStepClick(index)}
                                    className="h-12 w-12 rounded-full bg-white border flex items-center justify-center"
                                >
                                    <Icon className={`h-6 w-6 ${iconColor}`} />
                                </button>
                                <span className="text-xs mt-2 text-center">{step.title}</span>
                            </div>

                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div className="flex-1 h-0.5 bg-gray-300 self-center">
                                    <div
                                        className={`h-0.5 w-full ${steps[index + 1].completed
                                            ? "bg-green-500"
                                            : index + 1 === currentStepIndex
                                                ? "bg-yellow-400"
                                                : "bg-gray-300"
                                            }`}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
