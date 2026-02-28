import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"

interface HistorySearchFilterProps {
    search: string;
    onSearchChange: (value: string) => void;
    salesFilter: string;
    onSalesFilterChange: (value: string) => void;
    profiles: any[];
    searchLabel?: string;
    searchPlaceholder?: string;
    salesFilterLabel?: string;
}

export function HistorySearchFilter({
    search,
    onSearchChange,
    salesFilter,
    onSalesFilterChange,
    profiles,
    searchLabel = "ค้นหาประวัติ",
    searchPlaceholder = "รหัส / ชื่อร้าน / รายละเอียด...",
    salesFilterLabel = "กรอกตามรายชื่อเซลล์"
}: HistorySearchFilterProps) {
    return (
        <div className="flex flex-col md:flex-row gap-6 mb-6 mt-2 p-6 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-[2rem] shadow-sm">
            <div className="flex-1 space-y-1.5">
                <Label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="p-1 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400">🔍</span>
                    {searchLabel}
                </Label>
                <Input
                    placeholder={searchPlaceholder}
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="bg-white/70 dark:bg-slate-800/70 h-12 rounded-2xl text-slate-800 dark:text-white border-white/40 dark:border-slate-700/50 shadow-inner focus-visible:ring-blue-500/30 font-medium"
                />
            </div>

            <div className="w-full md:w-1/3 space-y-1.5">
                <Label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="p-1 bg-indigo-100 dark:bg-indigo-900/30 rounded text-indigo-600 dark:text-indigo-400">👤</span>
                    {salesFilterLabel}
                </Label>
                <Select value={salesFilter} onValueChange={onSalesFilterChange}>
                    <SelectTrigger className="bg-white/70 dark:bg-slate-800/70 h-12 rounded-2xl text-slate-800 dark:text-white border-white/40 dark:border-slate-700/50 shadow-inner focus:ring-indigo-500/30 font-medium">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">ทั้งหมด (All Units)</SelectItem>
                        {profiles?.map((p: any) => (
                            <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
