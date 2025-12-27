import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import NoteForm from './components/NoteForm';

interface Props {
    note: any;
    contacts: any[];
}

export default function Edit({ note, contacts }: Props) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Accounting', href: '/accounting' },
                { title: 'Credit/Debit Notes', href: route('accounting.notes.index') },
                { title: note.reference_number, href: route('accounting.notes.show', note.id) },
                { title: 'Edit', href: '#' },
            ]}
        >
            <Head title={`Edit ${note.reference_number}`} />
            <NoteForm 
                note={note}
                contacts={contacts} 
            />
        </AppLayout>
    );
}
