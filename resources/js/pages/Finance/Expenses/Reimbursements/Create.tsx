import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import InputError from '@/components/input-error';

interface Department {
    id: number;
    name: string;
    code: string;
}

interface ExpenseItem {
    date: string;
    category: string;
    description: string;
    amount: number;
}

interface Props {
    departments: Department[];
}

export default function ExpenseCreate({ departments }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        department_id: '',
        description: '',
        items: [] as ExpenseItem[],
    });

    // Temp state for new item row
    const [newItem, setNewItem] = React.useState<ExpenseItem>({
        date: new Date().toISOString().split('T')[0],
        category: 'Meals',
        description: '',
        amount: 0,
    });

    const addItem = () => {
        if (!newItem.description || newItem.amount <= 0) return;
        setData('items', [...data.items, newItem]);
        setNewItem({
            date: new Date().toISOString().split('T')[0],
            category: 'Meals',
            description: '',
            amount: 0,
        });
    };

    const removeItem = (index: number) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/finance/expenses/reimbursements');
    };

    const totalAmount = data.items.reduce((sum, item) => sum + item.amount, 0);

    return (
        <AppLayout breadcrumbs={[
            { title: 'Finance', href: '/accounting' },
            { title: 'Reimbursements', href: '/finance/expenses/reimbursements' },
            { title: 'Create Claim' }
        ]}>
            <Head title="New Expense Claim" />
            <div className="container mx-auto py-6">
                <Button variant="ghost" asChild className="mb-4 pl-0 hover:pl-2 transition-all">
                    <Link href="/finance/expenses/reimbursements">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
                    </Link>
                </Button>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Claim Details</CardTitle>
                            <CardDescription>Enter general information about your expense claim.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 md:col-span-1">
                                <Label htmlFor="title">Claim Title *</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. October Client Visit"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                />
                                <InputError message={errors.title} />
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <Label htmlFor="department">Department *</Label>
                                <Select
                                    value={data.department_id}
                                    onValueChange={(v) => setData('department_id', v)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Department" />
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

                            <div className="col-span-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Additional context..."
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                <InputError message={errors.description} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Expense Items</CardTitle>
                            <CardDescription>Add individual receipts or expenses.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Simple Add Row */}
                            <div className="grid grid-cols-12 gap-2 items-end mb-4 p-4 bg-muted/20 rounded-lg">
                                <div className="col-span-2">
                                    <Label className="text-xs">Date</Label>
                                    <Input
                                        type="date"
                                        value={newItem.date}
                                        onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-xs">Category</Label>
                                    <Select
                                        value={newItem.category}
                                        onValueChange={(v) => setNewItem({ ...newItem, category: v })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Meals">Meals</SelectItem>
                                            <SelectItem value="Transport">Transport</SelectItem>
                                            <SelectItem value="Accommodation">Accommodation</SelectItem>
                                            <SelectItem value="Supplies">Supplies</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-5">
                                    <Label className="text-xs">Description</Label>
                                    <Input
                                        placeholder="Lunch with client..."
                                        value={newItem.description}
                                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <Label className="text-xs">Amount</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={newItem.amount}
                                        onChange={(e) => setNewItem({ ...newItem, amount: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="col-span-1">
                                    <Button type="button" size="icon" onClick={addItem}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <InputError message={errors.items} />

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                                                No items added.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data.items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.date}</TableCell>
                                                <TableCell>{item.category}</TableCell>
                                                <TableCell>{item.description}</TableCell>
                                                <TableCell className="text-right">
                                                    Rp {item.amount.toLocaleString('id-ID')}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeItem(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                    <TableRow className="font-bold">
                                        <TableCell colSpan={3} className="text-right">Total</TableCell>
                                        <TableCell className="text-right">
                                            Rp {totalAmount.toLocaleString('id-ID')}
                                        </TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>

                            <div className="flex justify-end gap-2 mt-6">
                                <Button variant="outline" type="button" onClick={() => history.back()}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing || data.items.length === 0}>
                                    Create Draft
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}
