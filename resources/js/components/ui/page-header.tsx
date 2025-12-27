import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    description?: React.ReactNode;
    actions?: React.ReactNode;
}

export function PageHeader({
    title,
    description,
    actions,
    children,
    className,
    ...props
}: PageHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between", className)} {...props}>
            <div className="grid gap-1">
                <h1 className="text-xl font-bold tracking-tight">{title}</h1>
                {description && (
                    <div className="text-muted-foreground text-sm">
                        {description}
                    </div>
                )}
            </div>
            {(actions || children) && (
                <div className="flex items-center gap-2">
                    {actions}
                    {children}
                </div>
            )}
        </div>
    );
}
