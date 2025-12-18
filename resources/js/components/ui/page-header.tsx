import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    description?: string;
}

export function PageHeader({
    title,
    description,
    children,
    className,
    ...props
}: PageHeaderProps) {
    return (
        <div className={cn("flex items-center justify-between", className)} {...props}>
            <div className="grid gap-1">
                <h1 className="text-xl font-bold tracking-tight">{title}</h1>
                {description && (
                    <p className="text-muted-foreground text-sm">
                        {description}
                    </p>
                )}
            </div>
            {children}
        </div>
    );
}
