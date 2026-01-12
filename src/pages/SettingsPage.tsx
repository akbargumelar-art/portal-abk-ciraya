import React, { useState, useEffect } from 'react';
import { Database, Server, CheckCircle, XCircle, RefreshCw, Settings as SettingsIcon, Save, Eye, EyeOff, BarChart3, Link as LinkIcon } from 'lucide-react';
import Header from '../components/layout/Header';
import { Card, Button, Input, Badge } from '../components/ui/index';

interface ConnectionConfig {
    host: string;
    port: string;
    database: string;
    username: string;
    password: string;
}

const LOOKER_URL_KEY = 'portal_looker_url';
const DEFAULT_LOOKER_URL = 'https://lookerstudio.google.com/embed/reporting/fe7230d7-5028-4682-bc15-b99859ceb2aa';

const SettingsPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing' | null>(null);
    const [config, setConfig] = useState<ConnectionConfig>({
        host: 'localhost',
        port: '3306',
        database: 'portal_abkciraya',
        username: 'root',
        password: '',
    });

    // Looker URL state
    const [lookerUrl, setLookerUrl] = useState(DEFAULT_LOOKER_URL);
    const [lookerSaved, setLookerSaved] = useState(false);

    // Load Looker URL from localStorage on mount
    useEffect(() => {
        const savedUrl = localStorage.getItem(LOOKER_URL_KEY);
        if (savedUrl) {
            setLookerUrl(savedUrl);
        }
    }, []);

    const handleChange = (field: keyof ConnectionConfig, value: string) => {
        setConfig(prev => ({ ...prev, [field]: value }));
        setConnectionStatus(null);
    };

    const testConnection = async () => {
        setIsTestingConnection(true);
        setConnectionStatus('testing');

        // Simulate connection test
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate success/failure
        const success = config.host && config.database && config.username;
        setConnectionStatus(success ? 'connected' : 'disconnected');
        setIsTestingConnection(false);
    };

    const handleSave = () => {
        alert('Konfigurasi berhasil disimpan!\n\nNote: Fitur ini memerlukan backend untuk menyimpan ke database.');
    };

    const handleSaveLookerUrl = () => {
        localStorage.setItem(LOOKER_URL_KEY, lookerUrl);
        setLookerSaved(true);
        setTimeout(() => setLookerSaved(false), 3000);
    };

    const handleResetLookerUrl = () => {
        setLookerUrl(DEFAULT_LOOKER_URL);
        localStorage.setItem(LOOKER_URL_KEY, DEFAULT_LOOKER_URL);
        setLookerSaved(true);
        setTimeout(() => setLookerSaved(false), 3000);
    };

    return (
        <div className="p-6 animate-fade-in">
            <Header
                title="Pengaturan"
            />

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Settings Cards */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Looker Reports URL */}
                    <Card>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <BarChart3 size={20} className="text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Looker Reports</h3>
                                <p className="text-sm text-gray-500">Konfigurasi URL embed Looker Studio</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    URL Embed Looker Studio
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <LinkIcon size={18} />
                                    </div>
                                    <input
                                        type="url"
                                        value={lookerUrl}
                                        onChange={(e) => setLookerUrl(e.target.value)}
                                        placeholder="https://lookerstudio.google.com/embed/reporting/..."
                                        className="input w-full"
                                        style={{ paddingLeft: '2.75rem' }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Masukkan URL embed dari Google Looker Studio. URL biasanya diawali dengan "https://lookerstudio.google.com/embed/reporting/"
                                </p>
                            </div>

                            {lookerSaved && (
                                <div className="p-3 bg-green-50 rounded-lg flex items-center gap-2">
                                    <CheckCircle size={18} className="text-green-500" />
                                    <span className="text-sm text-green-700">URL Looker berhasil disimpan!</span>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    variant="primary"
                                    onClick={handleSaveLookerUrl}
                                    leftIcon={<Save size={16} />}
                                >
                                    Simpan URL
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleResetLookerUrl}
                                    leftIcon={<RefreshCw size={16} />}
                                >
                                    Reset ke Default
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Database Connection */}
                    <Card>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Database size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Koneksi Database</h3>
                                <p className="text-sm text-gray-500">Konfigurasi koneksi MySQL</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Host"
                                    value={config.host}
                                    onChange={(e) => handleChange('host', e.target.value)}
                                    placeholder="localhost atau IP address"
                                />
                                <Input
                                    label="Port"
                                    value={config.port}
                                    onChange={(e) => handleChange('port', e.target.value)}
                                    placeholder="3306"
                                />
                            </div>

                            <Input
                                label="Database Name"
                                value={config.database}
                                onChange={(e) => handleChange('database', e.target.value)}
                                placeholder="Nama database"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Username"
                                    value={config.username}
                                    onChange={(e) => handleChange('username', e.target.value)}
                                    placeholder="Username database"
                                />
                                <div className="relative">
                                    <Input
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={config.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        placeholder="Password database"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-9 text-gray-400 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Connection Status */}
                            {connectionStatus && (
                                <div className={`p-4 rounded-lg flex items-center gap-3 ${connectionStatus === 'connected' ? 'bg-green-50' :
                                    connectionStatus === 'disconnected' ? 'bg-red-50' : 'bg-blue-50'
                                    }`}>
                                    {connectionStatus === 'connected' && (
                                        <>
                                            <CheckCircle size={20} className="text-green-500" />
                                            <span className="text-green-700">Koneksi berhasil!</span>
                                        </>
                                    )}
                                    {connectionStatus === 'disconnected' && (
                                        <>
                                            <XCircle size={20} className="text-red-500" />
                                            <span className="text-red-700">Koneksi gagal. Periksa konfigurasi.</span>
                                        </>
                                    )}
                                    {connectionStatus === 'testing' && (
                                        <>
                                            <RefreshCw size={20} className="text-blue-500 animate-spin" />
                                            <span className="text-blue-700">Menguji koneksi...</span>
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={testConnection}
                                    isLoading={isTestingConnection}
                                    leftIcon={<RefreshCw size={16} />}
                                >
                                    Test Koneksi
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleSave}
                                    leftIcon={<Save size={16} />}
                                >
                                    Simpan Konfigurasi
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-4">
                    <Card>
                        <div className="flex items-center gap-3 mb-4">
                            <Server size={20} className="text-gray-400" />
                            <h4 className="font-semibold text-gray-900">Status Server</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-white">API Server</span>
                                <Badge variant="success">Online</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-white">Database</span>
                                <Badge variant={connectionStatus === 'connected' ? 'success' : 'neutral'}>
                                    {connectionStatus === 'connected' ? 'Connected' : 'Not Tested'}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-white">Cache</span>
                                <Badge variant="success">Active</Badge>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="flex items-center gap-3 mb-4">
                            <SettingsIcon size={20} className="text-gray-400" />
                            <h4 className="font-semibold text-gray-900">Info Sistem</h4>
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Versi</span>
                                <span className="font-mono text-gray-900">1.0.0</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Environment</span>
                                <span className="font-mono text-gray-900">Development</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Build</span>
                                <span className="font-mono text-gray-900">2024.12.21</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-yellow-50 border border-yellow-200">
                        <p className="text-sm text-yellow-700">
                            <strong>Catatan:</strong> Perubahan konfigurasi database memerlukan restart server untuk diterapkan.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;

