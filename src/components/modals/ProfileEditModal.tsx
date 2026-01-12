import React, { useState } from 'react';
import { User, Lock, Camera, Save, Eye, EyeOff } from 'lucide-react';
import { Modal, Input, Button } from '../ui/index';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose }) => {
    const { user, updateUser } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username || '',
        email: user?.email || '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nama lengkap wajib diisi';
        }

        if (!formData.username.trim()) {
            newErrors.username = 'Username wajib diisi';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username minimal 3 karakter';
        }

        if (formData.password) {
            if (formData.password.length < 6) {
                newErrors.password = 'Password minimal 6 karakter';
            }
            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Password tidak sama';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update user in context
            updateUser({
                name: formData.name,
                username: formData.username,
                email: formData.email,
            });

            onClose();
        } catch (error) {
            console.error('Failed to update profile:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarChange = () => {
        // In a real app, this would open a file picker and upload the image
        alert('Fitur upload avatar akan tersedia setelah integrasi backend');
    };

    if (!user) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Profil"
            size="md"
        >
            <div className="space-y-6">
                {/* Avatar Section */}
                <div className="flex justify-center">
                    <div className="relative">
                        <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=F13B4B&color=fff&size=128`}
                            alt={user.name}
                            className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-100"
                        />
                        <button
                            onClick={handleAvatarChange}
                            className="absolute bottom-0 right-0 w-8 h-8 bg-[#F13B4B] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#D92939] transition-colors"
                        >
                            <Camera size={16} />
                        </button>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                    <Input
                        label="Nama Lengkap"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Masukkan nama lengkap"
                        error={errors.name}
                        leftIcon={<User size={18} />}
                    />

                    <Input
                        label="Username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Masukkan username"
                        error={errors.username}
                        leftIcon={<User size={18} />}
                    />

                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Masukkan email"
                        error={errors.email}
                    />

                    <div className="border-t border-gray-100 pt-4">
                        <p className="text-sm text-gray-500 mb-3">
                            Kosongkan jika tidak ingin mengubah password
                        </p>

                        <div className="space-y-4">
                            <div className="relative">
                                <Input
                                    label="Password Baru"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Masukkan password baru"
                                    error={errors.password}
                                    leftIcon={<Lock size={18} />}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <Input
                                label="Konfirmasi Password"
                                name="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Ulangi password baru"
                                error={errors.confirmPassword}
                                leftIcon={<Lock size={18} />}
                            />
                        </div>
                    </div>
                </div>

                {/* Role Display */}
                <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Role</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                        {user.role.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                        Role hanya dapat diubah oleh Admin
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                        disabled={isLoading}
                    >
                        Batal
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        className="flex-1"
                        leftIcon={<Save size={16} />}
                        isLoading={isLoading}
                    >
                        Simpan
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ProfileEditModal;
