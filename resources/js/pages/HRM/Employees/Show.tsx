import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import * as Employees from '@/actions/App/Http/Controllers/HRM/EmployeeController';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Building2, Edit } from 'lucide-react';

interface Employee {
    id: number;
    employee_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    job_title: string;
    department: { name: string };
    manager: { first_name: string; last_name: string };
    status: string;
    join_date: string;
    address: string;
}

interface Props {
    employee: Employee;
}

export default function EmployeeShow({ employee }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'HRM', href: '/hrm' }, { title: 'Employees', href: Employees.index.url() }, { title: employee.first_name, href: '#' }]}>
            <Head title={`${employee.first_name} ${employee.last_name || ''}`} />
            
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-4xl mx-auto w-full">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{employee.first_name} {employee.last_name}</h2>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                            <span>{employee.job_title}</span>
                            <span>•</span>
                            <span>{employee.employee_id}</span>
                        </div>
                    </div>
                    <Button asChild>
                        <Link href={Employees.edit.url(employee.id)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit Details
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Basic Info */}
                    <Card className="md:col-span-1">
                        <CardHeader className="text-center">
                            <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto flex items-center justify-center mb-4">
                                <User className="w-12 h-12 text-slate-400" />
                            </div>
                            <CardTitle>{employee.first_name} {employee.last_name}</CardTitle>
                            <CardDescription>{employee.email}</CardDescription>
                            <div className="pt-2">
                                <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                                    {employee.status.toUpperCase()}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Separator />
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span>{employee.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span>{employee.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-start gap-3 text-sm">
                                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                                <span>{employee.address || 'N/A'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Column: Key Details */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle>Employment Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-muted-foreground">Department</div>
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-slate-500" />
                                        <span>{employee.department?.name || '-'}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-muted-foreground">Reports To</div>
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-slate-500" />
                                        <span>{employee.manager ? `${employee.manager.first_name} ${employee.manager.last_name}` : '-'}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-muted-foreground">Date of Joining</div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-500" />
                                        <span>{new Date(employee.join_date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-muted-foreground">Employee Type</div>
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-slate-500" />
                                        <span>Full-Time</span>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h3 className="text-md font-medium mb-3">Professional Bio</h3>
                                <p className="text-sm text-muted-foreground">
                                    No bio available.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
