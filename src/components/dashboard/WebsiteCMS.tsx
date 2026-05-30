import React from 'react';
import { useStore } from '@/store';
import { motion } from 'motion/react';
import { LayoutGrid, Eye, Paintbrush, Sliders, DollarSign, Sparkles, Server, Laptop, ChevronRight } from 'lucide-react';
import { BrandLogo } from '@/components/ui/BrandLogo';
import { cn } from '@/lib/utils';

export function WebsiteCMS() {
  const { cmsSettings, updateCMSSettings } = useStore();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateCMSSettings({ heroTitle: e.target.value });
  };

  const handleSubChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateCMSSettings({ heroSub: e.target.value });
  };

  const colors: Array<{ id: 'brand' | 'indigo' | 'blue' | 'purple' | 'emerald'; label: string; class: string }> = [
    { id: 'brand', label: 'Crimson Red', class: 'bg-brand-500' },
    { id: 'indigo', label: 'Royal Indigo', class: 'bg-indigo-500' },
    { id: 'blue', label: 'Vibrant Blue', class: 'bg-blue-500' },
    { id: 'purple', label: 'Deep Purple', class: 'bg-purple-500' },
    { id: 'emerald', label: 'Tech Emerald', class: 'bg-emerald-500' },
  ];

  // Helper to resolve branding bg colors dynamically in preview
  const getBrandBg = (color: string) => {
    switch (color) {
      case 'indigo': return 'bg-indigo-600 hover:bg-indigo-750';
      case 'blue': return 'bg-blue-600 hover:bg-blue-750';
      case 'purple': return 'bg-purple-600 hover:bg-purple-750';
      case 'emerald': return 'bg-emerald-600 hover:bg-emerald-750';
      default: return 'bg-brand-500 hover:bg-brand-600';
    }
  };

  const getBrandText = (color: string) => {
    switch (color) {
      case 'indigo': return 'text-indigo-400';
      case 'blue': return 'text-blue-400';
      case 'purple': return 'text-purple-400';
      case 'emerald': return 'text-emerald-400';
      default: return 'text-brand-400';
    }
  };

  const getBrandBorder = (color: string) => {
    switch (color) {
      case 'indigo': return 'border-indigo-500/30';
      case 'blue': return 'border-blue-500/30';
      case 'purple': return 'border-purple-500/30';
      case 'emerald': return 'border-emerald-500/30';
      default: return 'border-brand-500/30';
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 gap-6">
      
      {/* CMS Title */}
      <div className="shrink-0">
        <h1 className="text-3xl font-display font-bold text-zinc-100 tracking-tight">Website CMS Live Customizer</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Customize your public marketing storefront and pricing tables. Updates synchronize on live sales pipelines.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 flex-1 min-h-0 items-stretch">
        
        {/* Visual CMS Controls Form (2 cols) */}
        <div className="xl:col-span-2 bg-zinc-900 border border-zinc-805 rounded-3xl p-6 shadow-lg space-y-5 min-h-0 overflow-y-auto">
          
          <div className="flex items-center gap-2 border-b border-zinc-850 pb-3 flex-wrap">
            <Sliders className="w-4 h-4 text-brand-500" />
            <h3 className="font-extrabold text-white text-sm">Visual Brand Controls</h3>
          </div>

          {/* Corporate brand config */}
          <div className="space-y-4 font-sans text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Public Logo / Brand Name</label>
              <input 
                type="text"
                value={cmsSettings.brandName}
                onChange={(e) => updateCMSSettings({ brandName: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-805 rounded-xl py-2.5 px-3.5 text-xs text-zinc-200 font-semibold focus:outline-none"
              />
            </div>

            {/* Layout Palette Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block flex items-center gap-1">
                <Paintbrush className="w-3.5 h-3.5 text-zinc-500" /> Accent UI Color Palette
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {colors.map((col) => {
                  const isSelected = cmsSettings.brandingColor === col.id;
                  return (
                    <button
                      key={col.id}
                      onClick={() => updateCMSSettings({ brandingColor: col.id })}
                      className={cn(
                        "flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border transition-all cursor-pointer text-[11px] font-bold",
                        isSelected 
                          ? "bg-zinc-850 hover:bg-zinc-800 border-zinc-705 text-zinc-100" 
                          : "border-transparent text-zinc-500 hover:text-zinc-350 bg-zinc-950/40"
                      )}
                    >
                      <span className={cn("w-3 h-3 rounded-full shrink-0 shadow-inner", col.class)} />
                      {col.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Landing Title & Description */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Landing Headline Hero</label>
              <input 
                type="text"
                value={cmsSettings.heroTitle}
                onChange={handleTitleChange}
                className="w-full bg-zinc-950 border border-zinc-805 rounded-xl py-2.5 px-3.5 text-xs text-zinc-200 font-semibold focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Headline Subtitle Text</label>
              <textarea 
                rows={4}
                value={cmsSettings.heroSub}
                onChange={handleSubChange}
                className="w-full bg-zinc-950 border border-zinc-805 rounded-xl py-2 px-3 text-xs text-zinc-350 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Package Rates Controls */}
            <div className="border-t border-zinc-850/80 pt-4.5 space-y-4">
              <h4 className="text-[11px] font-bold text-zinc-450 uppercase tracking-widest flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-brand-500" /> Coworking Package Pricing
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block">Hot-Desk ($/mo)</label>
                  <input 
                    type="number"
                    value={cmsSettings.hotDeskPrice}
                    onChange={(e) => updateCMSSettings({ hotDeskPrice: Number(e.target.value) || 0 })}
                    className="w-full bg-zinc-950 border border-zinc-805 rounded-xl py-2 px-3 text-xs text-zinc-200 font-semibold focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide block">Dedicated ($/mo)</label>
                  <input 
                    type="number"
                    value={cmsSettings.dedicatedPrice}
                    onChange={(e) => updateCMSSettings({ dedicatedPrice: Number(e.target.value) || 0 })}
                    className="w-full bg-zinc-950 border border-zinc-805 rounded-xl py-2 px-3 text-xs text-zinc-200 font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between bg-zinc-950/40 rounded-2xl p-4 border border-zinc-850">
                <div className="space-y-0.5 leading-none">
                  <span className="text-xs font-bold text-zinc-200">Show Pricing Block</span>
                  <p className="text-[10px] text-zinc-500 font-medium leading-normal">Render package prices on public landing pages</p>
                </div>
                
                <button
                  type="button"
                  onClick={() => updateCMSSettings({ showPricing: !cmsSettings.showPricing })}
                  className={cn(
                    "w-10 h-6 rounded-full flex items-center transition-all cursor-pointer p-1",
                    cmsSettings.showPricing ? "bg-brand-500 justify-end" : "bg-zinc-800 justify-start"
                  )}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md block" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Browser mockup — fills column height; only the page body scrolls when content overflows */}
        <div className="xl:col-span-3 flex flex-col h-full min-h-[420px] xl:min-h-0">
          
          {/* Browser chrome */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-t-3xl p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 shrink-0" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 shrink-0" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shrink-0" />
              
              <div className="bg-zinc-900 border border-zinc-801/60 rounded-lg text-[10px] text-zinc-500 font-mono px-3 py-1 ml-2 sm:ml-4 flex items-center gap-1.5 select-none font-semibold min-w-0 truncate">
                <span className="truncate">https://{cmsSettings.brandName.toLowerCase().replace(/\s+/g,'-')}.io/nyc</span>
                <span className="text-[8px] bg-emerald-500/10 text-emerald-400 font-extrabold px-1.5 py-0.5 rounded leading-none border border-emerald-500/20 shadow-sm uppercase shrink-0">Secure SSL</span>
              </div>
            </div>

            <span className="text-[10px] font-bold text-zinc-450 flex items-center gap-1.5 shrink-0 ml-2">
              <Laptop className="w-3.5 h-3.5 text-zinc-550" /> Dynamic Landing Front
            </span>
          </div>

          {/* Simulated public site viewport */}
          <div className="flex-1 min-h-0 bg-zinc-950/80 border-x border-b border-zinc-800 rounded-b-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
            
            {/* Nav mockup bar within Public site */}
            <div className="flex items-center justify-between gap-3 border-b border-zinc-900 pb-4 mb-6">
              <div className="flex items-center gap-2 min-w-0">
                <BrandLogo size="sm" className="h-4 w-4 ring-1 ring-offset-1 ring-offset-zinc-950 shrink-0" />
                <span className="font-display font-extrabold text-white text-xs tracking-tight capitalize truncate">{cmsSettings.brandName}</span>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 text-[10px] text-zinc-400 font-bold shrink-0">
                <span className="text-zinc-200 hidden sm:inline">Our Hubs</span>
                <span className="hidden sm:inline">Workspaces</span>
                <span className="hidden md:inline">Amenities</span>
                <span className={cn("text-[9px] text-white px-3 py-1.5 rounded-full shadow-sm font-extrabold leading-none whitespace-nowrap", getBrandBg(cmsSettings.brandingColor).split(' ')[0])}>Schedule Tour</span>
              </div>
            </div>

            {/* Public Hero Mockup */}
            <div className="py-6 sm:py-10 text-center space-y-4 max-w-xl mx-auto">
              <div className="inline-flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-full py-1 px-3">
                <Sparkles className={cn("w-3 h-3 shrink-0", getBrandText(cmsSettings.brandingColor))} />
                <span className="text-[8px] font-extrabold tracking-wider text-zinc-350 uppercase">MULTI-CENTER EXPANSION PLATFORM</span>
              </div>

              <h2 className="text-2xl font-display font-black text-white leading-tight tracking-tight">
                {cmsSettings.heroTitle}
              </h2>

              <p className="text-xs text-zinc-450 leading-relaxed font-semibold">
                {cmsSettings.heroSub}
              </p>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button className={cn("px-5 py-2 rounded-xl text-[10px] text-white font-extrabold shadow-md transition-all whitespace-nowrap", getBrandBg(cmsSettings.brandingColor).split(' ')[0])}>Select Workspace Coordinates</button>
                <button className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 rounded-xl text-[10px] font-extrabold transition-all whitespace-nowrap">Explore floor map</button>
              </div>
            </div>

            {/* Simulated Live custom pricing blocks */}
            {cmsSettings.showPricing && (
              <div className="border-t border-zinc-900/40 pt-6">
                <h4 className="text-center font-black text-white text-xs uppercase tracking-widest pb-6">Flexible Workspace Pricing Suites</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-2">
                  {[
                    { title: 'Hot Desk Membership', price: cmsSettings.hotDeskPrice, desc: 'Cowork on unassigned collaborative seats with gigabit fiber link.' },
                    { title: 'Dedicated Desk', price: cmsSettings.dedicatedPrice, desc: 'Pristine assigned workstation layout featuring Kisi RFID door keys.' },
                    { title: 'Corporate Suite', price: cmsSettings.meetingPrice, desc: 'Secure private glass offices coupled with elite meeting allocations.' },
                  ].map((pkg, idx) => (
                    <div key={idx} className={cn("bg-zinc-950 p-4.5 rounded-2xl border border-zinc-900 flex flex-col justify-between text-left space-y-3 shadow-md pb-5", idx===1 ? `border-2 ${getBrandBorder(cmsSettings.brandingColor)}` : '')}>
                      <div className="space-y-1 leading-none">
                        <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase">Package {idx+1}</span>
                        <h5 className="font-extrabold text-zinc-200 text-xs py-1 leading-snug">{pkg.title}</h5>
                        <p className="text-[10px] text-zinc-500 leading-normal">{pkg.desc}</p>
                      </div>

                      <div className="pt-3 border-t border-zinc-900 leading-none flex items-baseline gap-1">
                        <span className="text-sm font-black text-white font-mono">${pkg.price}</span>
                        <span className="text-[9px] text-zinc-500 font-semibold uppercase">/ month</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
