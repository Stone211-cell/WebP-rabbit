'use client'

import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { ModeToggle } from "./theme/btnmodetoggle";

export default function Header() {
    const { isSignedIn, isLoaded } = useUser();

    return (
        <header className="flex justify-end items-center p-4 gap-4 h-16 dark:bg-[#1b2433] dark:text-white transition-all duration-300">

            {/* Loading State - Prevents layout shift */}
            {!isLoaded && (
                <div className="flex gap-4">
                    <div className="w-20 h-10 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse transition-all"></div>
                    <div className="w-20 h-10 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse transition-all"></div>
                </div>
            )}

            {/* Unauthenticated State */}
            {isLoaded && !isSignedIn && (
                <div className="flex gap-4 animate-in fade-in zoom-in-95 duration-300">
                    <SignInButton mode="modal">
                        <button className="bg-white text-black border border-slate-200 dark:border-slate-800 rounded-full font-bold text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-6 hover:bg-slate-50 transition-colors shadow-sm">
                            Sign In
                        </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                        <button className="bg-[#6c47ff] text-white rounded-full font-bold text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-6 hover:bg-[#5835eb] transition-colors shadow-sm shadow-[#6c47ff]/20">
                            Sign Up
                        </button>
                    </SignUpButton>
                </div>
            )}

            {/* Authenticated State */}
            {isLoaded && isSignedIn && (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: "w-10 h-10 sm:w-11 sm:h-11 shadow-sm border-2 border-white dark:border-slate-800"
                            }
                        }}
                    />
                </div>
            )}

            <div className="ml-2 border-l border-slate-200 dark:border-slate-700 pl-4 h-8 flex items-center">
                <ModeToggle />
            </div>
        </header>
    );
}
