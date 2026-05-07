/**
 * Unauthorized Page
 * 
 * Displayed when a user tries to access a route they don't have permission for.
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/index';
import { getRoleDisplayName } from '../types/auth';
import type { Role } from '../types/auth';

interface LocationState {
    requiredRoles?: Role[];
    userRole?: string;
    attemptedPath?: string;
}

const UnauthorizedPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState | undefined;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                    <ShieldX size={48} className="text-red-500" />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Akses Ditolak
                </h1>

                {/* Description */}
                <p className="text-gray-600 mb-6">
                    Anda tidak memiliki izin untuk mengakses halaman ini.
                </p>

                {/* Details */}
                {state && (
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 text-left">
                        {state.attemptedPath && (
                            <div className="mb-2">
                                <span className="text-sm text-gray-500">Halaman yang diakses:</span>
                                <p className="font-mono text-sm text-gray-900">{state.attemptedPath}</p>
                            </div>
                        )}
                        {state.requiredRoles && state.requiredRoles.length > 0 && (
                            <div className="mb-2">
                                <span className="text-sm text-gray-500">Role yang diperlukan:</span>
                                <p className="text-sm text-gray-900">
                                    {state.requiredRoles.map(r => getRoleDisplayName(r)).join(', ')}
                                </p>
                            </div>
                        )}
                        {state.userRole && (
                            <div>
                                <span className="text-sm text-gray-500">Role Anda:</span>
                                <p className="text-sm text-gray-900">
                                    {getRoleDisplayName(state.userRole as Role)}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        variant="outline"
                        leftIcon={<ArrowLeft size={16} />}
                        onClick={() => navigate(-1)}
                    >
                        Kembali
                    </Button>
                    <Button
                        variant="primary"
                        leftIcon={<Home size={16} />}
                        onClick={() => navigate('/dashboard')}
                    >
                        Ke Dashboard
                    </Button>
                </div>

                {/* Help text */}
                <p className="text-xs text-gray-400 mt-8">
                    Jika Anda merasa seharusnya memiliki akses, silakan hubungi administrator.
                </p>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
