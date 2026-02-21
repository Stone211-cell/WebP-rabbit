'use client'

import { useUser } from "@clerk/nextjs"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ProfileCheck() {
    const { user, isLoaded } = useUser()
    const router = useRouter()
    const pathname = usePathname()
    const [hasProfile, setHasProfile] = useState<boolean | null>(null)

    useEffect(() => {
        if (!isLoaded || !user) return

        // Call server-side API to read privateMetadata (client cannot access it directly)
        fetch('/api/profile/check')
            .then(res => res.json())
            .then(data => setHasProfile(!!data.hasProfile))
            .catch(() => setHasProfile(false))
    }, [isLoaded, user])

    useEffect(() => {
        if (hasProfile === null) return // still loading

        const isProfileRoute = pathname === '/profilecreate'

        // 1. If user doesn't have a profile AND is NOT on the creation page -> Force them there
        if (!hasProfile && !isProfileRoute) {
            router.replace('/profilecreate')
        }

        // 2. If user already has a profile AND tries to access the creation page -> Kick them out
        if (hasProfile && isProfileRoute) {
            router.replace('/')
        }
    }, [hasProfile, pathname, router])

    return null // This is a logic-only component, it renders nothing
}
