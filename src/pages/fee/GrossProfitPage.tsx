import React from 'react';
import Header from '../../components/layout/Header';
import { Card } from '../../components/ui/index';
import { Construction } from 'lucide-react';

const GrossProfitPage: React.FC = () => {
    return (
        <div className="p-6 animate-fade-in">
            <Header title="Gross Profit" />
            <Card className="mt-6 text-center py-16">
                <Construction size={64} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Halaman Dalam Pengembangan</h2>
                <p className="text-gray-500">Fitur Gross Profit akan segera tersedia.</p>
            </Card>
        </div>
    );
};

export default GrossProfitPage;
