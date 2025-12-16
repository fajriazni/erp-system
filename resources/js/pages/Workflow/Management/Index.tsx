import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, XCircle, Activity, Plus, Edit, Trash2 } from 'lucide-react';
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog';
import { toast } from 'sonner';

interface Workflow {
    id: number;
    name: string;
    module: string;
    is_active: boolean;
    instances_count: number;
    steps_count: number;
    creator: {
        name: string;
    };
}

export default function WorkflowManagement({ workflows = [] }: { workflows: Workflow[] }) {
    const handleDelete = (id: number) => {
        router.delete(`/workflows/${id}`, {
            onSuccess: () => {
                toast.success('Workflow deleted successfully');
            },
            onError: () => {
                toast.error('Failed to delete workflow');
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Workflow Management" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Workflow Management</h1>
                        <p className="text-muted-foreground text-sm">
                            Configure and manage approval workflows for your business processes
                        </p>
                    </div>
                    <Link href="/workflows/create">
                        <Button size="default">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Workflow
                        </Button>
                    </Link>
                </div>

                {/* Content */}
                {workflows.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent className="pt-6">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                                <Activity className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No workflows yet</h3>
                            <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                                Get started by creating your first approval workflow to automate your business processes.
                            </p>
                            <Link href="/workflows/create">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Your First Workflow
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workflows.map((workflow) => (
                            <Card key={workflow.id} className="hover:shadow-lg transition-all duration-200 border-border/50">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <CardTitle className="line-clamp-1">{workflow.name}</CardTitle>
                                            <CardDescription className="mt-1.5 flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs font-normal">
                                                    {workflow.module.charAt(0).toUpperCase() + workflow.module.slice(1)}
                                                </Badge>
                                            </CardDescription>
                                        </div>
                                        {workflow.is_active ? (
                                            <Badge variant="default" className="shrink-0">
                                                <CheckCircle className="mr-1 h-3 w-3" />
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="shrink-0">
                                                <XCircle className="mr-1 h-3 w-3" />
                                                Inactive
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-muted-foreground text-xs">Steps</span>
                                            <span className="font-semibold text-base">{workflow.steps_count}</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-muted-foreground text-xs">Instances</span>
                                            <span className="font-semibold text-base">{workflow.instances_count}</span>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t">
                                        <p className="text-xs text-muted-foreground">
                                            Created by <span className="font-medium text-foreground">{workflow.creator.name}</span>
                                        </p>
                                    </div>
                                </CardContent>
                                <div className="px-6 pb-4 flex gap-2">
                                    <Link href={`/workflows/${workflow.id}/edit`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Button>
                                    </Link>
                                    <DeleteConfirmDialog
                                        trigger={
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        }
                                        onConfirm={() => handleDelete(workflow.id)}
                                        title="Delete Workflow"
                                        description="Are you sure you want to delete this workflow? This action cannot be undone and will affect all associated instances."
                                    />
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
