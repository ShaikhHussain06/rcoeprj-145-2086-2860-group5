import React from 'react';
import { CardioSenseLogo, CardioSenseCardSymbol, ClinicalBadgeGraphic } from './CardioSenseLogo';

export default function LandingPage({ onLaunchStudio, onExploreDashboard, onExploreQA }) {
  return (
    <div className="w-full min-h-screen bg-white text-slate-700 font-sans antialiased selection:bg-sky-100 selection:text-sky-800">
      
      {/* BEGIN: HeroSection */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden bg-gradient-to-b from-sky-50/60 via-white to-white" id="home">
        {/* Ambient light bloom */}
        <div className="absolute top-0 right-0 -mr-48 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Hero Copy Content (Left Column) */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              {/* Ethereal Pill Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-sky-100/70 border border-sky-200/80 text-sky-700 text-sm font-semibold tracking-wide mb-6 shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse"></span>
                CardioSense AI — Clinical-Grade Auscultation Technology
              </div>

              {/* Primary Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl tracking-tight text-slate-900 font-bold leading-[1.15] mb-6">
                <span className="font-serif italic text-sky-600 font-normal">CardioSense AI</span>
                <span className="text-sky-400 font-light mx-2">/</span>
                <br className="hidden sm:inline"/>Every heartbeat tells a story.
              </h1>

              {/* Subheading */}
              <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-2xl mb-9 text-balance">
                Clinical-grade heart sound intelligence powered by Acoustic AI. We help physicians hear the murmurs and nuances that matter — catching early indicators of cardiovascular conditions with real-time confidence.
              </p>

              {/* Hero Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <button 
                  onClick={onLaunchStudio}
                  style={{ backgroundColor: '#0ea5e9' }}
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-xl text-base font-bold text-white bg-sky-500 hover:bg-sky-600 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <span>Launch Studio</span>
                  <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </button>
                <button 
                  onClick={onExploreDashboard}
                  className="inline-flex items-center px-7 py-4 rounded-xl text-base font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-sm transition-all duration-200 cursor-pointer"
                >
                  Explore Auscultation Demo
                </button>
              </div>
            </div>

            {/* Hero Visual Feature Card (Right Column) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md bg-gradient-to-tr from-sky-50 via-white to-sky-100/50 p-8 rounded-3xl border border-sky-100 shadow-[0_20px_50px_-12px_rgba(56,189,248,0.25)]">
                {/* Acoustic Radial Aura Background Rings */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-72 h-72 rounded-full border border-sky-200/40 aura-ring"></div>
                  <div className="absolute w-88 h-88 rounded-full border border-sky-300/20"></div>
                </div>

                {/* Inner Card Content Display */}
                <div className="relative z-10 flex flex-col items-center justify-center py-6">
                  <div className="w-64 p-5 mb-6 bg-white/95 rounded-2xl border border-sky-200/80 shadow-md flex flex-col items-center">
                    <CardioSenseCardSymbol className="w-full h-auto py-2" />
                    <div className="mt-3.5 flex items-center justify-between w-full px-2 pt-2.5 border-t border-sky-100 text-xs text-slate-500 font-mono">
                      <span className="font-semibold">PCG SPECTROGRAM</span>
                      <span className="text-sky-600 font-bold">4.2 kHz SYNC</span>
                    </div>
                  </div>

                  {/* Telemetry Preview Simulation */}
                  <div className="w-full bg-white/90 backdrop-blur rounded-2xl p-4 border border-sky-100 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="relative flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-sky-500"></span>
                      </span>
                      <span className="text-sm font-semibold tracking-wide text-slate-700">Acoustic Signal Acquired</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded border border-sky-200">
                      96.4% CONF
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* END: HeroSection */}

      {/* BEGIN: MissionStatement */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-white via-sky-50/30 to-white text-center border-y border-sky-100">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl text-slate-800 font-medium leading-relaxed mb-6">
            A heart doesn't ask for attention. It just keeps going — <span className="bg-gradient-to-r from-sky-500 to-sky-700 bg-clip-text text-transparent font-bold">through long shifts, quiet mornings, and the people we love.</span>
          </h2>
          <p className="font-serif italic text-2xl text-slate-500 tracking-wide">We built CardioSense to listen back.</p>
        </div>
      </section>
      {/* END: MissionStatement */}

      {/* BEGIN: FeaturesGridSection */}
      <section className="py-24 bg-white" id="features">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              Care That Listens Closer
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-normal">
              We built CardioSense to give clinicians a quieter, kinder way to catch what often goes unheard.
            </p>
          </div>

          {/* 6-Card Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:border-sky-200 hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500 mb-6 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
                <div className="flex items-baseline gap-2 mb-1">
                  <h3 className="text-2xl font-bold text-sky-600">Up to 96%+</h3>
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-bold">Accuracy</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-3">Hearing the Heart</h4>
                <p className="text-base text-slate-600 leading-relaxed font-normal">
                  Our models listen for the subtle murmurs and rhythms that can slip past a busy clinic visit.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:border-sky-200 hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500 mb-6 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Earlier Answers</h3>
                <p className="text-base text-slate-600 leading-relaxed font-normal">
                  We help surface concerns long before symptoms speak up — when there's still room to act gently.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:border-sky-200 hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500 mb-6 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">A Wider Lens</h3>
                <p className="text-base text-slate-600 leading-relaxed font-normal">
                  From the irregular flutter of arrhythmia to the soft hush of a valve in trouble — we recognize the patterns worth a second look.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:border-sky-200 hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500 mb-6 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Built For Clinicians</h3>
                <p className="text-base text-slate-600 leading-relaxed font-normal">
                  Slips into existing workflows and EHRs, so the focus stays on the patient — not the software.
                </p>
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:border-sky-200 hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500 mb-6 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">Insights Worth Reading</h3>
                <p className="text-base text-slate-600 leading-relaxed font-normal">
                  Clear, human visualizations that make the data feel like a conversation, not a chart dump.
                </p>
              </div>
            </div>

            {/* Card 6 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:border-sky-200 hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500 mb-6 group-hover:scale-105 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6H2.25m0 0H3m-1.5 0H1.5m1.5 0h.01M9 3.75h6M9 6h6m-3 9v6m-6-3h12" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">A Heart Over Time</h3>
                <p className="text-base text-slate-600 leading-relaxed font-normal">
                  Track trends across months and years — because health is a story, not a snapshot.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* END: FeaturesGridSection */}

      {/* BEGIN: HowItWorksSection */}
      <section className="py-24 bg-slate-50/60 border-t border-slate-100" id="how-it-works">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              How CardioSense AI Works
            </h2>
            <p className="text-base sm:text-lg text-slate-600">
              Three simple steps — designed to feel less like a scan and more like someone paying attention.
            </p>
          </div>

          {/* 3-Step Process Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200/70 shadow-sm relative flex flex-col items-center text-center group hover:-translate-y-1 transition-all duration-300">
              <span className="absolute top-4 right-5 text-sm font-mono font-bold text-slate-400">01</span>
              <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500 mb-6 shadow-sm">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Listen</h3>
              <p className="text-base text-slate-600 leading-relaxed font-normal">
                Hold the phone close. Our app captures the soft, steady rhythm of the heart — no extra hardware needed.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200/70 shadow-sm relative flex flex-col items-center text-center group hover:-translate-y-1 transition-all duration-300">
              <span className="absolute top-4 right-5 text-sm font-mono font-bold text-slate-400">02</span>
              <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500 mb-6 shadow-sm">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Understand</h3>
              <p className="text-base text-slate-600 leading-relaxed font-normal">
                Our models translate those sounds into meaningful patterns, flagging anything worth a closer look.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200/70 shadow-sm relative flex flex-col items-center text-center group hover:-translate-y-1 transition-all duration-300">
              <span className="absolute top-4 right-5 text-sm font-mono font-bold text-slate-400">03</span>
              <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-500 mb-6 shadow-sm">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Act</h3>
              <p className="text-base text-slate-600 leading-relaxed font-normal">
                Clinicians get clear, supportive insights — so the next conversation with the patient can be the right one.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* END: HowItWorksSection */}

      {/* BEGIN: SplitFeatureSection */}
      <section className="py-24 bg-white" id="clinical-care">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Narrative Details (Left Column) */}
            <div className="lg:col-span-6 flex flex-col items-start">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
                A Quieter Kind of Cardiac Care
              </h2>
              <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed font-normal">
                CardioSense AI was built around a simple belief: catching a heart problem early should feel less like a battle and more like a conversation.
              </p>

              {/* Key Checkmarks */}
              <div className="space-y-6 mb-8 w-full">
                {/* Checkpoint 1 */}
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0 text-sky-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Catch It Early</h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      Surface the small signals long before they grow into something frightening.
                    </p>
                  </div>
                </div>

                {/* Checkpoint 2 */}
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0 text-sky-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Trust the Signal</h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      Up to 96%+ accuracy across a wide range of cardiac conditions — backed by careful clinical work.
                    </p>
                  </div>
                </div>

                {/* Checkpoint 3 */}
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0 text-sky-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Better Days Ahead</h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      Earlier answers mean gentler treatments, calmer follow-ups, and more good days at home.
                    </p>
                  </div>
                </div>

                {/* Checkpoint 4 */}
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0 text-sky-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900">Kinder on the System</h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-normal">
                      Fewer late-stage emergencies. More space for clinicians to do the work they love.
                    </p>
                  </div>
                </div>
              </div>

              {/* Learn More Link */}
              <button 
                onClick={onExploreDashboard}
                className="inline-flex items-center gap-1.5 text-base font-semibold text-sky-600 hover:text-sky-700 transition-colors cursor-pointer"
              >
                Learn more about our services
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </button>
            </div>

            {/* Feature Brand Display (Right Column) */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-lg bg-sky-100/40 p-8 sm:p-12 rounded-3xl border border-sky-200/60 shadow-xl flex flex-col items-center justify-center overflow-hidden">
                <ClinicalBadgeGraphic className="w-full max-w-md" />
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* END: SplitFeatureSection */}

      {/* BEGIN: CallToActionBanner */}
      <section className="py-16 bg-white" id="cta">
        <div className="max-w-7xl mx-auto px-6">
          <div 
            style={{ backgroundColor: '#0284c7' }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-sky-500 to-sky-600 px-8 py-12 md:py-14 text-white shadow-lg"
          >
            {/* Subtle Decorative Wave Lines in background */}
            <div className="absolute inset-0 opacity-15 pointer-events-none">
              <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1000 200">
                <path d="M0,100 C150,180 350,20 500,100 C650,180 850,20 1000,100" fill="none" stroke="white" strokeWidth="4"></path>
              </svg>
            </div>
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
              <div className="max-w-2xl">
                <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                  Bring CardioSense AI into your practice.
                </h3>
                <p className="text-sky-100 text-base sm:text-lg">
                  Give your patients the early answers they deserve.
                </p>
              </div>
              <button
                onClick={onLaunchStudio}
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-bold text-sky-700 bg-white hover:bg-sky-50 shadow hover:shadow-md transition-all whitespace-nowrap cursor-pointer text-base"
              >
                Get Started Now
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* END: CallToActionBanner */}

      {/* BEGIN: MainFooter */}
      <footer className="bg-white border-t border-slate-100 pt-16 pb-12" id="footer">
        <div className="max-w-7xl mx-auto px-6">
          {/* Footer Top Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 mb-16">
            {/* Brand Summary Column */}
            <div className="lg:col-span-4 flex flex-col items-start">
              <div className="mb-4">
                <CardioSenseLogo className="h-9" textColor="#0f172a" />
              </div>
              <p className="text-base text-slate-500 leading-relaxed max-w-sm">
                Pioneering AI solutions that analyze heart sounds to detect early signs of disease with high accuracy.
              </p>
            </div>

            {/* Links Column: Company */}
            <div className="lg:col-span-2 lg:col-start-6">
              <h4 className="text-xs uppercase tracking-wider font-bold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-2.5 text-sm text-slate-600 font-medium">
                <li><a className="hover:text-sky-600 transition-colors" href="#">About Us</a></li>
                <li><a className="hover:text-sky-600 transition-colors" href="#">Careers</a></li>
                <li><a className="hover:text-sky-600 transition-colors" href="#">Research Papers</a></li>
                <li><a className="hover:text-sky-600 transition-colors" href="#">Press &amp; Media</a></li>
              </ul>
            </div>

            {/* Links Column: Services */}
            <div className="lg:col-span-2">
              <h4 className="text-xs uppercase tracking-wider font-bold text-slate-900 mb-4">Services</h4>
              <ul className="space-y-2.5 text-sm text-slate-600 font-medium">
                <li><a className="hover:text-sky-600 transition-colors" href="#">Heart Analysis</a></li>
                <li><a className="hover:text-sky-600 transition-colors" href="#">Diagnostic Tools</a></li>
                <li><a className="hover:text-sky-600 transition-colors" href="#">Health Integration</a></li>
                <li><a className="hover:text-sky-600 transition-colors" href="#">Clinical Trials</a></li>
              </ul>
            </div>

            {/* Links Column: Legal */}
            <div className="lg:col-span-3">
              <h4 className="text-xs uppercase tracking-wider font-bold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-2.5 text-sm text-slate-600 font-medium">
                <li><a className="hover:text-sky-600 transition-colors" href="#">Privacy &amp; Terms</a></li>
                <li><a className="hover:text-sky-600 transition-colors" href="#">HIPAA Compliance</a></li>
                <li><a className="hover:text-sky-600 transition-colors" href="#">Security Standards</a></li>
                <li><a className="text-sky-600 hover:text-sky-700 font-bold" href="mailto:contact@cardiosense.ai">contact@cardiosense.ai</a></li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom Bar */}
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-400 gap-4">
            <p>© 2026 CardioSense AI Inc. All rights reserved.</p>
            <p>Built to listen back.</p>
          </div>
        </div>
      </footer>
      {/* END: MainFooter */}

    </div>
  );
}
