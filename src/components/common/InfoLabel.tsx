export function Info({ label, value }) {
    return (
        <div className="flex flex-col">
            <span className="text-xs text-gray-500">{label}</span>
            <span className="font-medium">{value || "-"}</span>
        </div>
    );
}