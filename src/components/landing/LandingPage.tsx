import { motion, useScroll, useTransform } from 'motion/react';
import { useStore } from '@/store';
import { ArrowRight, Activity, Building, Zap, Users, Monitor, LayoutDashboard, Sparkles, ChevronRight, Check } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { LampContainer } from '@/components/ui/lamp';
import ColorBends from '@/components/ColorBends';
import { Radar, IconContainer } from '@/components/ui/radar-effect';
import { BrandLogo } from '@/components/ui/BrandLogo';

export function LandingPage() {
  const requestPlatformAccess = useStore((state) => state.requestPlatformAccess);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('annually');
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const handleScrollTo = (e: React.MouseEvent<HTMLElement>, id: string) => {
    e.preventDefault();
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="home" ref={containerRef} className="min-h-screen bg-[#050505] text-zinc-200 font-sans overflow-x-hidden relative selection:bg-brand-500/30">
      
      {/* Animated light background */}
      <div className="absolute top-0 inset-x-0 h-[100vh] pointer-events-auto overflow-hidden flex justify-center items-center">
        <div style={{ width: '100%', height: '800px', position: 'absolute', top: '-10vh' }}>
          <ColorBends
            colors={["#ff0a16", "#ff5c5c", "#7d0000"]}
            rotation={90}
            speed={0.2}
            scale={1.5}
            frequency={1}
            warpStrength={1}
            mouseInfluence={1}
            noise={0.15}
            parallax={0.5}
            iterations={1}
            intensity={1.5}
            bandWidth={6}
            transparent={true}
          />
        </div>
        <motion.div 
          animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-600/5 blur-[120px] pointer-events-none" 
        />
        <motion.div 
          animate={{ rotate: -360, scale: [1, 1.2, 1] }} 
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-red-900/5 blur-[130px] pointer-events-none" 
        />
      </div>
 
       {/* Navigation */}
       <div className="fixed top-0 left-0 right-0 z-50 flex justify-center w-full px-4 sm:px-6 pt-4 sm:pt-6">
         <nav className="flex items-center justify-between w-full max-w-5xl backdrop-blur-xl bg-zinc-950/70 border border-brand-500/30 shadow-[0_0_25px_rgba(255,10,22,0.15)] shadow-2xl rounded-full px-4 py-2 sm:py-2.5">
           <div className="flex items-center gap-3 pl-2">
             <button onClick={(e) => handleScrollTo(e, 'home')} className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity">
               <BrandLogo id="landing-logo" size="sm" className="sm:h-8 sm:w-8" />
               <span className="text-white font-bold tracking-tight text-base sm:text-lg">CoworkingOS</span>
             </button>
           </div>
           <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
             <a href="#home" onClick={(e) => handleScrollTo(e, 'home')} className="hover:text-white transition-colors">Home</a>
             <a href="#ecosystem" onClick={(e) => handleScrollTo(e, 'ecosystem')} className="hover:text-white transition-colors">Features</a>
             
             <a href="#pricing" onClick={(e) => handleScrollTo(e, 'pricing')} className="hover:text-white transition-colors">Pricing</a>
              <a href="#about" onClick={(e) => handleScrollTo(e, 'about')} className="hover:text-white transition-colors">About Us</a>
           </div>
           <div className="flex items-center gap-4">
             <button className="text-sm font-medium text-zinc-400 hover:text-white hidden sm:block transition-colors" onClick={() => requestPlatformAccess()}>
               Sign In
             </button>
             <button 
               onClick={() => requestPlatformAccess()}
               className="group bg-brand-600 text-white px-5 py-1.5 sm:py-2 rounded-full text-sm font-bold hover:bg-brand-500 transition-all flex items-center gap-2"
             >
               Enter Platform
               <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
             </button>
           </div>
         </nav>
       </div>
 
       {/* Hero Section */}
       <section className="relative z-10 pt-36 pb-24 lg:pt-44 lg:pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
         <motion.div
           initial={{ opacity: 0, scale: 0.9, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
           onClick={(e) => handleScrollTo(e, 'dashboard')}
           className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-brand-500/20 bg-brand-500/10 backdrop-blur-md shadow-sm mb-10 text-brand-500 hover:bg-brand-500/20 transition-colors cursor-pointer"
         >
           <Sparkles className="w-4 h-4 text-brand-500" />
           <span className="text-sm font-bold">Meet intelligent workspace operations</span>
           <ChevronRight className="w-4 h-4 opacity-50" />
         </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-7xl lg:text-8xl font-display font-extrabold tracking-tight text-white max-w-5xl leading-[1.05]"
        >
          Run coworking spaces like a <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-rose-500 to-red-600">tech startup.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 text-lg sm:text-2xl text-zinc-400 font-medium max-w-3xl leading-relaxed"
        >
          Replace messy spreadsheets with a beautiful, AI-powered OS that orchestrates bookings, billing, logic, and CRM.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 flex flex-col sm:flex-row items-center gap-4"
        >
          <button 
            onClick={() => requestPlatformAccess()}
            className="group relative px-8 py-4 bg-brand-600 text-white rounded-full font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_-10px_rgba(255,10,22,0.5)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-brand-500 via-rose-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative flex items-center gap-2">
              Explore Demo Environment
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </motion.div>

        {/* 3D Dashboard Showcase */}
        <motion.div 
          style={{ y, opacity }}
          initial={{ opacity: 0, y: 100, rotateX: 15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.2, delay: 0.4, type: "spring", stiffness: 50 }}
          className="mt-20 w-full max-w-6xl relative perspective-1000"
          id="dashboard"
        >
          <div className="absolute -inset-4 rounded-[40px] bg-gradient-to-b from-brand-500/20 to-red-900/20 blur-3xl" />
          <motion.div 
            whileHover={{ rotateX: 2, rotateY: -2, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative rounded-3xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden transform-style-3d"
          >
            {/* Fake macOS style Header */}
            <div className="h-14 border-b border-zinc-800 flex items-center px-6 gap-2 bg-zinc-900/40 shadow-sm">
              <div className="flex gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-zinc-700" />
                <div className="w-3.5 h-3.5 rounded-full bg-zinc-700" />
                <div className="w-3.5 h-3.5 rounded-full bg-zinc-700" />
              </div>
              <div className="mx-auto bg-zinc-800/60 px-24 py-1.5 rounded-md border border-zinc-700/50 shadow-sm">
                 <div className="w-20 h-2 bg-zinc-600 rounded-full" />
              </div>
            </div>
            
            {/* App Content Mockup */}
            <div className="p-8 grid grid-cols-12 gap-8 h-[500px] bg-zinc-950/50">
               {/* Left Sidebar Mock */}
               <div className="col-span-3 space-y-4">
                  <div className="h-8 w-32 bg-zinc-800/50 rounded-lg mb-8" />
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={cn("h-10 rounded-xl", i === 1 ? "bg-zinc-900 shadow-sm border border-zinc-800 w-full" : "bg-zinc-800/50 w-5/6")} />
                  ))}
               </div>
               
               {/* Main Context Mock */}
               <div className="col-span-9 flex flex-col gap-6">
                 <div className="flex gap-6">
                   <div className="flex-1 h-36 rounded-2xl bg-zinc-900 shadow-sm border border-zinc-800 p-6 flex flex-col justify-center">
                      <div className="w-12 h-12 bg-zinc-800 rounded-xl mb-4" />
                      <div className="h-4 w-24 bg-zinc-800 rounded-full mb-2" />
                      <div className="h-6 w-32 bg-zinc-700 rounded-full" />
                   </div>
                   <div className="flex-1 h-36 rounded-2xl bg-zinc-900 shadow-sm border border-zinc-800 p-6 flex flex-col justify-center">
                      <div className="w-12 h-12 bg-zinc-800 rounded-xl mb-4" />
                      <div className="h-4 w-24 bg-zinc-800 rounded-full mb-2" />
                      <div className="h-6 w-32 bg-zinc-700 rounded-full" />
                   </div>
                   <div className="flex-1 h-36 rounded-2xl bg-zinc-900 shadow-sm border border-zinc-800 p-6 flex flex-col justify-center">
                      <div className="w-12 h-12 bg-zinc-800 rounded-xl mb-4" />
                      <div className="h-4 w-24 bg-zinc-800 rounded-full mb-2" />
                      <div className="h-6 w-32 bg-zinc-700 rounded-full" />
                   </div>
                 </div>
                 <div className="flex-1 rounded-2xl bg-zinc-900 shadow-sm border border-zinc-800 p-8 flex items-end gap-3">
                     {[...Array(16)].map((_, i) => (
                       <div key={i} className="flex-1 rounded-t-md bg-gradient-to-t from-brand-900 to-brand-500" style={{ height: `${30 + Math.random() * 70}%` }} />
                     ))}
                 </div>
               </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Ecosystem Integration Showcase */}
      <section className="py-32 bg-[#050505] relative z-10 overflow-hidden border-t border-zinc-900" id="ecosystem">
        <div className="text-center mb-16 max-w-3xl mx-auto px-6 relative z-50">
          <h2 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight">Everything connects beautifully.</h2>
          <p className="mt-6 text-xl text-zinc-400 font-medium leading-relaxed">Built from the ground up for coworking operators, combining beautiful design with hardcore operational power. Directly plugs into your existing tech stack.</p>
        </div>

        <div className="flex w-full items-center justify-center bg-[#050505] pt-10 pb-20 relative px-4">
          <div className="relative flex h-[500px] w-full max-w-4xl flex-col items-center justify-center space-y-12">
            {/* Row 1 */}
            <div className="mx-auto w-full max-w-3xl relative z-50">
              <div className="flex w-full items-center justify-center space-x-10 md:justify-between md:space-x-0">
                <IconContainer
                  text="Payment Gateway"
                  delay={0.2}
                  icon={<div className="h-7 w-7 text-brand-500 flex justify-center items-center font-serif italic text-lg font-bold border-2 border-brand-500 rounded-full">S</div>}
                />
                <IconContainer
                  delay={0.4}
                  text="Access Control"
                  icon={<Zap className="h-7 w-7 text-brand-500" />}
                />
                <IconContainer
                  text="Print Management"
                  delay={0.3}
                  icon={<Monitor className="h-7 w-7 text-brand-500" />}
                />
              </div>
            </div>
            {/* Row 2 */}
            <div className="mx-auto w-full max-w-md relative z-50">
              <div className="flex w-full items-center justify-center space-x-10 md:justify-between md:space-x-0">
                <IconContainer
                  text="Accounting Software"
                  delay={0.5}
                  icon={<Activity className="h-7 w-7 text-brand-500" />}
                />
                <IconContainer
                  text="WiFi Management"
                  delay={0.8}
                  icon={<LayoutDashboard className="h-7 w-7 text-brand-500" />}
                />
              </div>
            </div>
            {/* Row 3 */}
            <div className="mx-auto w-full max-w-3xl relative z-50">
              <div className="flex w-full items-center justify-center space-x-10 md:justify-between md:space-x-0">
                <IconContainer
                  delay={0.6}
                  text="CRM Sync"
                  icon={<Users className="h-7 w-7 text-brand-500" />}
                />
                <IconContainer
                  delay={0.7}
                  text="Member Portal"
                  icon={<Building className="h-7 w-7 text-brand-500" />}
                />
              </div>
            </div>

            <Radar className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-12" />
            <div className="absolute bottom-0 z-[41] h-[100px] top-auto inset-x-0 bg-gradient-to-t from-[#050505] to-transparent" />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 sm:py-32 bg-[#050505] relative z-10 overflow-hidden border-t border-zinc-900" id="pricing">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] rounded-full bg-brand-950/20 blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-50">
          <div className="text-center mb-16 sm:mb-20 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/20 bg-brand-500/10 mb-6 text-brand-400"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span className="text-xs font-bold uppercase tracking-widest">Pricing Strategy</span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-tight"
            >
              Simple flat plans. <br />Built to scale with your community.
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-base sm:text-lg text-zinc-400 font-medium leading-relaxed"
            >
              Choose the perfect tier for your coworking empire. Start today in our sandbox preview environments with one click.
            </motion.p>
            
            {/* Billing period toggle */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 inline-flex items-center gap-1.5 p-1.5 bg-zinc-950 border border-zinc-800 rounded-full shadow-lg"
            >
              <button
                type="button"
                onClick={() => setBillingPeriod('monthly')}
                className={cn(
                  "px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer select-none",
                  billingPeriod === 'monthly' 
                    ? "bg-brand-600 text-white shadow-md shadow-brand-500/20" 
                    : "text-zinc-500 hover:text-white"
                )}
              >
                Billed Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod('annually')}
                className={cn(
                  "px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer select-none",
                  billingPeriod === 'annually' 
                    ? "bg-brand-600 text-white shadow-md shadow-brand-500/20" 
                    : "text-zinc-500 hover:text-white"
                )}
              >
                <span>Billed Annually</span>
                <span className="px-2 py-0.5 bg-brand-500/20 border border-brand-500/30 rounded-full text-[9px] text-brand-400 font-extrabold uppercase tracking-wider">Save 20%</span>
              </button>
            </motion.div>
          </div>

          {/* Grid Layout of Pricing Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
            {[
              {
                id: 'launch',
                name: 'Launch',
                description: 'Perfect for single-location spaces starting their digital journey.',
                price: { monthly: 149, annually: 119 },
                features: [
                  '1 Coworking Location',
                  'Up to 100 Members Managed',
                  'Interactive 2D Floor Map View',
                  'Standard Access Node Control',
                  'Standard CRM Pipelines',
                  'Accounting & Billing Ledger',
                  'Support Desk Ticket Management'
                ],
                cta: 'Begin Launch MVP',
                popular: false
              },
              {
                id: 'growth',
                name: 'Growth',
                description: 'All-in-one operations platform for fast-growing spaces.',
                price: { monthly: 299, annually: 239 },
                features: [
                  'Up to 3 Managed Locations',
                  'Up to 500 Active Members',
                  'Live RFID Guest Card Printing',
                  'Automatic Invoicing & Auto-Debit',
                  'Kisi, Brivo & SALTO Integrations',
                  'Advanced Real-time Workspace CRM',
                  'Inter-office Team Chat & Slack Alerts'
                ],
                cta: 'Deploy Growth Demo',
                popular: true
              },
              {
                id: 'scale',
                name: 'Scale',
                description: 'Enterprise grade power & customized whitelabel portals.',
                price: { monthly: 599, annually: 479 },
                features: [
                  'Unlimited Active Locations',
                  'Unlimited Active Shared Members',
                  'Fully Whitelabel Portal Branding',
                  'Biometric Access Integrations',
                  'Automated Mass SMS Blast System',
                  'Dedicated SLA & System Architect',
                  'Enterprise Custom API Webhooks'
                ],
                cta: 'Provision Scale Stack',
                popular: false
              }
            ].map((plan, index) => {
              const currentPrice = billingPeriod === 'annually' ? plan.price.annually : plan.price.monthly;
              const yearlyTotal = plan.price.annually * 12;
              
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.15, type: "spring", stiffness: 60 }}
                  className={cn(
                    "relative flex flex-col rounded-3xl p-8 border transition-all duration-300 bg-zinc-950/40 backdrop-blur-md",
                    plan.popular 
                      ? "border-brand-500 bg-gradient-to-b from-brand-950/20 to-zinc-950/60 shadow-[0_15px_40px_-15px_rgba(255,10,22,0.30)]" 
                      : "border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40 shadow-sm"
                  )}
                >
                  {/* Decorative badge for the most popular tier */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-brand-600 border border-brand-400 text-white rounded-full text-[10px] uppercase font-extrabold tracking-widest shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                      <Sparkles className="w-3 h-3 text-white" />
                      Most Popular
                    </div>
                  )}

                  {/* Header info */}
                  <div className="mb-6">
                    <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-tight">{plan.name}</h3>
                    <p className="text-sm text-zinc-400 mt-2 font-medium min-h-[40px] leading-relaxed">{plan.description}</p>
                  </div>

                  {/* Price display */}
                  <div className="mb-8 border-b border-zinc-900 pb-6 flex flex-col justify-end">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-display font-black text-white">${currentPrice}</span>
                      <span className="text-zinc-500 font-bold text-sm">/ mo</span>
                    </div>
                    <div className="h-4 mt-2">
                      {billingPeriod === 'annually' ? (
                        <p className="text-[10px] text-zinc-500 font-bold tracking-wide uppercase">
                          ${yearlyTotal.toLocaleString()} Billed yearly (Includes 20% savings)
                        </p>
                      ) : (
                        <p className="text-[10px] text-zinc-500 font-bold tracking-wide uppercase text-zinc-500/80">
                          Billed Month-to-month
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Features listing */}
                  <div className="space-y-4 mb-10 flex-1">
                    <p className="text-zinc-300 text-xs font-extrabold uppercase tracking-wider mb-5">Features Included:</p>
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <div className={cn(
                          "w-4 h-4 rounded-full shrink-0 flex items-center justify-center border mt-0.5",
                          plan.popular 
                            ? "bg-brand-950/50 border-brand-500/40 text-brand-400" 
                            : "bg-zinc-900 border-zinc-800 text-zinc-500"
                        )}>
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="text-xs sm:text-sm text-zinc-300 font-medium leading-normal">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action button */}
                  <button
                    onClick={() => requestPlatformAccess()}
                    className={cn(
                      "w-full py-4 px-6 rounded-2xl text-xs font-bold transition-all duration-300 active:scale-98 flex items-center justify-center gap-2 cursor-pointer shadow-md",
                      plan.popular
                        ? "bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/20 shadow-[0_12px_24px_-8px]"
                        : "bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-white"
                    )}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 w-full overflow-hidden bg-[#050505]" id="cta">
        <LampContainer>
          <motion.h2
            initial={{ opacity: 0.5, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="mt-8 bg-gradient-to-br from-zinc-300 to-zinc-500 py-4 bg-clip-text text-center text-5xl font-display font-extrabold tracking-tight text-transparent md:text-7xl"
          >
            Stop using <br /> spreadsheets.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.5,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="text-zinc-300 mt-6 mb-12 text-2xl font-medium max-w-2xl mx-auto leading-relaxed text-center"
          >
            Give your team the platform they deserve and your members the experience they expect.
          </motion.p>
          <motion.button 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.7,
              duration: 0.8,
              ease: "easeInOut",
            }}
            onClick={() => requestPlatformAccess()}
            className="px-10 py-5 bg-brand-500 text-white rounded-full font-bold text-xl hover:bg-brand-600 hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,10,22,0.3)] flex items-center gap-3 mx-auto"
          >
            Launch Platform Preview
            <ArrowRight className="w-6 h-6" />
          </motion.button>
        </LampContainer>
      </section>

      {/* About Us Section */}
      <section className="py-24 sm:py-32 bg-[#050505] relative z-10 overflow-hidden border-t border-zinc-900" id="about">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] rounded-full bg-brand-950/10 blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-50">
          <div className="text-center mb-16 sm:mb-20 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/20 bg-brand-500/10 mb-6 text-brand-400"
            >
              <Users className="w-3.5 h-3.5 text-brand-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-400">Our Story</span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-tight"
            >
              Orchestrating the next generation <br />of shared work environments.
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-base sm:text-lg text-zinc-400 font-medium leading-relaxed"
            >
              We are a team of software engineers, community builders, and IoT researchers obsessed with modernizing physical spaces.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "Hardware Orchestration",
                desc: "We bring physical space alive. Integrated with smart access locks, Zebra RFID printers, and local networks, CoworkingOS turns offline rooms into cohesive cloud nodes.",
                icon: Zap
              },
              {
                title: "Automation First",
                desc: "We believe community managers should focus on members, not spreadsheets. Every recurring renewal, gate authorization, and receipt happens automatically.",
                icon: Users
              },
              {
                title: "Scale Framework",
                desc: "Whether you run a single local neighborhood hotdesk or a multi-national multitenant coworking brand, our platform architecture provides unified operations.",
                icon: Building
              }
            ].map((pillar, i) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-zinc-950/40 border border-zinc-900/80 rounded-3xl p-8 hover:border-zinc-800 transition-all duration-300 backdrop-blur-md"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-950/40 border border-brand-500/20 flex items-center justify-center mb-6 text-brand-400">
                  <pillar.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{pillar.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed font-semibold">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-zinc-900 py-16 text-center text-zinc-500 font-medium relative z-10">
        <div className="flex items-center justify-center gap-2 mb-6 opacity-80">
          <BrandLogo id="footer-logo" size="md" className="ring-offset-[#050505]" />
          <span className="text-white font-bold tracking-tight text-lg">CoworkingOS</span>
        </div>
        <p>&copy; {new Date().getFullYear()} CoworkingOS. A demonstration prototype.</p>
      </footer>
    </div>
  );
}
