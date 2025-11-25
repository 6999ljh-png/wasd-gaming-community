import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { X, Download, Share } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPWA() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as standalone app
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://');
    
    setIsStandalone(isInStandaloneMode);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const lastDismissed = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = (Date.now() - lastDismissed) / (1000 * 60 * 60 * 24);

    // Show prompt if not in standalone mode, not recently dismissed (7 days)
    if (!isInStandaloneMode && daysSinceDismissed > 7) {
      // For Android/Chrome
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
        setShowPrompt(true);
      });

      // For iOS, show manual instructions after 3 seconds
      if (iOS) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      }
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setShowPrompt(false);
  };

  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <Card className="p-4 bg-white dark:bg-slate-900 border-purple-500/20 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                {t('pwa.installTitle') || '安装 GameHub 应用'}
              </h3>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {isIOS ? (
              // iOS Instructions
              <div className="space-y-3">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t('pwa.iosInstructions') || '在 iPhone 上安装此应用：'}
                </p>
                <ol className="text-sm text-slate-600 dark:text-slate-400 space-y-2 ml-4 list-decimal">
                  <li>
                    <span className="flex items-center gap-2">
                      点击 Safari 底部的
                      <Share className="w-4 h-4 inline" />
                      分享按钮
                    </span>
                  </li>
                  <li>向下滚动并选择"添加到主屏幕"</li>
                  <li>点击"添加"即可完成安装</li>
                </ol>
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                >
                  {t('pwa.gotIt') || '知道了'}
                </Button>
              </div>
            ) : (
              // Android/Desktop Install Button
              <div className="space-y-3">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t('pwa.androidDesc') || '将 GameHub 添加到主屏幕，获得更好的体验'}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleInstall}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t('pwa.install') || '安装应用'}
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    variant="ghost"
                    size="sm"
                  >
                    {t('common.cancel') || '取消'}
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                ⚡ {t('pwa.feature.fast') || '快速启动'}
              </span>
              <span className="flex items-center gap-1">
                📱 {t('pwa.feature.offline') || '离线访问'}
              </span>
              <span className="flex items-center gap-1">
                🔔 {t('pwa.feature.notifications') || '推送通知'}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
