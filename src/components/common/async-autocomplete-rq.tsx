import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandInput,
    CommandItem,
    CommandList,
    CommandEmpty,
} from "@/components/ui/command";

export interface AutocompleteOption {
    id: string;
    label: string;
}

interface AsyncAutocompleteProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;

    /** React Query key base */
    queryKey: string[];

    /** Fetcher used by React Query */
    queryFn: (search: string) => Promise<AutocompleteOption[]>;

    /** Edit-mode fallback option */
    fallbackOption?: AutocompleteOption;

    /** Optional minimum chars before search */
    minSearchLength?: number;
}

export function AsyncAutocompleteRQ({
    value,
    onChange,
    placeholder = "Select option",
    disabled,
    queryKey,
    queryFn,
    fallbackOption,
    minSearchLength = 0,
}: AsyncAutocompleteProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState("");

    const { data = [], isFetching } = useQuery({
        queryKey: [...queryKey, search],
        queryFn: () => queryFn(search),
        enabled: open && search.length >= minSearchLength,
        staleTime: 10 * 60 * 1000, // 🔥 10 min cache
        placeholderData: (prev) => prev
    });

    // 👻 Merge fallback option
    const options = React.useMemo(() => {
        if (!fallbackOption) return data;
        return data.some((o) => o.id === fallbackOption.id)
            ? data
            : [fallbackOption, ...data];
    }, [data, fallbackOption]);

    const selected = options.find((o) => o.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    disabled={disabled}
                    className="w-full justify-between autocomplete-input"
                >
                    {selected?.label || placeholder}
                    {isFetching ? (
                        <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    ) : (
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-full p-0">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search..."
                        value={search}
                        onValueChange={setSearch}
                    />

                    <CommandList>
                        {isFetching && (
                            <div className="p-2 text-sm text-muted-foreground">
                                Loading...
                            </div>
                        )}

                        <CommandEmpty>No results found.</CommandEmpty>

                        {options.map((option) => (
                            <CommandItem
                                key={option.id}
                                value={option.label}
                                onSelect={() => {
                                    onChange(option.id);
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === option.id ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {option.label}
                            </CommandItem>
                        ))}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
