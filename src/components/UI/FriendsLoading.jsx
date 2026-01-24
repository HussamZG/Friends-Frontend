import React from 'react';

export default function FriendsLoading({
    text = "FRIENDS.",
    subtitle = "Loading...",
    showSubtitle = true,
    gradient = "from-indigo-600 via-purple-600 to-pink-600",
    bgGradient = "from-purple-50 to-blue-50",
    size = "large", // small, medium, large, xlarge
    animationSpeed = "normal" // slow, normal, fast
}) {
    // تحديد حجم النص
    const sizeClasses = {
        small: "text-4xl",
        medium: "text-6xl",
        large: "text-8xl",
        xlarge: "text-9xl"
    };

    // تحديد سرعة الأنيميشن
    const speedValues = {
        slow: { bounce: '1.5s', pulse: '2s', wave: '3s' },
        normal: { bounce: '1s', pulse: '1.4s', wave: '2s' },
        fast: { bounce: '0.6s', pulse: '1s', wave: '1.5s' }
    };

    const speed = speedValues[animationSpeed];

    return (
        <div
            className={`fixed inset-0 min-h-screen bg-gradient-to-br ${bgGradient} flex items-center justify-center overflow-hidden z-[9999] font-sans`}
            dir="ltr"
        >
            {/* دوائر خلفية متحركة للزينة */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
                <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* المحتوى الرئيسي */}
            <div className="relative z-10 text-center px-4">
                {/* حاوية النص الرئيسي مع تأثير الظل */}
                <div className="relative">
                    {/* ظل خلفي متوهج */}
                    <div className={`absolute inset-0 blur-2xl opacity-50 bg-gradient-to-r ${gradient}`}></div>

                    {/* النص الرئيسي */}
                    <h1 className={`${sizeClasses[size]} font-black tracking-wider relative`}>
                        {text.split('').map((letter, index) => (
                            <span
                                key={index}
                                className={`inline-block text-transparent bg-clip-text bg-gradient-to-r ${gradient} animate-bounce-letter hover:scale-110 transition-transform cursor-default`}
                                style={{
                                    animationDelay: `${index * 0.1}s`,
                                    animationDuration: speed.bounce,
                                    animationIterationCount: 'infinite'
                                }}
                            >
                                {letter === ' ' ? '\u00A0' : letter}
                            </span>
                        ))}
                    </h1>
                </div>

                {/* خط التقدم المتحرك */}
                <div className="mt-8 relative max-w-[300px] mx-auto">
                    <div className="h-2 bg-white/30 backdrop-blur-sm rounded-full overflow-hidden shadow-lg">
                        <div
                            className={`h-full bg-gradient-to-r ${gradient} rounded-full animate-loading-bar`}
                            style={{ animationDuration: speed.wave }}
                        ></div>
                    </div>
                </div>

                {/* نقاط التحميل الإبداعية */}
                <div className="flex justify-center gap-3 mt-8">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="relative"
                        >
                            <div
                                className={`w-4 h-4 rounded-full bg-gradient-to-r ${gradient} animate-pulse-dot shadow-lg`}
                                style={{
                                    animationDelay: `${i * 0.15}s`,
                                    animationDuration: speed.pulse
                                }}
                            ></div>
                            {/* حلقة خارجية متوهجة */}
                            <div
                                className={`absolute inset-0 rounded-full bg-gradient-to-r ${gradient} opacity-30 animate-ping`}
                                style={{
                                    animationDelay: `${i * 0.15}s`,
                                    animationDuration: speed.pulse
                                }}
                            ></div>
                        </div>
                    ))}
                </div>

                {/* النص الفرعي */}
                {showSubtitle && subtitle && (
                    <p className="mt-8 text-gray-700 font-semibold text-lg animate-fade-in tracking-wide">
                        {subtitle}
                    </p>
                )}

                {/* مؤشر دوراني إضافي */}
                <div className="mt-8 flex justify-center">
                    <div className="relative w-16 h-16">
                        <div className={`absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full animate-spin`} style={{ animationDuration: speed.wave }}></div>
                        <div className={`absolute inset-2 border-4 border-transparent border-t-pink-600 rounded-full animate-spin`} style={{ animationDuration: speed.wave, animationDirection: 'reverse' }}></div>
                        <div className={`absolute inset-4 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin`} style={{ animationDuration: speed.wave }}></div>
                    </div>
                </div>
            </div>

            {/* الأنيميشن المخصص */}
            <style>{`
        @keyframes bounce-letter {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-25px) scale(1.1);
          }
        }

        @keyframes loading-bar {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes pulse-dot {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.7;
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

        .animate-bounce-letter {
          animation: bounce-letter 1s ease-in-out infinite;
        }

        .animate-loading-bar {
          animation: loading-bar 2s ease-in-out infinite;
        }

        .animate-pulse-dot {
          animation: pulse-dot 1.4s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
        </div>
    );
}
