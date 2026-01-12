import React, { useState } from 'react';
import { Send, AlertCircle, Clock, Plus } from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, Button, Input, Select, Badge } from '../components/ui/index';

interface Complaint {
    id: string;
    date: string;
    category: string;
    subject: string;
    description: string;
    status: 'pending' | 'processing' | 'resolved';
    outlet?: string;
}

const mockComplaints: Complaint[] = [
    { id: 'CPL001', date: '2024-12-20', category: 'Stok', subject: 'Stok tidak sesuai', description: 'Stok perdana yang diterima tidak sesuai dengan PO', status: 'pending', outlet: 'OU-001' },
    { id: 'CPL002', date: '2024-12-19', category: 'Sistem', subject: 'Error aplikasi', description: 'Tidak bisa input visit form', status: 'processing', outlet: 'OU-023' },
    { id: 'CPL003', date: '2024-12-18', category: 'Komisi', subject: 'Komisi belum masuk', description: 'Komisi bulan November belum cair', status: 'resolved' },
];

const ComplaintPage: React.FC = () => {
    const [showForm, setShowForm] = useState(false);
    const [complaints, setComplaints] = useState<Complaint[]>(mockComplaints);
    const [filter, setFilter] = useState('all');
    const [formData, setFormData] = useState({
        category: '',
        subject: '',
        description: '',
        outlet: '',
    });

    const categories = [
        { value: '', label: 'Pilih Kategori' },
        { value: 'Stok', label: 'Stok / Inventori' },
        { value: 'Sistem', label: 'Sistem / Aplikasi' },
        { value: 'Komisi', label: 'Komisi / Fee' },
        { value: 'Pengiriman', label: 'Pengiriman' },
        { value: 'Lainnya', label: 'Lainnya' },
    ];

    const getStatusBadge = (status: Complaint['status']) => {
        switch (status) {
            case 'pending':
                return <Badge variant="warning">Pending</Badge>;
            case 'processing':
                return <Badge variant="info">Diproses</Badge>;
            case 'resolved':
                return <Badge variant="success">Selesai</Badge>;
        }
    };

    const handleSubmit = () => {
        if (!formData.category || !formData.subject || !formData.description) return;

        const newComplaint: Complaint = {
            id: `CPL${String(complaints.length + 1).padStart(3, '0')}`,
            date: new Date().toISOString().split('T')[0],
            ...formData,
            status: 'pending',
        };

        setComplaints([newComplaint, ...complaints]);
        setFormData({ category: '', subject: '', description: '', outlet: '' });
        setShowForm(false);
    };

    const filteredComplaints = filter === 'all'
        ? complaints
        : complaints.filter(c => c.status === filter);

    return (
        <div className="p-6 animate-fade-in">
            <Header
                title="Komplain"
            />

            <div className="mt-6 flex flex-col lg:flex-row gap-6">
                {/* Main Content */}
                <div className="flex-1">
                    {/* Actions Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="primary"
                                onClick={() => setShowForm(!showForm)}
                                leftIcon={<Plus size={18} />}
                            >
                                Buat Komplain
                            </Button>
                        </div>
                        <div className="flex items-center gap-3">
                            <Select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                options={[
                                    { value: 'all', label: 'Semua Status' },
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'processing', label: 'Diproses' },
                                    { value: 'resolved', label: 'Selesai' },
                                ]}
                            />
                        </div>
                    </div>

                    {/* New Complaint Form */}
                    {showForm && (
                        <Card className="mb-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Form Komplain Baru</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Select
                                        label="Kategori"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        options={categories}
                                    />
                                    <Input
                                        label="Outlet (opsional)"
                                        value={formData.outlet}
                                        onChange={(e) => setFormData({ ...formData, outlet: e.target.value })}
                                        placeholder="ID Outlet terkait"
                                    />
                                </div>
                                <Input
                                    label="Subjek"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    placeholder="Judul singkat komplain"
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Jelaskan detail komplain Anda..."
                                        className="input min-h-[120px]"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={() => setShowForm(false)}>
                                        Batal
                                    </Button>
                                    <Button variant="primary" onClick={handleSubmit} leftIcon={<Send size={16} />}>
                                        Kirim Komplain
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Complaints List */}
                    <div className="space-y-4">
                        {filteredComplaints.length === 0 ? (
                            <Card className="text-center py-12">
                                <AlertCircle size={48} className="text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Tidak ada komplain</p>
                            </Card>
                        ) : (
                            filteredComplaints.map(complaint => (
                                <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-sm font-mono text-gray-500">{complaint.id}</span>
                                                <Badge variant="neutral">{complaint.category}</Badge>
                                                {getStatusBadge(complaint.status)}
                                            </div>
                                            <h4 className="font-semibold text-gray-900">{complaint.subject}</h4>
                                            <p className="text-sm text-white mt-1">{complaint.description}</p>
                                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} /> {complaint.date}
                                                </span>
                                                {complaint.outlet && (
                                                    <span>Outlet: {complaint.outlet}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="lg:w-72 space-y-4">
                    <Card>
                        <h4 className="font-semibold text-gray-900 mb-4">Statistik</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-white">Total Komplain</span>
                                <span className="font-semibold">{complaints.length}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-yellow-600">Pending</span>
                                <span className="font-semibold text-yellow-600">
                                    {complaints.filter(c => c.status === 'pending').length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-blue-600">Diproses</span>
                                <span className="font-semibold text-blue-600">
                                    {complaints.filter(c => c.status === 'processing').length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-green-600">Selesai</span>
                                <span className="font-semibold text-green-600">
                                    {complaints.filter(c => c.status === 'resolved').length}
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ComplaintPage;
