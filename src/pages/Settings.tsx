import { useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader, PageContainer } from '../components/layout/PageComponents';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Moon, Sun, Bell, Lock, Palette, User, Save } from 'lucide-react';

const Settings = () => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'appearance' | 'account' | 'notifications'>('appearance');

    const tabs = [
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'account', label: 'Account', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    return (
        <PageContainer>
            <PageHeader
                title="Settings"
                description="Manage your account preferences and application settings."
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="glass-panel rounded-xl border border-white/10 p-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    activeTab === tab.id
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="glass-panel rounded-xl border border-white/10 p-6"
                    >
                        {activeTab === 'appearance' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-1">Theme</h3>
                                    <p className="text-sm text-gray-400 mb-4">Choose your preferred color scheme</p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => theme === 'light' ? null : toggleTheme()}
                                            className={`relative group overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                                                theme === 'light'
                                                    ? 'border-blue-500 shadow-lg shadow-blue-500/20'
                                                    : 'border-white/10 hover:border-white/20'
                                            }`}
                                        >
                                            <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-200 p-4 flex flex-col">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center">
                                                        <Sun size={16} className="text-orange-500" />
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                                                        <div className="h-1.5 bg-gray-200 rounded w-1/2"></div>
                                                    </div>
                                                </div>
                                                <div className="flex-1 grid grid-cols-3 gap-2">
                                                    <div className="bg-white rounded shadow-sm"></div>
                                                    <div className="bg-white rounded shadow-sm"></div>
                                                    <div className="bg-white rounded shadow-sm"></div>
                                                </div>
                                            </div>
                                            <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="p-3 bg-black/80 border-t border-white/10 flex items-center justify-center gap-2">
                                                <Sun size={16} className="text-orange-400" />
                                                <span className="text-sm font-medium text-white">Light Mode</span>
                                                {theme === 'light' && (
                                                    <div className="ml-auto w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => theme === 'dark' ? null : toggleTheme()}
                                            className={`relative group overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                                                theme === 'dark'
                                                    ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                                                    : 'border-white/10 hover:border-white/20'
                                            }`}
                                        >
                                            <div className="aspect-video bg-gradient-to-br from-gray-900 to-black p-4 flex flex-col">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                                                        <Moon size={16} className="text-purple-400" />
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="h-2 bg-white/20 rounded w-3/4"></div>
                                                        <div className="h-1.5 bg-white/10 rounded w-1/2"></div>
                                                    </div>
                                                </div>
                                                <div className="flex-1 grid grid-cols-3 gap-2">
                                                    <div className="bg-white/5 border border-white/10 rounded"></div>
                                                    <div className="bg-white/5 border border-white/10 rounded"></div>
                                                    <div className="bg-white/5 border border-white/10 rounded"></div>
                                                </div>
                                            </div>
                                            <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="p-3 bg-black/90 border-t border-white/10 flex items-center justify-center gap-2">
                                                <Moon size={16} className="text-purple-400" />
                                                <span className="text-sm font-medium text-white">Dark Mode</span>
                                                {theme === 'dark' && (
                                                    <div className="ml-auto w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/10">
                                    <h3 className="text-lg font-semibold text-white mb-1">Color Accent</h3>
                                    <p className="text-sm text-gray-400 mb-4">Customize your accent color (coming soon)</p>

                                    <div className="grid grid-cols-6 gap-3">
                                        {['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'].map((color) => (
                                            <button
                                                key={color}
                                                className="aspect-square rounded-lg border-2 border-white/20 hover:scale-110 transition-transform"
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'account' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-1">Account Information</h3>
                                    <p className="text-sm text-gray-400 mb-4">Manage your account details</p>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="email"
                                                    value={user?.email || ''}
                                                    disabled
                                                    className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm disabled:opacity-50"
                                                />
                                                <Lock size={18} className="text-gray-500" />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">User ID</label>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="text"
                                                    value={user?.id || ''}
                                                    disabled
                                                    className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm font-mono disabled:opacity-50"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/10">
                                    <h3 className="text-lg font-semibold text-white mb-1">Security</h3>
                                    <p className="text-sm text-gray-400 mb-4">Password and authentication settings</p>

                                    <button className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-medium transition-all shadow-lg shadow-red-500/20 hover:shadow-red-500/40">
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-1">Notification Preferences</h3>
                                    <p className="text-sm text-gray-400 mb-4">Control how you receive notifications</p>

                                    <div className="space-y-4">
                                        {[
                                            { label: 'New Call Notifications', desc: 'Get notified when a new call comes in' },
                                            { label: 'Appointment Reminders', desc: 'Receive reminders about upcoming appointments' },
                                            { label: 'Emergency Alerts', desc: 'Critical alerts for emergency situations' },
                                            { label: 'Invoice Updates', desc: 'Notifications about invoice status changes' },
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                                                <div>
                                                    <p className="text-sm font-medium text-white">{item.label}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-purple-600"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-white/10 flex justify-end">
                            <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-sm font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40">
                                <Save size={16} />
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </PageContainer>
    );
};

export default Settings;
