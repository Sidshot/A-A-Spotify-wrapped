import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import { Download } from 'lucide-react';
import { BentoCard } from './components/BentoCard';
import statsData from './data/stats.json';

export default function App() {
  const [stats, setStats] = useState(null);
  const passportRef = useRef(null);

  useEffect(() => {
    setStats(statsData);
  }, []);

  const handleDownload = async () => {
    if (passportRef.current) {
      try {
        const dataUrl = await toPng(passportRef.current, { cacheBust: true, backgroundColor: '#000000' });
        const link = document.createElement('a');
        link.download = 'my-spotify-wrapped.png';
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Failed to export image", err);
      }
    }
  };

  if (!stats) return <div className="flex h-screen items-center justify-center bg-black text-white font-bold text-2xl">Loading Your Wrapped...</div>;

  return (
    <div className="snap-y-container bg-black text-white w-full font-sans">
      
      {/* Slide 1: Intro */}
      <section className="snap-section items-center px-6" style={{ background: 'radial-gradient(circle at top, var(--era-1-color) 0%, transparent 60%)' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="text-center z-10"
        >
          <h1 className="text-[64px] md:text-[96px] font-black italic leading-tight mb-6 tracking-tighter drop-shadow-2xl">
            {stats.totalDays} Days.<br/>
            {stats.totalHours} Hours.<br/>
            One Evolving Taste.
          </h1>
          <p className="text-xl md:text-2xl text-white/60 font-medium">Scroll down to explore your journey</p>
        </motion.div>
      </section>

      {/* Slide 2: The Top 1% (Artists) */}
      <section className="snap-section px-6 md:px-12" style={{ background: 'radial-gradient(circle at bottom right, var(--era-2-color) 0%, transparent 70%)' }}>
        <div className="max-w-6xl w-full mx-auto flex flex-col justify-center h-full py-12">
          <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-black mb-8 italic tracking-tighter"
          >
            The Top 1%
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto">
            {/* #1 Artist */}
            <BentoCard className="md:col-span-2 md:row-span-2 relative overflow-hidden group min-h-[400px]" delay={0.1}>
              <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent z-0 pointer-events-none" />
              <div className="relative z-10 flex flex-col justify-end h-full">
                <span className="text-white/60 uppercase tracking-widest text-sm font-bold mb-2">The Main Character</span>
                <h3 className="text-6xl md:text-8xl font-black italic mb-2 leading-none">{stats.topArtist?.name}</h3>
                <p className="text-2xl text-white/80 font-medium mt-4">
                  Loyalty Score: <span className="text-white font-bold">{Math.round(stats.topArtist?.loyaltyScore)}</span> <span className="text-lg opacity-60">(intensity per day)</span>
                </p>
                <div className="mt-8 border-l-4 border-white/30 pl-4 py-2">
                  <p className="text-white/80 italic text-xl">
                    "You didn't just listen. You lived this artist."
                  </p>
                </div>
              </div>
            </BentoCard>

            {/* Other top artists */}
            {stats.topArtistsList.slice(1, 3).map((artist, idx) => (
              <BentoCard key={idx} delay={0.2 + (idx * 0.1)} className="justify-center min-h-[180px]">
                <span className="text-white/50 uppercase text-xs font-bold block mb-1">#{idx + 2}</span>
                <h3 className="text-3xl font-black truncate mb-2">{artist.name}</h3>
                <p className="text-white/70 text-lg">{Math.round(artist.ms_played / 60000).toLocaleString()} minutes</p>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* Slide 3: The Anthems (Tracks) */}
      <section className="snap-section px-6 md:px-12" style={{ background: 'radial-gradient(circle at center left, var(--era-3-color) 0%, transparent 60%)' }}>
        <div className="max-w-6xl w-full mx-auto flex flex-col justify-center h-full py-12">
          <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-6xl font-black mb-8 italic tracking-tighter"
          >
            The Anthems
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BentoCard className="min-h-[300px] justify-center" delay={0.1}>
              <span className="text-white/60 uppercase tracking-widest text-sm font-bold mb-4">#1 Overall</span>
              <h3 className="text-5xl md:text-6xl font-black italic mb-4 text-[#10b981]">{stats.topSong}</h3>
              <p className="text-white/80 text-xl font-medium">Your absolute obsession.</p>
            </BentoCard>
            
            <div className="space-y-6 flex flex-col justify-between">
              {stats.topSongsList.slice(1, 3).map((track, idx) => (
                <BentoCard key={idx} delay={0.2 + (idx * 0.1)} className="flex-1 justify-center">
                  <span className="text-white/50 uppercase text-xs font-bold block mb-1">Era Defining Hit</span>
                  <h3 className="text-2xl font-black truncate">{track.name}</h3>
                </BentoCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Slide 4: Behavioral Intelligence */}
      <section className="snap-section px-6 md:px-12" style={{ background: 'radial-gradient(circle at bottom right, var(--era-1-color) 0%, transparent 80%)' }}>
         <div className="max-w-6xl w-full mx-auto flex flex-col justify-center h-full py-12">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-8 italic tracking-tighter text-center"
          >
            Behavioral Intelligence
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <BentoCard delay={0.2} className="items-center text-center py-16">
              <span className="text-white/60 uppercase tracking-widest text-sm font-bold mb-4">Your Identity</span>
              <h3 className="text-5xl md:text-7xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-4">
                {stats.listenerType}
              </h3>
              <p className="text-white/70 text-lg max-w-sm">
                {stats.listenerType === 'The Seeker' 
                  ? 'Always hunting for the next drop, skipping until the vibe is perfectly matched.' 
                  : 'Letting the music breathe. You let the natural rhythm play out.'}
              </p>
            </BentoCard>

            <BentoCard delay={0.4} className="items-center text-center py-16">
              <span className="text-white/60 uppercase tracking-widest text-sm font-bold mb-4">Peak Listening Hour</span>
              <h3 className="text-6xl md:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 mb-4">
                {stats.peakHour}:00
              </h3>
              <p className="text-white/70 text-lg max-w-sm">
                This is when your headphones became your permanent reality.
              </p>
            </BentoCard>
          </div>
         </div>
      </section>

      {/* Slide 5: Hardware Audit */}
      <section className="snap-section px-6 md:px-12" style={{ background: 'radial-gradient(circle at top left, var(--era-2-color) 0%, transparent 70%)' }}>
        <div className="max-w-6xl w-full mx-auto flex flex-col justify-center h-full py-12">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl md:text-6xl font-black mb-12 italic tracking-tighter"
          >
            Hardware Audit
          </motion.h2>

          <div className="flex flex-wrap gap-6 justify-center">
            {Object.entries(stats.hardwareAudit).map(([platform, count], idx) => {
              const totalEvents = Object.values(stats.hardwareAudit).reduce((a,b)=>a+b, 0);
              const percentage = ((count / totalEvents) * 100).toFixed(1);
              return (
                <BentoCard key={platform} delay={idx * 0.15} className="flex-1 min-w-[250px] items-center text-center">
                  <h3 className="text-3xl font-black mb-2">{platform}</h3>
                  <p className="text-5xl font-black italic text-[#f59e0b]">{percentage}%</p>
                  <p className="text-white/50 text-sm mt-3 uppercase tracking-wider">of your sonic life</p>
                </BentoCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Slide 6: The Summary Passport */}
      <section className="snap-section px-6 md:px-12 flex flex-col items-center bg-black">
        <div className="max-w-3xl w-full mx-auto flex flex-col items-center">
          
          <div ref={passportRef} className="w-full relative rounded-3xl overflow-hidden p-[3px] bg-gradient-to-br from-[#4f46e5] via-[#f59e0b] to-[#10b981]">
            <div className="bg-black rounded-3xl p-8 md:p-12 w-full h-full flex flex-col">
              <div className="flex justify-between items-start mb-12 border-b border-white/20 pb-6">
                <h2 className="text-3xl font-black tracking-tighter">Spotify Wrapped<br/><span className="italic text-white/50 text-xl">The Era Collection</span></h2>
                <div className="text-right">
                  <span className="block text-4xl font-black italic">{stats.totalHours.toLocaleString()}</span>
                  <span className="uppercase text-xs font-bold tracking-widest text-white/50">Total Hours</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <span className="uppercase text-xs font-bold tracking-widest text-white/50 block mb-1">Top Artist</span>
                  <span className="text-2xl font-black">{stats.topArtist?.name}</span>
                </div>
                <div>
                  <span className="uppercase text-xs font-bold tracking-widest text-white/50 block mb-1">Top Track</span>
                  <span className="text-2xl font-black leading-tight">{stats.topSong}</span>
                </div>
                <div>
                  <span className="uppercase text-xs font-bold tracking-widest text-white/50 block mb-1">Identity</span>
                  <span className="text-2xl font-black">{stats.listenerType}</span>
                </div>
                <div>
                  <span className="uppercase text-xs font-bold tracking-widest text-white/50 block mb-1">Arch Nemesis</span>
                  <span className="text-xl font-bold">{stats.mostlySkippedArtist?.name || 'None'}</span>
                  <span className="text-xs text-white/50 block mt-1">{(stats.mostlySkippedArtist?.skipRate * 100).toFixed(0)}% Skipped</span>
                </div>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            className="mt-12 bg-white text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors w-full md:w-auto"
          >
            <Download size={20} />
            Download Passport
          </motion.button>

        </div>
      </section>
    </div>
  );
}
