import { useState } from "react"
import { router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Search } from "lucide-react"

interface AccountingPeriod {
    id: number
    name: string
    start_date: string
    end_date: string
    status: string
}

interface ReportFiltersProps {
    periods: AccountingPeriod[]
    reportUrl: string
    filterType: 'single-date' | 'date-range'
    initialFilters?: {
        period_id?: number
        as_of_date?: string
        start_date?: string
        end_date?: string
    }
    additionalFilters?: React.ReactNode
}

export function ReportFilters({ 
    periods, 
    reportUrl, 
    filterType,
    initialFilters = {},
    additionalFilters 
}: ReportFiltersProps) {
    const [mode, setMode] = useState<'period' | 'custom'>('period')
    const [formData, setFormData] = useState({
        period_id: initialFilters.period_id?.toString() || "",
        as_of_date: initialFilters.as_of_date || "",
        start_date: initialFilters.start_date || "",
        end_date: initialFilters.end_date || ""
    })

    const handlePeriodChange = (periodId: string) => {
        const period = periods.find(p => p.id === parseInt(periodId))
        if (period) {
            setFormData(prev => ({
                ...prev,
                period_id: periodId,
                as_of_date: period.end_date,
                start_date: period.start_date,
                end_date: period.end_date
            }))
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        
        const params: Record<string, string> = {}
        
        if (mode === 'period' && formData.period_id) {
            const period = periods.find(p => p.id === parseInt(formData.period_id))
            if (period) {
                if (filterType === 'single-date') {
                    params.as_of_date = period.end_date
                } else {
                    params.start_date = period.start_date
                    params.end_date = period.end_date
                }
            }
        } else {
            if (filterType === 'single-date' && formData.as_of_date) {
                params.as_of_date = formData.as_of_date
            } else if (filterType === 'date-range') {
                if (formData.start_date) params.start_date = formData.start_date
                if (formData.end_date) params.end_date = formData.end_date
            }
        }

        router.get(reportUrl, params, {
            preserveState: true,
            preserveScroll: true
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Report Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Mode Toggle */}
                    <RadioGroup value={mode} onValueChange={(val) => setMode(val as 'period' | 'custom')}>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="period" id="mode-period" />
                                <Label htmlFor="mode-period" className="font-normal cursor-pointer">
                                    Quick Period
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="custom" id="mode-custom" />
                                <Label htmlFor="mode-custom" className="font-normal cursor-pointer">
                                    Custom Range
                                </Label>
                            </div>
                        </div>
                    </RadioGroup>

                    {/* Conditional Fields */}
                    <div className="grid gap-4 md:grid-cols-3">
                        {mode === 'period' ? (
                            <>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="period">Select Period</Label>
                                    <Select 
                                        value={formData.period_id} 
                                        onValueChange={handlePeriodChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose accounting period" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {periods.map(period => (
                                                <SelectItem key={period.id} value={period.id.toString()}>
                                                    {period.name} ({new Date(period.start_date).toLocaleDateString('id-ID')} - {new Date(period.end_date).toLocaleDateString('id-ID')})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        ) : (
                            <>
                                {filterType === 'single-date' ? (
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="as_of_date">As of Date</Label>
                                        <Input
                                            id="as_of_date"
                                            type="date"
                                            value={formData.as_of_date}
                                            onChange={(e) => setFormData(prev => ({ ...prev, as_of_date: e.target.value }))}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="start_date">Start Date</Label>
                                            <Input
                                                id="start_date"
                                                type="date"
                                                value={formData.start_date}
                                                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="end_date">End Date</Label>
                                            <Input
                                                id="end_date"
                                                type="date"
                                                value={formData.end_date}
                                                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                                            />
                                        </div>
                                    </>
                                )}
                            </>
                        )}

                        {/* Additional Filters (if any) */}
                        {additionalFilters}

                        {/* Submit Button */}
                        <div className="flex items-end">
                            <Button type="submit" className="w-full">
                                <Search className="mr-2 h-4 w-4" />
                                Generate Report
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
