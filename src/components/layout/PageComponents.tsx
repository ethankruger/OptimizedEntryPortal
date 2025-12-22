import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    children?: ReactNode; // For action buttons like Filter/Export
    className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10", className)}>
            <div className="space-y-2">
                <h1 className="text-3xl font-bold font-display tracking-tight text-white leading-tight">{title}</h1>
                {description && <p className="text-gray-400 text-sm leading-relaxed">{description}</p>}
            </div>
            {children && (
                <div className="flex items-center gap-4">
                    {children}
                </div>
            )}
        </div>
    );
}

interface PageContainerProps {
    children: ReactNode;
    className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
    return (
        <div className={cn("relative space-y-8 animate-fade-in text-white/90 w-full", className)}>

            <div className="relative z-10 space-y-8">
                {children}
            </div>
        </div>
    );
}
