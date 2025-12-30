
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, RefreshCw, ArrowRightLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Currency {
    code: string;
    name: string;
    symbol: string;
    is_active: boolean;
}

interface ExchangeRate {
    from_currency: string;
    to_currency: string;
    rate: string;
    effective_date: string;
}

interface Props {
    currencies: Currency[];
    latestRates: ExchangeRate[];
    baseCurrency: string;
}

export default function CurrencyIndex({ currencies, latestRates, baseCurrency }: Props) {
    const [addCurrencyOpen, setAddCurrencyOpen] = useState(false);
    const [updateRateOpen, setUpdateRateOpen] = useState(false);

    const toggleActive = (currency: Currency) => {
        router.put(route('finance.currency.update', currency.code), {
            is_active: !currency.is_active,
            name: currency.name,
            symbol: currency.symbol
        });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Finance', href: '/finance' },
            { title: 'Multi-Currency', href: '/finance/currency' }
        ]}>
            <Head title="Multi-Currency Management" />

            <div className="container mx-auto p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Multi-Currency Management</h1>
                        <p className="text-muted-foreground">Manage supported currencies and daily exchange rates.</p>
                    </div>
                </div>

                <Tabs defaultValue="currencies" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="currencies">Currencies</TabsTrigger>
                        <TabsTrigger value="rates">Exchange Rates</TabsTrigger>
                    </TabsList>

                    <TabsContent value="currencies" className="space-y-4">
                        <div className="flex justify-end">
                             <Button onClick={() => setAddCurrencyOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" /> Add Currency
                            </Button>
                        </div>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Symbol</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {currencies.map((currency) => (
                                        <TableRow key={currency.code}>
                                            <TableCell className="font-bold">{currency.code}</TableCell>
                                            <TableCell>{currency.name}</TableCell>
                                            <TableCell>{currency.symbol}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={currency.is_active ? 'default' : 'secondary'}>
                                                    {currency.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Switch 
                                                    checked={currency.is_active}
                                                    onCheckedChange={() => toggleActive(currency)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </TabsContent>

                    <TabsContent value="rates" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Latest Rates (to {baseCurrency})</h3>
                             <Button onClick={() => setUpdateRateOpen(true)} variant="outline">
                                <RefreshCw className="mr-2 h-4 w-4" /> Update Rate
                            </Button>
                        </div>
                        
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {latestRates.map((rate, idx) => (
                                <Card key={idx}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            {rate.from_currency}/{rate.to_currency}
                                        </CardTitle>
                                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {Number(rate.rate).toLocaleString('id-ID')}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Effective: {formatDate(rate.effective_date)}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                            {latestRates.length === 0 && (
                                <div className="text-muted-foreground text-sm col-span-3">No exchange rates recorded.</div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <AddCurrencyModal open={addCurrencyOpen} onOpenChange={setAddCurrencyOpen} />
            <UpdateRateModal open={updateRateOpen} onOpenChange={setUpdateRateOpen} currencies={currencies} />
        </AppLayout>
    );
}

interface ModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function AddCurrencyModal({ open, onOpenChange }: ModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        name: '',
        symbol: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('finance.currency.store'), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Currency</DialogTitle>
                    <DialogDescription>Add a new currency to the system.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Code (ISO 3)</Label>
                        <Input 
                            placeholder="e.g. JPY" 
                            value={data.code}
                            maxLength={3}
                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
                        />
                        {errors.code && <p className="text-destructive text-xs">{errors.code}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input 
                            placeholder="e.g. Japanese Yen" 
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                         {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Symbol</Label>
                        <Input 
                            placeholder="e.g. ¥" 
                            value={data.symbol}
                            onChange={(e) => setData('symbol', e.target.value)}
                        />
                         {errors.symbol && <p className="text-destructive text-xs">{errors.symbol}</p>}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={processing}>Add Currency</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

interface UpdateRateModalProps extends ModalProps {
    currencies: Currency[];
}

function UpdateRateModal({ open, onOpenChange, currencies }: UpdateRateModalProps) {
    const activeCurrencies = currencies.filter(c => c.is_active);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        from_currency: '',
        to_currency: 'IDR',
        rate: '',
        effective_date: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('finance.currency.rate.store'), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Exchange Rate</DialogTitle>
                    <DialogDescription>Set a new exchange rate for a specific date.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>From</Label>
                             <Select value={data.from_currency} onValueChange={(val) => setData('from_currency', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeCurrencies.map(c => (
                                        <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.from_currency && <p className="text-destructive text-xs">{errors.from_currency}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>To</Label>
                            <Select value={data.to_currency} onValueChange={(val) => setData('to_currency', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeCurrencies.map(c => (
                                        <SelectItem key={c.code} value={c.code}>{c.code} - {c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                             {errors.to_currency && <p className="text-destructive text-xs">{errors.to_currency}</p>}
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Rate (1 {data.from_currency || 'Unit'} = ? {data.to_currency || 'Unit'})</Label>
                        <Input 
                            type="number" 
                            step="0.000001"
                            placeholder="e.g. 15000"
                            value={data.rate}
                            onChange={(e) => setData('rate', e.target.value)}
                        />
                         {errors.rate && <p className="text-destructive text-xs">{errors.rate}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Effective Date</Label>
                        <Input 
                            type="date"
                            value={data.effective_date}
                            onChange={(e) => setData('effective_date', e.target.value)}
                        />
                        {errors.effective_date && <p className="text-destructive text-xs">{errors.effective_date}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" disabled={processing}>Save Rate</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
