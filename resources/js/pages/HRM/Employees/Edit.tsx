import { Head, Link, useForm } from '@inertiajs/react';
import * as Employees from '@/actions/App/Http/Controllers/HRM/EmployeeController';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Employee {
    id: number;
    first_name: string;
    last_name: string;
    employee_id: string;
    email: string;
    phone: string;
    job_title: string;
    department_id: number;
    manager_id: number;
    user_id: number;
    join_date: string;
    status: string;
    gender: string;
    date_of_birth: string;
    address: string;
}

interface Props {
    employee: Employee;
    departments: any[];
    managers: any[];
    users: any[];
}

export default function EmployeeEdit({ employee, departments, managers, users }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        employee_id: employee.employee_id || '',
        email: employee.email || '',
        phone: employee.phone || '',
        job_title: employee.job_title || '',
        department_id: employee.department_id ? employee.department_id.toString() : '',
        manager_id: employee.manager_id ? employee.manager_id.toString() : '',
        user_id: employee.user_id ? employee.user_id.toString() : '',
        join_date: employee.join_date ? employee.join_date.split('T')[0] : '',
        status: employee.status || 'active',
        gender: employee.gender || '',
        date_of_birth: employee.date_of_birth ? employee.date_of_birth.split('T')[0] : '',
        address: employee.address || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(Employees.update.url(employee.id));
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'HRM', href: '/hrm' }, { title: 'Employees', href: Employees.index.url() }, { title: 'Edit', href: '#' }]}>
            <Head title={`Edit ${employee.first_name}`} />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-3xl mx-auto w-full">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight">Edit Employee</h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Professional Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Employee ID <span className="text-red-500">*</span></Label>
                                <Input value={data.employee_id} onChange={e => setData('employee_id', e.target.value)} />
                                {errors.employee_id && <div className="text-red-500 text-xs">{errors.employee_id}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>Job Title <span className="text-red-500">*</span></Label>
                                <Input value={data.job_title} onChange={e => setData('job_title', e.target.value)} />
                                {errors.job_title && <div className="text-red-500 text-xs">{errors.job_title}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>Department <span className="text-red-500">*</span></Label>
                                <Select value={data.department_id} onValueChange={val => setData('department_id', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map(d => (
                                            <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.department_id && <div className="text-red-500 text-xs">{errors.department_id}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>Reports To</Label>
                                <Select value={data.manager_id} onValueChange={val => setData('manager_id', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Manager" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {managers.map(m => (
                                            <SelectItem key={m.id} value={m.id.toString()}>{m.first_name} {m.last_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Join Date <span className="text-red-500">*</span></Label>
                                <Input type="date" value={data.join_date} onChange={e => setData('join_date', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={data.status} onValueChange={val => setData('status', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="on_leave">On Leave</SelectItem>
                                        <SelectItem value="terminated">Terminated</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2 md:col-span-2">
                                <Label>Link to User Account</Label>
                                <Select value={data.user_id} onValueChange={val => setData('user_id', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select System User" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {users.map(u => (
                                            <SelectItem key={u.id} value={u.id.toString()}>{u.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>First Name <span className="text-red-500">*</span></Label>
                                <Input value={data.first_name} onChange={e => setData('first_name', e.target.value)} />
                                {errors.first_name && <div className="text-red-500 text-xs">{errors.first_name}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input value={data.last_name} onChange={e => setData('last_name', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Email (Work) <span className="text-red-500">*</span></Label>
                                <Input type="email" value={data.email} onChange={e => setData('email', e.target.value)} />
                                {errors.email && <div className="text-red-500 text-xs">{errors.email}</div>}
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input value={data.phone} onChange={e => setData('phone', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Date of Birth</Label>
                                <Input type="date" value={data.date_of_birth} onChange={e => setData('date_of_birth', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Gender</Label>
                                <Select value={data.gender} onValueChange={val => setData('gender', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2 md:col-span-2">
                                <Label>Address</Label>
                                <Textarea value={data.address} onChange={e => setData('address', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="secondary" asChild>
                            <Link href={Employees.index.url()}>Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>Save Changes</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
