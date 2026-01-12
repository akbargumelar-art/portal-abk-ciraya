import React, { useState, useEffect } from 'react';
import { ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, Button } from '../components/ui/index';

const LOOKER_URL_KEY = 'portal_looker_url';
const DEFAULT_LOOKER_URL = 'https://lookerstudio.google.com/embed/reporting/fe7230d7-5028-4682-bc15-b99859ceb2aa';

const ReportsPage: React.FC = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [lookerStudioUrl, setLookerStudioUrl] = useState(DEFAULT_LOOKER_URL);

    // Load Looker URL from localStorage
    useEffect(() => {
        const savedUrl = localStorage.getItem(LOOKER_URL_KEY);
        if (savedUrl) {
            setLookerStudioUrl(savedUrl);
        }
    }, []);

    // Get the non-embed URL for "Open in New Tab"
    const getExternalUrl = () => {
        return lookerStudioUrl.replace('/embed/', '/');
    };

    return (
        <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'p-6'} animate-fade-in`}>
            {!isFullscreen && (
                <>
                    <Header
                        title="Looker Reports"
                    />
                </>
            )}

            {/* Report Viewer */}
            <Card padding="none" className={`overflow-hidden ${isFullscreen ? 'h-full rounded-none' : 'mt-6'}`}>
                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <div>
                        <h3 className="font-semibold text-gray-900">Sales Performance Report</h3>
                        <p className="text-xs text-gray-500">Google Looker Studio Dashboard</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(getExternalUrl(), '_blank')}
                            leftIcon={<ExternalLink size={16} />}
                        >
                            Open in New Tab
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            leftIcon={isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        >
                            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        </Button>
                    </div>
                </div>

                {/* iFrame Container */}
                <div className={`${isFullscreen ? 'h-[calc(100%-60px)]' : 'h-[700px]'} bg-gray-100`}>
                    <iframe
                        src={lookerStudioUrl}
                        className="w-full h-full border-0"
                        title="Looker Studio Report"
                        allowFullScreen
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    />
                </div>
            </Card>
        </div>
    );
};

export default ReportsPage;

