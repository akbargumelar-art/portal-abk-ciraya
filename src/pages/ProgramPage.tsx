import React, { useState } from 'react';
import { Gift, Calendar, Users, Tag, Plus, Eye, Edit2, Clock, CheckCircle } from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, Button, Badge, Modal } from '../components/ui/index';

interface Program {
    id: string;
    name: string;
    type: 'promo' | 'bundling' | 'reward' | 'competition';
    startDate: string;
    endDate: string;
    status: 'active' | 'upcoming' | 'ended';
    target: string;
    reward: string;
    participants: number;
}

const mockPrograms: Program[] = [
    {
        id: 'PRG001',
        name: 'Promo Akhir Tahun 2024',
        type: 'promo',
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        status: 'active',
        target: 'Semua Outlet',
        reward: 'Diskon 10% untuk pembelian > 100 unit',
        participants: 45,
    },
    {
        id: 'PRG002',
        name: 'Bundling Perdana + Voucher',
        type: 'bundling',
        startDate: '2024-12-15',
        endDate: '2025-01-15',
        status: 'active',
        target: 'Outlet Gold & Platinum',
        reward: 'Free 5 voucher untuk setiap 20 perdana',
        participants: 28,
    },
    {
        id: 'PRG003',
        name: 'Competition Q1 2025',
        type: 'competition',
        startDate: '2025-01-01',
        endDate: '2025-03-31',
        status: 'upcoming',
        target: 'Salesforce',
        reward: 'Hadiah smartphone untuk top 3',
        participants: 0,
    },
    {
        id: 'PRG004',
        name: 'Reward Loyalitas November',
        type: 'reward',
        startDate: '2024-11-01',
        endDate: '2024-11-30',
        status: 'ended',
        target: 'Outlet dengan transaksi > 50jt/bulan',
        reward: 'Cashback 2%',
        participants: 15,
    },
];

const ProgramPage: React.FC = () => {
    const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'ended'>('all');
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

    const getTypeBadge = (type: Program['type']) => {
        switch (type) {
            case 'promo':
                return <Badge variant="error">Promo</Badge>;
            case 'bundling':
                return <Badge variant="info">Bundling</Badge>;
            case 'reward':
                return <Badge variant="success">Reward</Badge>;
            case 'competition':
                return <Badge variant="warning">Competition</Badge>;
        }
    };

    const getStatusBadge = (status: Program['status']) => {
        switch (status) {
            case 'active':
                return <Badge variant="success">Aktif</Badge>;
            case 'upcoming':
                return <Badge variant="info">Akan Datang</Badge>;
            case 'ended':
                return <Badge variant="neutral">Selesai</Badge>;
        }
    };

    const filteredPrograms = filter === 'all'
        ? mockPrograms
        : mockPrograms.filter(p => p.status === filter);

    const stats = {
        active: mockPrograms.filter(p => p.status === 'active').length,
        upcoming: mockPrograms.filter(p => p.status === 'upcoming').length,
        ended: mockPrograms.filter(p => p.status === 'ended').length,
        totalParticipants: mockPrograms.reduce((sum, p) => sum + p.participants, 0),
    };

    return (
        <div className="p-6 animate-fade-in">
            <Header
                title="Program"
            />

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card
                    className={`cursor-pointer transition-all ${filter === 'active' ? 'ring-2 ring-green-500' : ''}`}
                    onClick={() => setFilter(filter === 'active' ? 'all' : 'active')}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle size={20} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                            <p className="text-sm text-gray-500">Aktif</p>
                        </div>
                    </div>
                </Card>
                <Card
                    className={`cursor-pointer transition-all ${filter === 'upcoming' ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setFilter(filter === 'upcoming' ? 'all' : 'upcoming')}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Clock size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
                            <p className="text-sm text-gray-500">Akan Datang</p>
                        </div>
                    </div>
                </Card>
                <Card
                    className={`cursor-pointer transition-all ${filter === 'ended' ? 'ring-2 ring-gray-500' : ''}`}
                    onClick={() => setFilter(filter === 'ended' ? 'all' : 'ended')}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Calendar size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.ended}</p>
                            <p className="text-sm text-gray-500">Selesai</p>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Users size={20} className="text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalParticipants}</p>
                            <p className="text-sm text-gray-500">Partisipan</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">
                    {filter === 'all' ? 'Semua Program' : `Program ${filter === 'active' ? 'Aktif' : filter === 'upcoming' ? 'Akan Datang' : 'Selesai'}`}
                </h3>
                <Button variant="primary" leftIcon={<Plus size={16} />}>
                    Tambah Program
                </Button>
            </div>

            {/* Program Cards */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPrograms.map(program => (
                    <Card key={program.id} className="hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                                {getTypeBadge(program.type)}
                                {getStatusBadge(program.status)}
                            </div>
                            <span className="text-xs text-gray-400 font-mono">{program.id}</span>
                        </div>

                        <h4 className="font-semibold text-gray-900 mb-2">{program.name}</h4>

                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Calendar size={14} />
                                <span>{program.startDate} - {program.endDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Tag size={14} />
                                <span>{program.target}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Gift size={14} />
                                <span>{program.reward}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users size={14} />
                                <span>{program.participants} partisipan</span>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                            <Button variant="ghost" size="sm" leftIcon={<Eye size={14} />}
                                onClick={() => setSelectedProgram(program)}>
                                Detail
                            </Button>
                            <Button variant="ghost" size="sm" leftIcon={<Edit2 size={14} />}>
                                Edit
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Detail Modal */}
            <Modal
                isOpen={!!selectedProgram}
                onClose={() => setSelectedProgram(null)}
                title={selectedProgram?.name}
                size="lg"
            >
                {selectedProgram && (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            {getTypeBadge(selectedProgram.type)}
                            {getStatusBadge(selectedProgram.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Periode</p>
                                <p className="font-medium">{selectedProgram.startDate} - {selectedProgram.endDate}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Partisipan</p>
                                <p className="font-medium">{selectedProgram.participants} outlet/personil</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Target</p>
                            <p className="font-medium">{selectedProgram.target}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Reward</p>
                            <p className="font-medium">{selectedProgram.reward}</p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ProgramPage;
