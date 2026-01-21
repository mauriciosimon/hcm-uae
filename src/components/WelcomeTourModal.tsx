'use client';

import { useState, useEffect } from 'react';
import { useTour } from '@/contexts/TourContext';
import { Sparkles, Play, X, MapPin } from 'lucide-react';

export default function WelcomeTourModal() {
  const { isFirstVisit, tourStatus, startTour, skipAllTours } = useTour();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show modal on first visit if welcome tour not completed
    if (isFirstVisit && !tourStatus.welcome) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFirstVisit, tourStatus.welcome]);

  const handleStartTour = () => {
    setIsOpen(false);
    startTour('welcome');
  };

  const handleSkip = () => {
    setIsOpen(false);
    skipAllTours();
  };

  const handleExploreLater = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleExploreLater}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Sparkles size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome to HCM UAE!</h2>
          <p className="text-teal-100">
            Your complete Human Capital Management solution
          </p>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 text-center mb-6">
            Would you like a quick tour to help you get started?
            You can always restart the tour later from Settings.
          </p>

          {/* Features preview */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: '👥', label: 'Employee Management' },
              { icon: '🏖️', label: 'Leave Tracking' },
              { icon: '💰', label: 'Gratuity Calculator' },
              { icon: '⏰', label: 'Overtime Tracking' },
              { icon: '📄', label: 'Document Management' },
              { icon: '💳', label: 'Payroll & WPS' },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-xl">{feature.icon}</span>
                <span className="text-sm text-gray-700">{feature.label}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleStartTour}
              className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
            >
              <Play size={18} />
              Take the Tour
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleExploreLater}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-xl font-medium transition-colors"
              >
                <MapPin size={16} />
                Explore on My Own
              </button>

              <button
                onClick={handleSkip}
                className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 py-2.5 px-4 rounded-xl transition-colors"
              >
                <X size={16} />
                Skip
              </button>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="px-6 pb-6">
          <p className="text-xs text-gray-400 text-center">
            You can restart the tour anytime from Settings → Take a Tour
          </p>
        </div>
      </div>
    </div>
  );
}
