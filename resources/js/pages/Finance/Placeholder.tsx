import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface Props {
    title: string;
}

export default function Placeholder({ title }: Props) {
    return (
        <AppLayout>
            <Head title={title} />
            <div className="flex h-[calc(100vh-10rem)] items-center justify-center">
                <Card className="max-w-md w-full border-dashed border-2">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                        </div>
                        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center text-muted-foreground">
                        <p>Fitur ini sedang dalam tahap pengembangan intensif untuk memberikan pengalaman ERP terbaik bagi perusahaan Anda.</p>
                        <p className="mt-4 text-xs font-mono uppercase tracking-widest text-primary">Coming Soon</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
