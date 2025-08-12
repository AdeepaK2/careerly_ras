export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-[#e4d7ff] to-[#FFFFFF] text-gray-800 mt-15">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-2 mb-6 md:mb-0">
          <img alt="" className="h-12" src="logo.png" />
          <span className="text-purple-600 font-bold text-3xl">Careerly</span>
        </div>
        <div className="flex items-center space-x-2">
          <p className="text-center max-w-xl text-sm font-light leading-relaxed text-gray-600">
            Powered by <span className="text-[#61106a] font-bold">IEEE RAS Student Branch Chapter of University of Moratuwa</span>
          </p>
          <img alt="" className="h-20" src="RAS_SB.PNG" />
        </div>
      </div>
      <div className="border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-gray-400 text-sm font-normal">
          <a href="/">Careerly</a> ©2025. All rights reserved.
        </div>
      </div>
    </footer>
  );
}