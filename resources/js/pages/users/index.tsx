import React from 'react';
import { Head } from '@inertiajs/react';
import { usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Archive, RotateCcw, Shield } from 'lucide-react';
import { router } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';
import ConfirmModal from '@/components/confirm-modal';
import { useState } from 'react';

interface UserAccount {
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
}

interface PageProps {
    users: UserAccount[];
    breadcrumbs: BreadcrumbItem[];
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
        };
    };
    [key: string]: any;
}

export default function UserIndex() {
    const { props } = usePage<PageProps>();
    const { users, breadcrumbs, auth } = props;

    // Modal states
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmConfig, setConfirmConfig] = useState({
        title: '',
        message: '',
        onConfirm: () => {},
        type: 'warning' as 'warning' | 'danger' | 'info'
    });

    const showConfirm = (title: string, message: string, onConfirm: () => void, type: 'warning' | 'danger' | 'info' = 'warning') => {
        setConfirmConfig({ title, message, onConfirm, type });
        setShowConfirmModal(true);
    };

    const handleArchive = (userId: number) => {
        showConfirm(
            'Archive User',
            'Are you sure you want to archive this user? They will not be able to log in.',
            () => {
                router.post(`/users/${userId}/archive`, {}, {
                    onSuccess: () => {
                        router.reload();
                    }
                });
            },
            'danger'
        );
    };

    const handleRestore = (userId: number) => {
        showConfirm(
            'Restore User',
            'Are you sure you want to restore this user? They will be able to log in again.',
            () => {
                router.post(`/users/${userId}/restore`, {}, {
                    onSuccess: () => {
                        router.reload();
                    }
                });
            },
            'warning'
        );
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            active: 'bg-green-100 text-green-800',
            inactive: 'bg-yellow-100 text-yellow-800',
            archived: 'bg-red-100 text-red-800',
        };
        return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />

            <div className="w-full p-6 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                    <p className="text-gray-600">Manage user accounts and their status</p>
                </div>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            User Accounts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3 font-medium">Name</th>
                                        <th className="text-left p-3 font-medium">Email</th>
                                        <th className="text-left p-3 font-medium">Role</th>
                                        <th className="text-left p-3 font-medium">Status</th>
                                        <th className="text-left p-3 font-medium">Created</th>
                                        <th className="text-left p-3 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">{user.name}</td>
                                            <td className="p-3">{user.email}</td>
                                            <td className="p-3">
                                                <Badge variant="outline">{user.role}</Badge>
                                            </td>
                                            <td className="p-3">
                                                <Badge className={getStatusBadge(user.status)}>
                                                    {user.status}
                                                </Badge>
                                            </td>
                                            <td className="p-3">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-3">
                                                {user.status === 'archived' ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleRestore(user.id)}
                                                        disabled={user.id === auth.user.id}
                                                    >
                                                        <RotateCcw className="w-4 h-4 mr-1" />
                                                        Restore
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleArchive(user.id)}
                                                        disabled={user.id === auth.user.id || user.role === 'admin'}
                                                    >
                                                        <Archive className="w-4 h-4 mr-1" />
                                                        Archive
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={() => {
                    confirmConfig.onConfirm();
                    setShowConfirmModal(false);
                }}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
            />
        </AppLayout>
    );
}
