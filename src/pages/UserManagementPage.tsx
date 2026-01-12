/**
 * User Management Page (Enhanced)
 * 
 * Includes:
 * - Tab 1: User Management - CRUD user accounts
 * - Tab 2: Role Permissions - Configure page access per role (admin_super only)
 */

import React, { useState } from 'react';
import { Edit, Trash2, Plus, Users, Shield } from 'lucide-react';
import Header from '../components/layout/Header';
import DataTable from '../components/table/DataTable';
import { Button, Modal, Input, Select } from '../components/ui/index';
import RolePermissionManager from '../components/admin/RolePermissionManager';
import { mockUsers, getRoleDisplayName, getRoleBadgeColor } from '../data/mockUsers';
import type { User, TableColumn, UserRole } from '../types';

// ============================================================================
// TAB COMPONENT
// ============================================================================

interface TabProps {
    tabs: { id: string; label: string; icon: React.ReactNode }[];
    activeTab: string;
    onChange: (tabId: string) => void;
}

const Tabs: React.FC<TabProps> = ({ tabs, activeTab, onChange }) => (
    <div className="flex border-b border-gray-200 mb-6">
        {tabs.map(tab => (
            <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium
                    border-b-2 transition-colors
                    ${activeTab === tab.id
                        ? 'border-[#F13B4B] text-[#F13B4B]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                `}
            >
                {tab.icon}
                {tab.label}
            </button>
        ))}
    </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UserManagementPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState(mockUsers);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        role: 'salesforce' as UserRole,
    });

    // Tab configuration
    const tabConfig = [
        { id: 'users', label: 'Manajemen User', icon: <Users size={16} /> },
        { id: 'permissions', label: 'Pengaturan Akses', icon: <Shield size={16} /> },
    ];

    // Open modal for new user
    const handleAddUser = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            username: '',
            email: '',
            role: 'salesforce',
        });
        setIsModalOpen(true);
    };

    // Open modal for editing
    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            username: user.username,
            email: user.email || '',
            role: user.role,
        });
        setIsModalOpen(true);
    };

    // Save user
    const handleSaveUser = () => {
        if (editingUser) {
            // Update existing user
            setUsers(prev => prev.map(u =>
                u.id === editingUser.id
                    ? { ...u, ...formData, avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=F13B4B&color=fff` }
                    : u
            ));
        } else {
            // Add new user
            const newUser: User = {
                id: `USR${String(users.length + 1).padStart(3, '0')}`,
                ...formData,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=F13B4B&color=fff`,
                createdAt: new Date().toISOString().split('T')[0],
            };
            setUsers(prev => [...prev, newUser]);
        }
        setIsModalOpen(false);
    };

    // Delete user
    const handleDeleteUser = (userId: string) => {
        if (confirm('Are you sure you want to delete this user?')) {
            setUsers(prev => prev.filter(u => u.id !== userId));
        }
    };

    // Table columns
    const columns: TableColumn<User>[] = [
        {
            key: 'avatar',
            header: '',
            width: '50px',
            render: (_, row) => (
                <img
                    src={row.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=F13B4B&color=fff`}
                    alt={row.name}
                    className="w-9 h-9 rounded-full object-cover"
                />
            ),
        },
        {
            key: 'name',
            header: 'Nama',
            sortable: true,
            render: (value, row) => (
                <div>
                    <p className="font-medium text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500">@{row.username}</p>
                </div>
            ),
        },
        {
            key: 'email',
            header: 'Email',
            sortable: true,
        },
        {
            key: 'role',
            header: 'Role',
            sortable: true,
            render: (value: UserRole) => (
                <span className={`badge ${getRoleBadgeColor(value)}`}>
                    {getRoleDisplayName(value)}
                </span>
            ),
        },
        {
            key: 'createdAt',
            header: 'Dibuat',
            sortable: true,
            render: (value) => new Date(value).toLocaleDateString('id-ID'),
        },
        {
            key: 'actions',
            header: 'Aksi',
            width: '100px',
            align: 'center' as const,
            render: (_, row) => (
                <div className="flex items-center justify-center gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEditUser(row);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit size={16} className="text-gray-500" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(row.id);
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={16} className="text-red-500" />
                    </button>
                </div>
            ),
        },
    ];

    // Role options
    const roleOptions: { value: UserRole; label: string }[] = [
        { value: 'admin_super', label: 'Admin Super' },
        { value: 'admin', label: 'Admin' },
        { value: 'manager', label: 'Manager' },
        { value: 'supervisor_ids', label: 'Supervisor IDS' },
        { value: 'supervisor_d2c', label: 'Supervisor D2C' },
        { value: 'salesforce', label: 'Salesforce' },
        { value: 'direct_sales', label: 'Direct Sales' },
    ];

    return (
        <div className="p-6 animate-fade-in">
            <Header
                title="User Management"
            />

            {/* Tabs */}
            <div className="mt-6">
                <Tabs tabs={tabConfig} activeTab={activeTab} onChange={setActiveTab} />
            </div>

            {/* Tab Content: Users */}
            {activeTab === 'users' && (
                <>
                    {/* Actions */}
                    <div className="flex justify-end mb-6">
                        <Button
                            variant="primary"
                            leftIcon={<Plus size={18} />}
                            onClick={handleAddUser}
                        >
                            Tambah User
                        </Button>
                    </div>

                    {/* User Table */}
                    <DataTable
                        data={users}
                        columns={columns}
                        title={`Users (${users.length})`}
                        pageSize={10}
                    />
                </>
            )}

            {/* Tab Content: Permissions */}
            {activeTab === 'permissions' && (
                <RolePermissionManager />
            )}

            {/* User Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingUser ? 'Edit User' : 'Tambah User Baru'}
                size="md"
            >
                <div className="space-y-4">
                    <Input
                        label="Nama Lengkap"
                        value={formData.name}
                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Masukkan nama lengkap"
                    />
                    <Input
                        label="Username"
                        value={formData.username}
                        onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Masukkan username"
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Masukkan email"
                    />
                    <Select
                        label="Role"
                        value={formData.role}
                        onChange={e => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                        options={roleOptions}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSaveUser}
                            disabled={!formData.name || !formData.username}
                        >
                            {editingUser ? 'Simpan Perubahan' : 'Tambah User'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserManagementPage;
