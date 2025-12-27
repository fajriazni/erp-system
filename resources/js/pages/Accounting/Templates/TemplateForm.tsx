import { useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useEffect } from 'react';

interface Account {
    id: number;
    code: string;
    name: string;
    type: string;
    label: string;
}

interface TemplateLine {
    id?: number;
    chart_of_account_id: number | null;
    debit_credit: 'debit' | 'credit';
    amount_formula: string;
    description: string;
}

interface TemplateData {
    name: string;
    description: string;
    is_active: boolean;
    lines: TemplateLine[];
}

interface Props {
    accounts: Account[];
    initialData?: TemplateData;
    submitUrl: string;
    submitMethod?: 'post' | 'put';
    submitLabel?: string;
}

export default function TemplateForm({ 
    accounts, 
    initialData, 
    submitUrl, 
    submitMethod = 'post',
    submitLabel = 'Save Template'
}: Props) {
    const { data, setData, post, put, processing, errors } = useForm<TemplateData>({
        name: initialData?.name || '',
        description: initialData?.description || '',
        is_active: initialData?.is_active ?? true,
        lines: initialData?.lines || [
            { chart_of_account_id: null, debit_credit: 'debit', amount_formula: '', description: '' },
            { chart_of_account_id: null, debit_credit: 'credit', amount_formula: '', description: '' },
        ],
    });

    const addLine = () => {
        setData('lines', [...data.lines, {
            chart_of_account_id: null,
            debit_credit: 'debit',
            amount_formula: '',
            description: '',
        }]);
    };

    const removeLine = (index: number) => {
        if (data.lines.length > 2) {
            setData('lines', data.lines.filter((_, i) => i !== index));
        }
    };

    const moveLine = (index: number, direction: 'up' | 'down') => {
        const newLines = [...data.lines];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        if (targetIndex >= 0 && targetIndex < newLines.length) {
            [newLines[index], newLines[targetIndex]] = [newLines[targetIndex], newLines[index]];
            setData('lines', newLines);
        }
    };

    const updateLine = (index: number, field: keyof TemplateLine, value: any) => {
        const newLines = [...data.lines];
        newLines[index] = { ...newLines[index], [field]: value };
        setData('lines', newLines);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (submitMethod === 'put') {
            put(submitUrl);
        } else {
            post(submitUrl);
        }
    };

    const getSelectedAccount = (accountId: number | null) => {
        return accounts.find(a => a.id === accountId);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Template Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="name">Template Name *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="e.g., Monthly Rent Payment"
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="is_active" className="flex items-center gap-2">
                                <span>Active</span>
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                            </Label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Optional description for this template"
                            rows={3}
                        />
                        {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Template Lines</CardTitle>
                        <Button type="button" variant="outline" size="sm" onClick={addLine}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Line
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {errors.lines && typeof errors.lines === 'string' && (
                        <p className="text-sm text-red-600">{errors.lines}</p>
                    )}
                    
                    {data.lines.map((line, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Line {index + 1}</span>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => moveLine(index, 'up')}
                                        disabled={index === 0}
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => moveLine(index, 'down')}
                                        disabled={index === data.lines.length - 1}
                                    >
                                        <ArrowDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeLine(index)}
                                        disabled={data.lines.length <= 2}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Account *</Label>
                                    <Select
                                        value={line.chart_of_account_id?.toString() || ''}
                                        onValueChange={(value) => updateLine(index, 'chart_of_account_id', parseInt(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {accounts.map((account) => (
                                                <SelectItem key={account.id} value={account.id.toString()}>
                                                    {account.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Type *</Label>
                                    <Select
                                        value={line.debit_credit}
                                        onValueChange={(value: 'debit' | 'credit') => updateLine(index, 'debit_credit', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="debit">Debit</SelectItem>
                                            <SelectItem value="credit">Credit</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>Amount Formula</Label>
                                    <Input
                                        value={line.amount_formula}
                                        onChange={(e) => updateLine(index, 'amount_formula', e.target.value)}
                                        placeholder="e.g., total, total*0.10"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Leave empty for manual entry. Use "total" for calculated amounts.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Input
                                        value={line.description}
                                        onChange={(e) => updateLine(index, 'description', e.target.value)}
                                        placeholder="Optional line description"
                                    />
                                </div>
                            </div>

                            {line.chart_of_account_id && (
                                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                    Account Type: <span className="font-medium">{getSelectedAccount(line.chart_of_account_id)?.type}</span>
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="bg-muted/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                            <strong>Note:</strong> Template must have at least one debit line and one credit line. 
                            Lines can be reordered using the arrow buttons.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="flex gap-2 justify-end">
                <Button type="submit" disabled={processing}>
                    {processing ? 'Saving...' : submitLabel}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.visit('/accounting/templates')}
                >
                    Cancel
                </Button>
            </div>
        </form>
    );
}
