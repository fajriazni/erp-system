import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
    title: string;
    description?: string;
    backUrl?: string;
    backLabel?: string;
    children?: React.ReactNode;
}

export function PageHeader({ title, description, backUrl, backLabel = "Back", children }: PageHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                {description && <p className="text-muted-foreground">{description}</p>}
            </div>
            <div className="flex items-center gap-2">
                {children}
                {backUrl && (
                    <Button variant="outline" asChild>
                        <Link href={backUrl}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {backLabel}
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}
