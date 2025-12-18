import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AccountNode {
  id: number;
  code: string;
  name: string;
  type: string;
  children?: AccountNode[];
}

interface PageProps {
  accounts: AccountNode[];
}

const AccountTree = ({ nodes, level = 0 }: { nodes: AccountNode[], level?: number }) => {
    return (
        <ul className={`pl-${level * 4} space-y-1`}>
            {nodes.map((account) => (
                <li key={account.id}>
                    <div className="flex items-center p-2 rounded hover:bg-muted/50">
                        <span className="font-mono text-sm mr-2">{account.code}</span>
                        <span className="font-medium flex-1">{account.name}</span>
                        <Badge variant="outline" className="text-xs">{account.type}</Badge>
                    </div>
                    {account.children && account.children.length > 0 && (
                        <div className="ml-4 border-l pl-2">
                             <AccountTree nodes={account.children} level={level + 1} />
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
};

export default function Hierarchy({ accounts }: PageProps) {
  return (
    <AppLayout breadcrumbs={[{ title: 'Accounting', href: '/accounting' }, { title: 'Account Hierarchy', href: '#' }]}>
      <Head title="Account Hierarchy" />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
         <h2 className="text-xl font-semibold tracking-tight">Chart of Accounts Hierarchy</h2>
         <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium">Structure</CardTitle>
            </CardHeader>
            <CardContent>
                {(!accounts || accounts.length === 0) ? (
                    <div className="text-muted-foreground p-4">No accounts defined.</div>
                ) : (
                    <AccountTree nodes={accounts} />
                )}
            </CardContent>
         </Card>
      </div>
    </AppLayout>
  );
}
