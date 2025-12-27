import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import NoteForm from './components/NoteForm';

interface Props {
    contacts: any[];
    defaultType: string;
    defaultEntityType: string;
    referenceNumber: string;
}

export default function Create({ contacts, defaultType, defaultEntityType, referenceNumber }: Props) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Accounting', href: '/accounting' },
                { title: 'Credit/Debit Notes', href: route('accounting.notes.index') },
                { title: 'Create', href: '#' },
            ]}
        >
            <Head title="Create Adjustment Note" />
            <NoteForm
                contacts={contacts}
                defaultType={defaultType}
                defaultEntityType={defaultEntityType}
                referenceNumber={referenceNumber}
            />
        </AppLayout>
    );
}
