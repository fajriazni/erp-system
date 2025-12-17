import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';

interface Department {
    id: number;
    name: string;
    code: string;
}

interface Account {
    id: number;
    code: string;
    name: string;
}

interface Budget {
    id?: number;
    name: string;
    department_id: number | string;
    account_id: number | string | null;
    fiscal_year: number;
    period_type: string;
    period_number: number;
    amount: number;
    warning_threshold: number;
    is_strict: boolean;
    is_active: boolean;
}

interface Props {
    budget?: Budget;
    departments: Department[];
    accounts: Account[];
}

export default function BudgetForm({ budget, departments, accounts }: Props) {
    const isEditing = !!budget?.id;

    const { data, setData, post, put, processing, errors } = useForm({
        name: budget?.name || '',
        department_id: budget?.department_id?.toString() || '',
        account_id: budget?.account_id?.toString() || '',
        fiscal_year: budget?.fiscal_year || new Date().getFullYear(),
        period_type: budget?.period_type || 'annual',
        period_number: budget?.period_number || 1,
        amount: budget?.amount || 0,
        warning_threshold: budget?.warning_threshold || 80,
        is_strict: budget?.is_strict || false,
        is_active: budget?.is_active ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(`/finance/budgets/${budget.id}`);
        } else {
            post('/finance/budgets');
        }
    };

    const getPeriodOptions = () => {
        switch (data.period_type) {
            case 'quarterly':
                return [
                    { value: '1', label: 'Q1 (Jan-Mar)' },
                    { value: '2', label: 'Q2 (Apr-Jun)' },
                    { value: '3', label: 'Q3 (Jul-Sep)' },
                    { value: '4', label: 'Q4 (Oct-Dec)' },
                ];
            case 'monthly':
                return Array.from({ length: 12 }, (_, i) => ({
                    value: (i + 1).toString(),
                    label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' }),
                }));
            default:
                return [{ value: '1', label: 'Full Year' }];
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Finance', href: '/accounting' },
            { title: 'Budgets', href: '/finance/budgets' },
            { title: isEditing ? 'Edit' : 'Create' }
        ]}>
            <Head title={isEditing ? 'Edit Budget' : 'Create Budget'} />
            <div className="container mx-auto py-6">
                <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                    <Link href="/finance/budgets">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                    </Link>
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>{isEditing ? 'Edit Budget' : 'Create New Budget'}</CardTitle>
                        <CardDescription>
                            Define budget limits for departments. Encumbered amounts will be tracked from approved PRs/POs.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Label htmlFor="name">Budget Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., IT Department - 2024"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div>
                                    <Label htmlFor="department_id">Department *</Label>
                                    <Select
                                        value={data.department_id}
                                        onValueChange={(v) => setData('department_id', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept.id} value={dept.id.toString()}>
                                                    [{dept.code}] {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.department_id} />
                                </div>

                                <div>
                                    <Label htmlFor="account_id">Account (Optional)</Label>
                                    <Select
                                        value={data.account_id || ''}
                                        onValueChange={(v) => setData('account_id', v || null)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">No specific account</SelectItem>
                                            {accounts.map((acc) => (
                                                <SelectItem key={acc.id} value={acc.id.toString()}>
                                                    [{acc.code}] {acc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.account_id} />
                                </div>

                                <div>
                                    <Label htmlFor="fiscal_year">Fiscal Year *</Label>
                                    <Input
                                        id="fiscal_year"
                                        type="number"
                                        value={data.fiscal_year}
                                        onChange={(e) => setData('fiscal_year', parseInt(e.target.value))}
                                        min={2020}
                                        max={2100}
                                    />
                                    <InputError message={errors.fiscal_year} />
                                </div>

                                <div>
                                    <Label htmlFor="period_type">Period Type</Label>
                                    <Select
                                        value={data.period_type}
                                        onValueChange={(v) => {
                                            setData('period_type', v);
                                            setData('period_number', 1);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="annual">Annual</SelectItem>
                                            <SelectItem value="quarterly">Quarterly</SelectItem>
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.period_type} />
                                </div>

                                {data.period_type !== 'annual' && (
                                    <div>
                                        <Label htmlFor="period_number">Period</Label>
                                        <Select
                                            value={data.period_number.toString()}
                                            onValueChange={(v) => setData('period_number', parseInt(v))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {getPeriodOptions().map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.period_number} />
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="amount">Budget Amount *</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', parseFloat(e.target.value))}
                                        min={0}
                                        step="0.01"
                                    />
                                    <InputError message={errors.amount} />
                                </div>

                                <div>
                                    <Label htmlFor="warning_threshold">Warning Threshold (%)</Label>
                                    <Input
                                        id="warning_threshold"
                                        type="number"
                                        value={data.warning_threshold}
                                        onChange={(e) => setData('warning_threshold', parseFloat(e.target.value))}
                                        min={0}
                                        max={100}
                                    />
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Show warning when utilization reaches this percentage.
                                    </p>
                                    <InputError message={errors.warning_threshold} />
                                </div>
                            </div>

                            <div className="flex items-center gap-8 pt-4 border-t">
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="is_strict"
                                        checked={data.is_strict}
                                        onCheckedChange={(v) => setData('is_strict', v)}
                                    />
                                    <Label htmlFor="is_strict" className="cursor-pointer">
                                        Strict Mode
                                    </Label>
                                    <span className="text-sm text-muted-foreground ml-2">
                                        (Block transactions when budget exceeded)
                                    </span>
                                </div>

                                {isEditing && (
                                    <div className="flex items-center gap-2">
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(v) => setData('is_active', v)}
                                        />
                                        <Label htmlFor="is_active" className="cursor-pointer">
                                            Active
                                        </Label>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" type="button" onClick={() => history.back()}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {isEditing ? 'Update Budget' : 'Create Budget'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
