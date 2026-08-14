import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-b from-[#e4d7ff] to-[#FFFFFF] text-gray-800 mt-15">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:space-x-2 mb-4 md:mb-0 text-center sm:text-left">
          <img alt="" className="h-12 w-12 object-contain mb-2 sm:mb-0" src="logo.png" />
          <span className="text-purple-600 font-bold text-3xl">Careerly</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center sm:space-x-2 gap-2 text-center sm:text-left">
          <p className="max-w-xl text-sm font-light leading-relaxed text-gray-600">
            Powered by <span className="text-[#61106a] font-bold">IEEE RAS Student Branch Chapter of University of Moratuwa</span>
          </p>
          <a
            href="https://ieee-ras.uom.lk/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="IEEE RAS UoM website"
          >
            <img alt="IEEE RAS UoM" className="h-16 w-auto object-contain -ml-5" src="RAS_SB.PNG" />
          </a>
        </div>
      </div>
      <div className="border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-gray-400 text-sm font-normal">
          <Link href="/">Careerly</Link> ©{new Date().getFullYear()}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}