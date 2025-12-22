import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, FileText, FileCheck, FileSpreadsheet, Truck, Receipt } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

interface Props {
    type: 'pr' | 'rfq' | 'quote' | 'po' | 'gr' | 'bill';
    id: number;
}

interface Node {
    id: string; // e.g., "po-10"
    type: string;
    entity_id: number;
    label: string;
    status: string;
}

interface Edge {
    source: string;
    target: string;
}

interface GraphData {
    nodes: Node[];
    edges: Edge[];
}

export default function DocumentFlow({ type, id }: Props) {
    const [data, setData] = useState<GraphData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`/purchasing/document-flow/${type}/${id}`)
            .then(res => setData(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [type, id]);

    if (loading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>;
    if (!data || data.nodes.length === 0) return null;

    // Group nodes by Level for column layout
    const levels = {
        pr: data.nodes.filter(n => n.type === 'pr'),
        rfq: data.nodes.filter(n => n.type === 'rfq'),
        quote: data.nodes.filter(n => n.type === 'quote'),
        po: data.nodes.filter(n => n.type === 'po'),
        fulfillment: data.nodes.filter(n => ['gr', 'bill'].includes(n.type)),
    };

    const hasData = (nodes: Node[]) => nodes.length > 0;

    const renderNode = (node: Node) => {
        const isActive = node.type === type && node.entity_id === id;
        
        let Icon = FileText;
        let color = "bg-gray-100 text-gray-600";
        let linkRoute = "#";

        switch (node.type) {
            case 'pr': 
                Icon = FileText; 
                color = "bg-blue-100 text-blue-600";
                linkRoute = `/purchasing/requests/${node.entity_id}`;
                break;
            case 'rfq': 
                Icon = FileSpreadsheet; 
                color = "bg-purple-100 text-purple-600"; 
                linkRoute = `/purchasing/rfqs/${node.entity_id}`;
                break;
            case 'quote': 
                Icon = FileCheck; 
                color = "bg-indigo-100 text-indigo-600";
                // Quote show route might vary, assume generic or handle if missing
                linkRoute = "#"; 
                break;
            case 'po': 
                Icon = FileText; 
                color = "bg-emerald-100 text-emerald-600";
                linkRoute = `/purchasing/orders/${node.entity_id}`;
                break;
            case 'gr': 
                Icon = Truck; 
                color = "bg-orange-100 text-orange-600";
                linkRoute = `/purchasing/receipts/${node.entity_id}`;
                break;
            case 'bill': 
                Icon = Receipt; 
                color = "bg-red-100 text-red-600";
                linkRoute = `/accounting/bills/${node.entity_id}`;
                break;
        }

        return (
            <Link 
                key={node.id} 
                href={linkRoute}
                className={cn(
                    "flex flex-col items-center p-3 rounded-lg border text-center text-sm hover:shadow-md transition-all min-w-[120px]",
                    isActive ? "border-primary ring-2 ring-primary/20 bg-primary/5" : "border-border bg-card"
                )}
            >
                <div className={cn("p-2 rounded-full mb-2", color)}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="font-medium truncate max-w-[150px]">{node.label}</div>
                <Badge variant="outline" className="mt-1 text-[10px] px-1 py-0 h-5">
                    {node.status}
                </Badge>
            </Link>
        );
    };

    const renderColumn = (title: string, nodes: Node[]) => {
        if (nodes.length === 0) return null;
        return (
            <div className="flex flex-col gap-4 items-center">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</div>
                <div className="flex flex-col gap-3">
                    {nodes.map(renderNode)}
                </div>
            </div>
        );
    };

    const Arrow = () => <div className="flex items-center justify-center text-muted-foreground w-8"><ArrowRight className="h-4 w-4" /></div>;

    return (
        <Card className="w-full overflow-x-auto">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg">Document Flow</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-start gap-2 min-w-max p-4">
                    {hasData(levels.pr) && (
                        <>
                            {renderColumn("Requisitions", levels.pr)}
                            {(hasData(levels.rfq) || hasData(levels.po)) && <Arrow />}
                        </>
                    )}

                    {hasData(levels.rfq) && (
                        <>
                            {renderColumn("RFQs", levels.rfq)}
                            <Arrow />
                            {hasData(levels.quote) && (
                                <>
                                    {renderColumn("Quotations", levels.quote)}
                                    <Arrow />
                                </>
                            )}
                        </>
                    )}

                    {hasData(levels.po) && (
                        <>
                            {renderColumn("Purchase Orders", levels.po)}
                            {hasData(levels.fulfillment) && <Arrow />}
                        </>
                    )}

                    {hasData(levels.fulfillment) && renderColumn("Fulfillment", levels.fulfillment)}
                </div>
            </CardContent>
        </Card>
    );
}
