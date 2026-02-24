'use client'

import { useMemo, useState } from 'react'

/**
 * useSearch — Generic local filter hook for list data.
 *
 * สร้าง filtered list จากข้อมูลที่ส่งเข้ามา
 * โดยรับ array ของ field paths (dot-notation) ที่จะนำมา search
 *
 * @example
 * const { search, setSearch, filtered } = useSearch(visits, ['store.name', 'store.code', 'sales'])
 */
export function useSearch<T = any>(
    data: T[],
    fields: string[],
    extraFilter?: (item: T) => boolean
) {
    const [search, setSearch] = useState('')

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase()
        return (data || []).filter((item) => {
            const matchSearch = !q || fields.some((field) => {
                const val = getNestedValue(item, field)
                return String(val ?? '').toLowerCase().includes(q)
            })
            const matchExtra = extraFilter ? extraFilter(item) : true
            return matchSearch && matchExtra
        })
    }, [data, search, fields, extraFilter])

    return { search, setSearch, filtered }
}

/** ดึงค่าจาก nested object ด้วย dot-notation path */
function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, key) => acc?.[key], obj)
}
