import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { Button } from '../components/ui/index';

interface UnderConstructionPageProps {
    title: string;
    subtitle?: string;
}

const UnderConstructionPage: React.FC<UnderConstructionPageProps> = ({
    title,
    subtitle = 'Halaman ini sedang dalam pengembangan'
}) => {
    const navigate = useNavigate();

    return (
        <div className="p-6 animate-fade-in">
            <Header title={title} subtitle={subtitle} />

            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-center max-w-md">
                    {/* Icon */}
                    <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#F13B4B]/10 to-[#FF6B78]/10 rounded-full flex items-center justify-center">
                        <Construction size={48} className="text-[#F13B4B]" />
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        Sedang Dalam Pengerjaan
                    </h2>

                    {/* Description */}
                    <p className="text-gray-500 mb-6">
                        Fitur <span className="font-semibold text-gray-700">{title}</span> sedang dalam proses pengembangan.
                        Silakan kembali lagi nanti untuk melihat update terbaru.
                    </p>

                    {/* Progress indicator */}
                    <div className="bg-gray-100 rounded-full h-2 mb-6 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-[#F13B4B] to-[#FF6B78] h-full rounded-full animate-pulse"
                            style={{ width: '45%' }}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mb-8">Progress: 45% selesai</p>

                    {/* Action */}
                    <Button
                        variant="outline"
                        leftIcon={<ArrowLeft size={16} />}
                        onClick={() => navigate(-1)}
                    >
                        Kembali
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UnderConstructionPage;
