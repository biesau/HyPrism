import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Github, Bug, Check, AlertTriangle, ChevronDown, ExternalLink, MessageCircle, Power, FolderOpen, Trash2, MessageSquare, Settings, Database, Globe, Code, Search } from 'lucide-react';
import { BrowserOpenURL } from '../../wailsjs/runtime/runtime';
import { 
    GetCloseAfterLaunch, 
    SetCloseAfterLaunch, 
    GetShowDiscordAnnouncements, 
    SetShowDiscordAnnouncements,
    OpenLauncherFolder,
    DeleteLauncherData,
    GetLauncherFolderPath,
    GetTestAnnouncement,
    SetInstanceDirectory,
    GetCustomInstanceDir,
    BrowseFolder
} from '../../wailsjs/go/app/App';
import { Language } from '../constants/enums';
import { LANGUAGE_CONFIG } from '../constants/languages';

interface SettingsModalProps {
    onClose: () => void;
    launcherBranch: string;
    onLauncherBranchChange: (branch: string) => void;
    onShowModManager?: (query?: string) => void;
    rosettaWarning?: { message: string; command: string; tutorialUrl?: string } | null;
    onTestAnnouncement?: (announcement: any) => void;
}

type SettingsTab = 'general' | 'data' | 'about' | 'developer';

export const SettingsModal: React.FC<SettingsModalProps> = ({
    onClose,
    launcherBranch,
    onLauncherBranchChange,
    onShowModManager,
    rosettaWarning,
    onTestAnnouncement
}) => {
    const { i18n, t } = useTranslation();
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [isLanguageOpen, setIsLanguageOpen] = useState(false);
    const [isBranchOpen, setIsBranchOpen] = useState(false);
    const [showTranslationConfirm, setShowTranslationConfirm] = useState<{ langName: string; langCode: string; searchQuery: string } | null>(null);
    const [dontAskAgain, setDontAskAgain] = useState(false);
    const [selectedLauncherBranch, setSelectedLauncherBranch] = useState(launcherBranch);
    const [closeAfterLaunch, setCloseAfterLaunch] = useState(false);
    const [showDiscordAnnouncements, setShowDiscordAnnouncements] = useState(true);
    const [launcherFolderPath, setLauncherFolderPath] = useState('');
    const [instanceDir, setInstanceDir] = useState('');
    const [devModeEnabled, setDevModeEnabled] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const languageDropdownRef = useRef<HTMLDivElement>(null);
    const branchDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load settings
        const loadSettings = async () => {
            try {
                const closeAfter = await GetCloseAfterLaunch();
                setCloseAfterLaunch(closeAfter);
                
                const showAnnouncements = await GetShowDiscordAnnouncements();
                setShowDiscordAnnouncements(showAnnouncements);
                
                const folderPath = await GetLauncherFolderPath();
                setLauncherFolderPath(folderPath);
                
                const customDir = await GetCustomInstanceDir();
                setInstanceDir(customDir);
                
                // Load dev mode from localStorage
                const savedDevMode = localStorage.getItem('hyprism_dev_mode');
                setDevModeEnabled(savedDevMode === 'true');
            } catch (err) {
                console.error('Failed to load settings:', err);
            }
        };
        loadSettings();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (languageDropdownRef.current && !languageDropdownRef.current.contains(e.target as Node)) {
                setIsLanguageOpen(false);
            }
            if (branchDropdownRef.current && !branchDropdownRef.current.contains(e.target as Node)) {
                setIsBranchOpen(false);
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (showTranslationConfirm) {
                    setShowTranslationConfirm(null);
                } else {
                    onClose();
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose, showTranslationConfirm]);

    const handleLanguageSelect = (langCode: Language) => {
        i18n.changeLanguage(langCode);
        setIsLanguageOpen(false);

        if (localStorage.getItem('suppressTranslationPrompt') === 'true') {
            return;
        }

        if (langCode !== Language.ENGLISH && onShowModManager) {
            const langConfig = LANGUAGE_CONFIG[langCode];
            if (langConfig) {
                setDontAskAgain(false);
                setShowTranslationConfirm({
                    langName: langConfig.nativeName,
                    langCode,
                    searchQuery: langConfig.searchQuery
                });
            }
        }
    };

    const handleConfirmTranslation = () => {
        if (showTranslationConfirm && onShowModManager) {
            onShowModManager(showTranslationConfirm.searchQuery);
            setShowTranslationConfirm(null);
            onClose();
        }
    };

    const handleIgnoreTranslation = () => {
        if (dontAskAgain) {
            localStorage.setItem('suppressTranslationPrompt', 'true');
        }
        setShowTranslationConfirm(null);
    };

    const handleLauncherBranchChange = (branch: string) => {
        setSelectedLauncherBranch(branch);
        onLauncherBranchChange(branch);
        setIsBranchOpen(false);
    };

    const handleCloseAfterLaunchChange = async () => {
        const newValue = !closeAfterLaunch;
        setCloseAfterLaunch(newValue);
        await SetCloseAfterLaunch(newValue);
    };

    const handleShowDiscordAnnouncementsChange = async () => {
        const newValue = !showDiscordAnnouncements;
        setShowDiscordAnnouncements(newValue);
        await SetShowDiscordAnnouncements(newValue);
    };

    const handleOpenLauncherFolder = async () => {
        try {
            const ok = await OpenLauncherFolder();
            console.log('OpenLauncherFolder returned:', ok, 'path:', launcherFolderPath);
            if (!ok && launcherFolderPath) {
                BrowserOpenURL(`file://${encodeURI(launcherFolderPath)}`);
            }
        } catch (err) {
            console.error('Failed to open launcher folder:', err);
            if (launcherFolderPath) {
                BrowserOpenURL(`file://${encodeURI(launcherFolderPath)}`);
            }
        }
    };

    const handleDeleteLauncherData = async () => {
        const success = await DeleteLauncherData();
        if (success) {
            setShowDeleteConfirm(false);
            // Could add a toast notification here
        }
    };

    const handleInstanceDirChange = async (dir: string) => {
        setInstanceDir(dir);
        try {
            const result = await SetInstanceDirectory(dir);
            console.log('SetInstanceDirectory result:', result);
        } catch (err) {
            console.error('Failed to set instance directory:', err);
        }
    };

    const handleBrowseInstanceDir = async () => {
        try {
            const selectedPath = await BrowseFolder(instanceDir || null);
            if (selectedPath) {
                handleInstanceDirChange(selectedPath);
            }
        } catch (err) {
            console.error('Failed to browse folder:', err);
        }
    };

    const handleTestAnnouncement = async () => {
        try {
            const testAnn = await GetTestAnnouncement();
            if (testAnn && onTestAnnouncement) {
                onTestAnnouncement(testAnn);
                onClose(); // Close settings to show announcement
            }
        } catch (err) {
            console.error('Failed to get test announcement:', err);
        }
    };

    const handleDevModeToggle = () => {
        const newValue = !devModeEnabled;
        setDevModeEnabled(newValue);
        localStorage.setItem('hyprism_dev_mode', newValue ? 'true' : 'false');
    };

    const openGitHub = () => BrowserOpenURL('https://github.com/yyyumeniku/HyPrism');
    const openBugReport = () => BrowserOpenURL('https://github.com/yyyumeniku/HyPrism/issues/new');

    const currentLangConfig = LANGUAGE_CONFIG[i18n.language as Language] || LANGUAGE_CONFIG[Language.ENGLISH];

    const tabs = [
        { id: 'general' as const, icon: Settings, label: t('General') },
        { id: 'data' as const, icon: Database, label: t('Data') },
        { id: 'about' as const, icon: Globe, label: t('About') },
        ...(devModeEnabled ? [{ id: 'developer' as const, icon: Code, label: t('Developer') }] : []),
    ];

    return (
        <>
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl flex overflow-hidden max-w-3xl w-full mx-4 max-h-[80vh]">
                    {/* Sidebar */}
                    <div className="w-48 bg-[#151515] border-r border-white/5 flex flex-col py-4">
                        <h2 className="text-lg font-bold text-white px-4 mb-4">{t('Settings')}</h2>
                        <nav className="flex-1 space-y-1 px-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-[#FFA845]/20 text-[#FFA845]'
                                            : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                        
                        {/* Dev Mode Toggle at bottom of sidebar */}
                        <div className="px-3 pt-4 border-t border-white/5 mt-4">
                            <div 
                                className="flex items-center justify-between cursor-pointer"
                                onClick={handleDevModeToggle}
                            >
                                <div className="flex items-center gap-2 text-white/40">
                                    <Code size={14} />
                                    <span className="text-xs">{t('Dev Mode')}</span>
                                </div>
                                <div className={`w-8 h-4 rounded-full flex items-center transition-colors ${devModeEnabled ? 'bg-[#FFA845]' : 'bg-white/20'}`}>
                                    <div className={`w-3 h-3 rounded-full bg-white shadow-md transform transition-transform ${devModeEnabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col min-w-0">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/5">
                            <h3 className="text-white font-medium">{tabs.find(t => t.id === activeTab)?.label}</h3>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/10 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Rosetta Warning (shown on all tabs) */}
                            {rosettaWarning && (
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-yellow-500 text-sm font-medium mb-2">{rosettaWarning.message}</p>
                                            <div className="flex flex-col gap-2">
                                                <code className="text-xs text-white/70 bg-black/30 px-2 py-1 rounded font-mono break-all">
                                                    {rosettaWarning.command}
                                                </code>
                                                {rosettaWarning.tutorialUrl && (
                                                    <button
                                                        onClick={() => BrowserOpenURL(rosettaWarning.tutorialUrl!)}
                                                        className="flex items-center gap-1 text-xs text-[#FFA845] hover:text-[#FFB85F] transition-colors w-fit"
                                                    >
                                                        <ExternalLink size={12} />
                                                        {t('Watch Tutorial')}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* General Tab */}
                            {activeTab === 'general' && (
                                <div className="space-y-6">
                                    {/* Language Selector */}
                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">{t('Language')}</label>
                                        <div ref={languageDropdownRef} className="relative">
                                            <button
                                                onClick={() => {
                                                    setIsLanguageOpen(!isLanguageOpen);
                                                    setIsBranchOpen(false);
                                                }}
                                                className="w-full h-12 px-4 rounded-xl bg-[#151515] border border-white/10 flex items-center justify-between text-white hover:border-[#FFA845]/30 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{currentLangConfig.nativeName}</span>
                                                    <span className="text-white/50 text-sm">({currentLangConfig.name})</span>
                                                </div>
                                                <ChevronDown size={16} className={`text-white/40 transition-transform ${isLanguageOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            {isLanguageOpen && (
                                                <div className="absolute top-full left-0 right-0 mt-2 z-10 max-h-60 overflow-y-auto bg-[#1a1a1a] backdrop-blur-xl border border-white/10 rounded-xl shadow-xl shadow-black/50">
                                                    {Object.values(LANGUAGE_CONFIG).map((lang) => (
                                                        <button
                                                            key={lang.code}
                                                            onClick={() => handleLanguageSelect(lang.code)}
                                                            className={`w-full px-4 py-3 flex items-center gap-2 text-sm ${i18n.language === lang.code
                                                                ? 'bg-[#FFA845]/20 text-[#FFA845]'
                                                                : 'text-white/70 hover:bg-white/10 hover:text-white'
                                                                }`}
                                                        >
                                                            {i18n.language === lang.code && <Check size={14} className="text-[#FFA845]" strokeWidth={3} />}
                                                            <div className={`flex flex-col items-start ${i18n.language === lang.code ? '' : 'ml-[22px]'}`}>
                                                                <span className="font-medium">{lang.nativeName}</span>
                                                                <span className="text-xs opacity-50">{lang.name}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Launcher Branch Selector */}
                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">{t('Update Channel')}</label>
                                        <div ref={branchDropdownRef} className="relative">
                                            <button
                                                onClick={() => {
                                                    setIsBranchOpen(!isBranchOpen);
                                                    setIsLanguageOpen(false);
                                                }}
                                                className="w-full h-12 px-4 rounded-xl bg-[#151515] border border-white/10 flex items-center justify-between text-white hover:border-[#FFA845]/30 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {selectedLauncherBranch === 'beta' ? t('Beta') : t('Stable')}
                                                    </span>
                                                    {selectedLauncherBranch === 'beta' && (
                                                        <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-500">
                                                            {t('Experimental')}
                                                        </span>
                                                    )}
                                                </div>
                                                <ChevronDown size={16} className={`text-white/40 transition-transform ${isBranchOpen ? 'rotate-180' : ''}`} />
                                            </button>

                                            {isBranchOpen && (
                                                <div className="absolute top-full left-0 right-0 mt-2 z-10 bg-[#1a1a1a] backdrop-blur-xl border border-white/10 rounded-xl shadow-xl shadow-black/50">
                                                    <button
                                                        onClick={() => handleLauncherBranchChange('release')}
                                                        className={`w-full px-4 py-3 flex items-center gap-2 text-sm ${selectedLauncherBranch === 'release'
                                                            ? 'bg-[#FFA845]/20 text-[#FFA845]'
                                                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                                                            }`}
                                                    >
                                                        {selectedLauncherBranch === 'release' && <Check size={14} className="text-[#FFA845]" strokeWidth={3} />}
                                                        <div className={`flex flex-col items-start ${selectedLauncherBranch === 'release' ? '' : 'ml-[22px]'}`}>
                                                            <span className="font-medium">{t('Stable')}</span>
                                                            <span className="text-xs opacity-50">{t('Recommended for most users')}</span>
                                                        </div>
                                                    </button>
                                                    <button
                                                        onClick={() => handleLauncherBranchChange('beta')}
                                                        className={`w-full px-4 py-3 flex items-center gap-2 text-sm ${selectedLauncherBranch === 'beta'
                                                            ? 'bg-[#FFA845]/20 text-[#FFA845]'
                                                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                                                            }`}
                                                    >
                                                        {selectedLauncherBranch === 'beta' && <Check size={14} className="text-[#FFA845]" strokeWidth={3} />}
                                                        <div className={`flex flex-col items-start ${selectedLauncherBranch === 'beta' ? '' : 'ml-[22px]'}`}>
                                                            <span className="font-medium">{t('Beta')}</span>
                                                            <span className="text-xs opacity-50">{t('Get early access to new features')}</span>
                                                        </div>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <p className="mt-2 text-xs text-white/40">
                                            {selectedLauncherBranch === 'beta' 
                                                ? t('You will receive beta updates which may be unstable.')
                                                : t('You will receive stable releases only.')}
                                        </p>
                                    </div>

                                    {/* Toggle Settings */}
                                    <div className="space-y-3">
                                        {/* Close After Launch */}
                                        <div 
                                            className="flex items-center justify-between p-3 rounded-xl bg-[#151515] border border-white/10 cursor-pointer hover:border-[#FFA845]/30 transition-colors"
                                            onClick={handleCloseAfterLaunchChange}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Power size={18} className="text-white/60" />
                                                <div>
                                                    <span className="text-white text-sm">{t('Close after launch')}</span>
                                                    <p className="text-xs text-white/40">{t('Close launcher when game starts')}</p>
                                                </div>
                                            </div>
                                            <div className={`w-10 h-6 rounded-full flex items-center transition-colors ${closeAfterLaunch ? 'bg-[#FFA845]' : 'bg-white/20'}`}>
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${closeAfterLaunch ? 'translate-x-5' : 'translate-x-1'}`} />
                                            </div>
                                        </div>

                                        {/* Discord Announcements */}
                                        <div 
                                            className="flex items-center justify-between p-3 rounded-xl bg-[#151515] border border-white/10 cursor-pointer hover:border-[#FFA845]/30 transition-colors"
                                            onClick={handleShowDiscordAnnouncementsChange}
                                        >
                                            <div className="flex items-center gap-3">
                                                <MessageCircle size={18} className="text-[#5865F2]" />
                                                <div>
                                                    <span className="text-white text-sm">{t('Show announcements')}</span>
                                                    <p className="text-xs text-white/40">{t('Show Discord announcements in launcher')}</p>
                                                </div>
                                            </div>
                                            <div className={`w-10 h-6 rounded-full flex items-center transition-colors ${showDiscordAnnouncements ? 'bg-[#5865F2]' : 'bg-white/20'}`}>
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${showDiscordAnnouncements ? 'translate-x-5' : 'translate-x-1'}`} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Data Tab */}
                            {activeTab === 'data' && (
                                <div className="space-y-6">
                                    {/* Instance Folder Input */}
                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">{t('Instance Folder')}</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={instanceDir}
                                                onChange={(e) => handleInstanceDirChange(e.target.value)}
                                                placeholder={t('Default location')}
                                                className="flex-1 h-12 px-4 rounded-xl bg-[#151515] border border-white/10 text-white text-sm placeholder:text-white/30 focus:border-[#FFA845]/50 focus:outline-none"
                                            />
                                            <button
                                                onClick={handleBrowseInstanceDir}
                                                className="h-12 px-4 rounded-xl bg-[#151515] border border-white/10 flex items-center justify-center text-white/60 hover:text-[#FFA845] hover:border-[#FFA845]/30 transition-colors"
                                                title={t('Browse')}
                                            >
                                                <Search size={18} />
                                            </button>
                                        </div>
                                        <p className="mt-2 text-xs text-white/40">{t('Leave empty to use default location')}</p>
                                    </div>

                                    {/* Launcher Data Folder */}
                                    <div>
                                        <label className="block text-sm text-white/60 mb-2">{t('Launcher Data Folder')}</label>
                                        <div className="p-4 rounded-xl bg-[#151515] border border-white/10">
                                            <p className="text-sm text-white/80 break-all mb-2">{launcherFolderPath}</p>
                                            <p className="text-xs text-white/40">{t('This is where config, cache, and Java runtime are stored. To change this location, move the folder and set the HYPRISM_DATA environment variable.')}</p>
                                        </div>
                                    </div>

                                    {/* Launcher Folder Actions */}
                                    <div className="space-y-3">
                                        <button
                                            onClick={handleOpenLauncherFolder}
                                            className="w-full h-12 px-4 rounded-xl bg-[#151515] border border-white/10 flex items-center gap-3 text-white/70 hover:text-white hover:border-[#FFA845]/30 transition-colors"
                                        >
                                            <FolderOpen size={18} />
                                            <span>{t('Open Launcher Folder')}</span>
                                        </button>

                                        <button
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="w-full h-12 px-4 rounded-xl bg-[#151515] border border-red-500/30 flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                            <span>{t('Delete All Launcher Data')}</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* About Tab */}
                            {activeTab === 'about' && (
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <button
                                            onClick={openGitHub}
                                            className="w-full h-12 px-4 rounded-xl bg-[#151515] border border-white/10 flex items-center gap-3 text-white/70 hover:text-white hover:border-[#FFA845]/30 transition-colors"
                                        >
                                            <Github size={18} />
                                            <span>{t('GitHub Repository')}</span>
                                            <ExternalLink size={14} className="ml-auto text-white/40" />
                                        </button>

                                        <button
                                            onClick={openBugReport}
                                            className="w-full h-12 px-4 rounded-xl bg-[#151515] border border-white/10 flex items-center gap-3 text-white/70 hover:text-white hover:border-[#FFA845]/30 transition-colors"
                                        >
                                            <Bug size={18} />
                                            <span>{t('Report a Bug')}</span>
                                            <ExternalLink size={14} className="ml-auto text-white/40" />
                                        </button>
                                    </div>

                                    <div className="p-4 rounded-xl bg-[#151515] border border-white/5">
                                        <p className="text-white/50 text-sm">
                                            {t('HyPrism is an unofficial launcher for Hytale. This project is not affiliated with Hypixel Studios.')}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Developer Tab */}
                            {activeTab === 'developer' && devModeEnabled && (
                                <div className="space-y-6">
                                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                                        <div className="flex items-center gap-2 text-yellow-500 text-sm font-medium">
                                            <AlertTriangle size={16} />
                                            {t('Developer options are for testing only')}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={handleTestAnnouncement}
                                            className="w-full h-12 px-4 rounded-xl bg-[#151515] border border-white/10 flex items-center gap-3 text-white/70 hover:text-white hover:border-[#FFA845]/30 transition-colors"
                                        >
                                            <MessageSquare size={18} />
                                            <span>{t('Test Discord Announcement')}</span>
                                        </button>
                                        <p className="text-xs text-white/30 ml-1">{t('Shows a test announcement popup')}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/5">
                            <button
                                onClick={onClose}
                                className="w-full h-12 rounded-xl bg-[#FFA845] hover:bg-[#FFA845]/80 text-black font-medium transition-colors"
                            >
                                {t('Done')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#1a1a1a] border border-red-500/30 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
                        <h3 className="text-lg font-bold text-red-400 mb-2">{t('Delete All Data?')}</h3>
                        <p className="text-white/60 text-sm mb-4">
                            {t('This will permanently delete all launcher data including config, cache, and game instances. This action cannot be undone.')}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
                            >
                                {t('Cancel')}
                            </button>
                            <button
                                onClick={handleDeleteLauncherData}
                                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors"
                            >
                                {t('Delete Everything')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Translation Install Confirmation Modal */}
            {showTranslationConfirm && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-2">{t('Install Translation?')}</h3>
                        <p className="text-white/60 text-sm mb-6">
                            {t('Would you like to search for {{lang}} translation mods?', { lang: showTranslationConfirm.langName })}
                        </p>

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleIgnoreTranslation}
                                className="flex-1 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
                            >
                                {t('No')}
                            </button>
                            <button
                                onClick={handleConfirmTranslation}
                                className="flex-1 py-2 rounded-xl bg-[#FFA845] hover:bg-[#FFA845]/80 text-black text-sm font-medium shadow-lg shadow-[#FFA845]/20 transition-all"
                            >
                                {t('Yes, search')}
                            </button>
                        </div>

                        <div className="mt-4 flex items-center justify-center">
                            <label className="flex items-center gap-2 text-white/50 text-xs cursor-pointer hover:text-white/70">
                                <input
                                    type="checkbox"
                                    checked={dontAskAgain}
                                    onChange={(e) => setDontAskAgain(e.target.checked)}
                                    className="rounded bg-white/10 border-white/20 text-[#FFA845] focus:ring-[#FFA845] focus:ring-offset-0"
                                />
                                {t("Don't ask again")}
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
