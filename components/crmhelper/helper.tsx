import { Button } from "../ui/button"

export function FilterButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`
        flex items-center justify-center py-4 px-4 rounded-lg text-sm font-medium transition-all duration-200 border
        ${active
                    ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white dark:bg-[#0f172a] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }
      `}
        >
            {icon}
            {label}
        </button>
    )
}

import { cn } from "@/lib/utils"

export function ActionButton({
    label,
    icon,
    onClick,
    className,
    variant = "outline",
    size = "default",
    type = "button"
}: {
    label?: string | React.ReactNode,
    icon?: React.ReactNode,
    onClick?: () => void,
    className?: string,
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link",
    size?: "default" | "sm" | "lg" | "icon",
    type?: "button" | "submit" | "reset"
}) {
    return (
        <Button
            type={type}
            onClick={onClick}
            variant={variant}
            size={size}
            className={cn(
                variant === "outline" ? "bg-white dark:bg-[#1e293b] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" : "",
                "transition-colors",
                className
            )}
        >
            {icon && icon}
            {label && <span className={icon ? "ml-2" : ""}>{label}</span>}
        </Button>
    )
}