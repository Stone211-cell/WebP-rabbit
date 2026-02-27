"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Target, Loader2, X } from "lucide-react"

interface ActionButtonProps extends React.ComponentProps<typeof Button> {
    isSubmitting?: boolean;
    label?: string;
}

export function SaveButton({ isSubmitting = false, label = "บันทึก", className, ...props }: ActionButtonProps) {
    return (
        <Button
            disabled={isSubmitting || props.disabled}
            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold min-w-[100px] shadow-md flex items-center gap-1.5 transition-all ${className || ''}`}
            {...props}
        >
            {isSubmitting ? (
                <>
                    <Loader2 size={16} className="animate-spin" />
                    กำลังบันทึก...
                </>
            ) : (
                <>
                    <Target size={16} />
                    {label}
                </>
            )}
        </Button>
    )
}

export function CancelButton({ label = "ยกเลิก", className, ...props }: ActionButtonProps) {
    return (
        <Button
            variant="ghost"
            className={`hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 font-bold border border-slate-200 dark:border-slate-800 transition-all ${className || ''}`}
            {...props}
        >
            <X size={16} className="mr-1" />
            {label}
        </Button>
    )
}
