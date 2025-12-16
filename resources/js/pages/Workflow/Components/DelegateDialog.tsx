
import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check, ChevronsUpDown, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';
import { toast } from 'sonner';

interface User {
    id: number;
    name: string;
    email: string;
}

interface DelegateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    taskId: number | null;
    onSuccess: () => void;
}

export default function DelegateDialog({
    open,
    onOpenChange,
    taskId,
    onSuccess,
}: DelegateDialogProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [reason, setReason] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [openCombobox, setOpenCombobox] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (open) {
            fetchUsers('');
            setReason('');
            setSelectedUser(null);
        }
    }, [open]);

    // Debounce search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (open) fetchUsers(search);
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [search, open]);

    const fetchUsers = async (query: string) => {
        try {
            setLoading(true);
            const response = await axios.get('/approval-tasks/users', {
                params: { search: query },
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!taskId || !selectedUser) return;

        try {
            setSubmitting(true);
            await axios.post(`/approval-tasks/${taskId}/delegate`, {
                delegate_to_user_id: selectedUser.id,
                reason: reason,
            });
            
            toast.success('Task delegated successfully');
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error('Failed to delegate task', error);
            const msg = error.response?.data?.message || 'Failed to delegate task';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delegate Task</DialogTitle>
                    <DialogDescription>
                        Assign this task to another user for approval.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2 flex flex-col">
                        <Label>Delegate To</Label>
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCombobox}
                                    className="w-full justify-between"
                                >
                                    {selectedUser ? (
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="h-4 w-4 opacity-50" />
                                            {selectedUser.name}
                                        </div>
                                    ) : (
                                        "Select user..."
                                    )}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[380px] p-0">
                                <Command shouldFilter={false}>
                                    <CommandInput 
                                        placeholder="Search user..." 
                                        value={search}
                                        onValueChange={setSearch}
                                    />
                                    <CommandList>
                                        <CommandEmpty>{loading ? 'Loading...' : 'No users found.'}</CommandEmpty>
                                        <CommandGroup>
                                            {users.map((user) => (
                                                <CommandItem
                                                    key={user.id}
                                                    value={user.id.toString()}
                                                    onSelect={() => {
                                                        setSelectedUser(user);
                                                        setOpenCombobox(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            selectedUser?.id === user.id ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    <div className="flex flex-col">
                                                        <span>{user.name}</span>
                                                        <span className="text-xs text-muted-foreground">{user.email}</span>
                                                    </div>
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sc-reason">Reason (Optional)</Label>
                        <Textarea
                            id="sc-reason"
                            placeholder="Why are you delegating this task?"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting || !selectedUser}>
                        {submitting ? 'Delegating...' : 'Delegate Task'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
