import React from 'react';

export default function FriendsLoading({
  showSubtitle = true,
  subtitle = "جاري التحميل...",
  animationSpeed = "normal" // slow, normal, fast
}) {
  // تحديد سرعة الأنيميشن
  const speedValues = {
    slow: { pulse: '2s', dots: '1.6s' },
    normal: { pulse: '1.5s', dots: '1.2s' },
    fast: { pulse: '1s', dots: '0.8s' }
  };

  const speed = speedValues[animationSpeed];

  return (
    <div className="fixed inset-0 min-h-screen flex items-center justify-center overflow-hidden relative z-[9999] bg-white dark:bg-[#1e1e2e] transition-colors duration-500">
      {/* المحتوى الرئيسي */}
      <div className="text-center px-4">
        {/* الشعار والنص */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {/* أيقونة F */}
          <div className="relative">
            {/* توهج خلفي */}
            <div className="absolute inset-0 rounded-2xl blur-xl opacity-50 animate-pulse-slow bg-gradient-to-br from-purple-500 to-purple-700"></div>

            {/* المربع الرئيسي */}
            <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse-slow bg-gradient-to-br from-purple-500 to-purple-700">
              <span className="text-4xl font-bold text-white">F</span>
            </div>
          </div>

          {/* نص Friends */}
          <div className="relative">
            <h1 className="text-6xl font-bold tracking-tight">
              <span className="text-gray-900 dark:text-white">Friends</span>
              <span className="text-purple-500">.</span>
            </h1>
          </div>
        </div>

        {/* نقاط التحميل */}
        <div className="flex justify-center gap-2 mb-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 bg-purple-500 rounded-full animate-bounce-dot shadow-[0_0_10px_rgba(168,85,247,0.5)]"
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: speed.dots
              }}
            ></div>
          ))}
        </div>

        {/* النص الفرعي */}
        {showSubtitle && subtitle && (
          <p className="text-sm font-medium animate-fade-in text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>

      {/* الأنيميشن المخصص */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }

        @keyframes bounce-dot {
          0%, 100% {
            transform: translateY(0);
            opacity: 1;
          }
          50% {
            transform: translateY(-8px);
            opacity: 0.5;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 1.5s ease-in-out infinite;
        }

        .animate-bounce-dot {
          animation: bounce-dot 1.2s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
}
