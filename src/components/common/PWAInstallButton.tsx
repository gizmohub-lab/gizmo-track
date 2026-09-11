import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall';

export const PWAInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        id="btn-pwa-install"
        onClick={install}
        className={`px-3 py-1.5 bg-[#FF5738] hover:bg-[#ff4220] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${className}`}
        title="Install Gizmo App on Desktop/Mobile"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          id="btn-pwa-install-ios"
          onClick={() => setShowIOSGuide(true)}
          className={`px-3 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${className}`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install on iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-zinc-200">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <h3 className="text-base font-black text-zinc-950">Install Gizmo on iOS</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-zinc-400 hover:text-black rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-zinc-700 leading-relaxed">
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center gap-3">
                  <Share2 className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>1. Tap the <strong>Share</strong> button in Safari toolbar at the bottom.</span>
                </div>

                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center gap-3">
                  <PlusSquare className="w-5 h-5 text-zinc-900 shrink-0" />
                  <span>2. Scroll down and tap <strong>Add to Home Screen</strong>.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-black py-2.5 text-xs font-bold text-white hover:bg-zinc-800 transition"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
