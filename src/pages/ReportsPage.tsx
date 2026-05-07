import React, { useState, useEffect } from 'react';
import { ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '../components/ui/index';
import { ContentPanel, PageShell } from '../components/layout/Page';

const LOOKER_URL_KEY = 'portal_looker_url';
const DEFAULT_LOOKER_URL = 'https://lookerstudio.google.com/embed/reporting/fe7230d7-5028-4682-bc15-b99859ceb2aa';

const isAllowedLookerUrl = (url: string) => {
    try {
        const parsed = new URL(url);
        return parsed.origin === 'https://lookerstudio.google.com'
            && parsed.pathname.startsWith('/embed/reporting/');
    } catch {
        return false;
    }
};

const ReportsPage: React.FC = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [lookerStudioUrl, setLookerStudioUrl] = useState(DEFAULT_LOOKER_URL);

    // Load Looker URL from localStorage
    useEffect(() => {
        const savedUrl = localStorage.getItem(LOOKER_URL_KEY);
        if (savedUrl && isAllowedLookerUrl(savedUrl)) {
            setLookerStudioUrl(savedUrl);
        }
    }, []);

    // Get the non-embed URL for "Open in New Tab"
    const getExternalUrl = () => {
        return (isAllowedLookerUrl(lookerStudioUrl) ? lookerStudioUrl : DEFAULT_LOOKER_URL).replace('/embed/', '/');
    };

    return (
        <PageShell
            title="Laporan Looker"
            hideHeader={isFullscreen}
            className={isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}
            contentClassName={isFullscreen ? 'h-full p-0 sm:p-0' : ''}
        >
            <ContentPanel
                title="Laporan Performa Sales"
                subtitle="Dashboard Google Looker Studio"
                className={isFullscreen ? 'h-full rounded-none border-0' : ''}
                actions={
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(getExternalUrl(), '_blank')}
                            leftIcon={<ExternalLink size={16} />}
                        >
                            Buka Tab Baru
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            leftIcon={isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        >
                            {isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen'}
                        </Button>
                    </>
                }
            >
                <div className={`${isFullscreen ? 'h-[calc(100%-60px)]' : 'h-[700px]'} bg-gray-100`}>
                    <iframe
                        src={isAllowedLookerUrl(lookerStudioUrl) ? lookerStudioUrl : DEFAULT_LOOKER_URL}
                        className="w-full h-full border-0"
                        title="Looker Studio Report"
                        allowFullScreen
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                    />
                </div>
            </ContentPanel>
        </PageShell>
    );
};

export default ReportsPage;

