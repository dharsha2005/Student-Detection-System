
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UserPlus, LogOut, GraduationCap } from 'lucide-react';
import { signOut } from 'next-auth/react';
import clsx from 'clsx';

export function Sidebar() {
    const pathname = usePathname();

    const routes = [
        {
            label: 'Dashboard',
            icon: LayoutDashboard,
            href: '/dashboard',
            active: pathname === '/dashboard',
        },
        {
            label: 'Students List',
            icon: Users,
            href: '/students',
            active: pathname === '/students',
        },
        {
            label: 'Add Student',
            icon: UserPlus,
            href: '/students/add',
            active: pathname === '/students/add',
        },
    ];

    return (
        <div className="flex flex-col h-full bg-slate-900 text-white w-64 fixed left-0 top-0 overflow-y-auto">
            <div className="p-6 flex items-center gap-2">
                <GraduationCap className="w-8 h-8 text-blue-400" />
                <h1 className="text-xl font-bold">Student AI</h1>
            </div>

            <div className="flex-1 px-4 py-4 space-y-2">
                {routes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={clsx(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                            route.active
                                ? "bg-blue-600 text-white"
                                : "text-slate-400 hover:text-white hover:bg-slate-800"
                        )}
                    >
                        <route.icon className="w-5 h-5" />
                        <span className="font-medium">{route.label}</span>
                    </Link>
                ))}
            </div>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
    );
}
