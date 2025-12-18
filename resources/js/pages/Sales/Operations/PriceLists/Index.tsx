import { Head, Link } from '@inertiajs/react';
import * as PriceLists from '@/actions/App/Http/Controllers/Sales/Operations/PriceListController';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Tags } from 'lucide-react';

interface PriceList {
    id: number;
    name: string;
    currency: string;
    is_active: boolean;
    items_count: number;
}

interface Props {
    priceLists: {
        data: PriceList[];
        links: any[];
    };
}

export default function PriceListsIndex({ priceLists }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Sales', href: '/sales' }, { title: 'Price Lists', href: '#' }]}>
            <Head title="Price Lists" />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Price Lists</h2>
                        <p className="text-muted-foreground">Manage product pricing tiers.</p>
                    </div>
                    <Button asChild>
                        <Link href={PriceLists.create.url()}>
                            <Plus className="mr-2 h-4 w-4" /> New Price List
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader className="p-0" />
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Currency</TableHead>
                                    <TableHead>Items</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {priceLists.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No price lists found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    priceLists.data.map((list) => (
                                        <TableRow key={list.id}>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                <Tags className="w-4 h-4 text-muted-foreground" />
                                                {list.name}
                                            </TableCell>
                                            <TableCell>{list.currency}</TableCell>
                                            <TableCell>{list.items_count} items</TableCell>
                                            <TableCell>
                                                <Badge variant={list.is_active ? 'default' : 'secondary'}>
                                                    {list.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                 <Button variant="ghost" size="sm" asChild>
                                                    <Link href="#">View</Link>
                                                </Button>
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
