export default function DynamicLayout({ bannerImage, icon: Icon, title, subtitle, children }) {
    return (
        <div className="bg-app-bg min-h-screen">
            <div className="w-full h-72 relative overflow-hidden bg-gray-900">
                <img src={bannerImage} alt={title} className="w-full h-full object-cover opacity-35 scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/40 to-transparent" />
                <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl text-white text-3xl shadow-xl shadow-green-900/40 animate-fade-in">
                            <Icon />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight filter drop-shadow-sm">{title}</h1>
                            <p className="text-green-300 text-sm sm:text-lg mt-1.5 font-medium tracking-wide">{subtitle}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative -mt-6 z-20">
                {children}
            </div>
        </div>
    );
}