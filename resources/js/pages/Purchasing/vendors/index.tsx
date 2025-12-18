import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Plus, Search, Building2, Mail, Phone, Star } from 'lucide-react';

interface Vendor {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    type: string;
    rating_score: number | null;
    on_time_rate: number | null;
    created_at: string;
}

interface Props {
    vendors: {
        data: Vendor[];
        links: any[];
    };
}

export default function VendorsIndex({ vendors }: Props) {
    const { data, setData, get, processing } = useForm({
        search: '',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        get('/purchasing/vendors', { preserveState: true });
    };

    const getRatingStars = (rating: number | null) => {
        if (!rating) return <span className="text-muted-foreground text-sm">No rating</span>;
        
        const stars = [];
        const fullStars = Math.floor(rating);
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400 inline" />);
            } else {
                stars.push(<Star key={i} className="h-3 w-3 text-gray-300 inline" />);
            }
        }
        return <div className="flex items-center gap-1">{stars} <span className="text-sm ml-1">{Number(rating).toFixed(1)}</span></div>;
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Purchasing', href: '/purchasing' }, { title: 'Suppliers', href: '#' }]}>
            <Head title="Supplier Registry" />
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Supplier Registry</h2>
                        <p className="text-muted-foreground">Manage your vendor and supplier information.</p>
                    </div>
                    <Button asChild>
                        <Link href="/purchasing/vendors/create">
                            <Plus className="mr-2 h-4 w-4" /> New Vendor
                        </Link>
                    </Button>
                </div>

                <div className="flex gap-4 items-center bg-card p-4 rounded-lg border">
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <Input
                            placeholder="Search vendors by name, email, or phone..."
                            value={data.search}
                            onChange={(e) => setData('search', e.target.value)}
                            className="max-w-sm"
                        />
                        <Button type="submit" variant="secondary" disabled={processing}>
                            <Search className="h-4 w-4 mr-2" /> Search
                        </Button>
                    </form>
                </div>

                <Card>
                    <CardHeader className="p-0" />
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Performance Rating</TableHead>
                                    <TableHead>On-Time Delivery</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {vendors.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No vendors found. Create your first vendor to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    vendors.data.map((vendor) => (
                                        <TableRow key={vendor.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-muted-foreground" />
                                                    {vendor.name}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm text-muted-foreground gap-1">
                                                    {vendor.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {vendor.email}</div>}
                                                    {vendor.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {vendor.phone}</div>}
                                                    {!vendor.email && !vendor.phone && <span>-</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {vendor.type === 'both' ? 'Vendor & Customer' : vendor.type.charAt(0).toUpperCase() + vendor.type.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {getRatingStars(vendor.rating_score)}
                                            </TableCell>
                                            <TableCell>
                                                {vendor.on_time_rate ? (
                                                    <Badge variant={Number(vendor.on_time_rate) >= 90 ? 'default' : 'secondary'} className={Number(vendor.on_time_rate) >= 90 ? 'bg-green-600' : ''}>
                                                        {Number(vendor.on_time_rate).toFixed(1)}%
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">N/A</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="ghost" asChild>
                                                    <Link href={`/purchasing/vendors/${vendor.id}`}>View Details</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {vendors.links && vendors.links.length > 3 && (
                    <div className="flex justify-center gap-1">
                        {vendors.links.map((link: any, index: number) => (
                            <Button
                                key={index}
                                size="sm"
                                variant={link.active ? 'default' : 'outline'}
                                disabled={!link.url}
                                onClick={() => link.url && get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
