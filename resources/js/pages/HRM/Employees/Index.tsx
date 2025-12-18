import { Head, Link, useForm } from '@inertiajs/react';
import * as Employees from '@/actions/App/Http/Controllers/HRM/EmployeeController';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, User, MoreHorizontal, Building2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    job_title: string;
    department?: { name: string };
    manager?: { first_name: string; last_name: string };
    status: string;
}

interface Props {
    employees: { data: Employee[]; links: any[] };
    departments: { id: number; name: string }[];
    filters: { search?: string; department_id?: string };
}

export default function EmployeesIndex({ employees, departments, filters }: Props) {
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
        department_id: filters.department_id || 'all',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get(Employees.index.url(), { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'HRM', href: '/hrm' }, { title: 'Employees', href: '#' }]}>
            <Head title="Employees" />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Employees</h2>
                        <p className="text-muted-foreground">Manage personnel data and records.</p>
                    </div>
                    <Button asChild>
                        <Link href={Employees.create.url()}>
                            <Plus className="mr-2 h-4 w-4" /> Add Employee
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, ID, or email..."
                                    className="pl-8"
                                    value={data.search}
                                    onChange={(e) => setData('search', e.target.value)}
                                />
                            </div>
                            <Select
                                value={data.department_id}
                                onValueChange={(val) => setData('department_id', val)}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept.id} value={dept.id.toString()}>
                                            {dept.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="submit" variant="secondary" disabled={processing}>
                                Filter
                            </Button>
                        </form>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee</TableHead>
                                    <TableHead>Job Title</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Manager</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employees.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No employees found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    employees.data.map((employee) => (
                                        <TableRow key={employee.id}>
                                            <TableCell className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <User className="h-5 w-5 text-slate-500" />
                                                </div>
                                                <div>
                                                    <div className="font-medium">{employee.first_name} {employee.last_name}</div>
                                                    <div className="text-xs text-muted-foreground">{employee.email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{employee.job_title}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-3 h-3 text-muted-foreground" />
                                                    {employee.department?.name || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {employee.manager ? (
                                                     <span className="text-sm">{employee.manager.first_name} {employee.manager.last_name}</span>
                                                ) : <span className="text-muted-foreground">-</span>}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                                                    {employee.status.toUpperCase()}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={Employees.show.url(employee.id)}>View Profile</Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={Employees.edit.url(employee.id)}>Edit Details</Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
