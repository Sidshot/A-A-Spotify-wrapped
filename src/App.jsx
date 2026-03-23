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
        link.download = 'spotify-wrapped-v2.png';
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Failed to export image", err);
      }
    }
  };

  if (!stats) return <div className="flex h-screen items-center justify-center bg-black text-white font-bold text-2xl">Loading Your Wrapped...</div>;

  const maxMonth = Math.max(...stats.monthCounts);
  const maxDayOfWeek = Math.max(...stats.dayOfWeekCounts);
  const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
            {stats.totalHours.toLocaleString()} Hours.<br/>
            One Evolving Taste.
          </h1>
          <p className="text-xl md:text-2xl text-white/60 font-medium">Scroll down to explore your V2 journey</p>
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
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-auto">
            {/* #1 Artist */}
            <BentoCard className="md:col-span-3 md:row-span-2 relative overflow-hidden group min-h-[400px]" delay={0.1}>
              <div className="absolute inset-0 bg-gradient-to-tr from-black/60 to-transparent z-0 pointer-events-none" />
              <div className="relative z-10 flex flex-col justify-end h-full">
                <span className="text-white/60 uppercase tracking-widest text-sm font-bold mb-2">The Main Character</span>
                <h3 className="text-6xl md:text-8xl font-black italic mb-2 leading-none">{stats.topArtist?.name}</h3>
                <p className="text-2xl text-white/80 font-medium mt-4">
                  Loyalty Score: <span className="text-white font-bold">{Math.round(stats.topArtist?.loyaltyScore).toLocaleString()}</span>
                </p>
                <div className="mt-8 border-l-4 border-white/30 pl-4 py-2 max-w-lg">
                  <p className="text-white/80 italic text-xl">
                    "You didn't just listen. You lived this artist."
                  </p>
                </div>
              </div>
            </BentoCard>

            {/* Other top artists */}
            <div className="flex flex-col gap-6 md:row-span-2">
              {stats.topArtistsList.slice(1, 4).map((artist, idx) => (
                <BentoCard key={idx} delay={0.2 + (idx * 0.1)} className="flex-1 justify-center min-h-[120px]">
                  <span className="text-white/50 uppercase text-xs font-bold block mb-1">#{idx + 2}</span>
                  <h3 className="text-2xl font-black truncate">{artist.name}</h3>
                </BentoCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* NEW Slide 3: The Eras Tour */}
      <section className="snap-section px-6 md:px-12" style={{ background: 'radial-gradient(circle at center right, var(--era-3-color) 0%, transparent 80%)' }}>
        <div className="max-w-7xl w-full mx-auto flex flex-col justify-center h-full py-12">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-8 italic tracking-tighter"
          >
            The Eras Tour
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Object.entries(stats.eraBreakdown).map(([era, data], index) => (
              <BentoCard key={era} delay={index * 0.2} className="relative overflow-hidden group">
                <div className={`absolute -inset-10 bg-gradient-to-br from-white/5 to-transparent z-0 opacity-50`} />
                <div className="relative z-10">
                  <h3 className="text-3xl font-black italic border-b border-white/10 pb-4 mb-6">{era}</h3>
                  <div className="mb-6">
                    <span className="text-white/50 text-xs font-bold uppercase tracking-wider block mb-3">Top Artists</span>
                    {data.topArtists.slice(0,3).map((a, i) => (
                      <p key={i} className="text-lg font-medium mb-1 truncate">{i+1}. {a.name}</p>
                    ))}
                  </div>
                  <div>
                    <span className="text-white/50 text-xs font-bold uppercase tracking-wider block mb-3">Anthems</span>
                    {data.topTracks.slice(0,3).map((t, i) => (
                      <p key={i} className="text-sm text-white/80 mb-2 truncate">{i+1}. {t.name}</p>
                    ))}
                  </div>
                </div>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* NEW Slide 4: Seasonal Chronology & Mood */}
      <section className="snap-section px-6 md:px-12" style={{ background: 'radial-gradient(circle at top, var(--era-1-color) 0%, transparent 60%)' }}>
        <div className="max-w-5xl w-full mx-auto flex flex-col justify-center h-full py-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-4 italic tracking-tighter"
          >
            Your Seasonal Vibe
          </motion.h2>
          <p className="text-white/60 text-xl mb-12">How your listening intensity shifted month by month.</p>
          
          <BentoCard className="pt-16 pb-8 px-8 h-[400px]">
            <div className="flex items-end h-full gap-2 md:gap-4 justify-between relative">
              <div className="absolute inset-0 border-b border-white/20" />
              {stats.monthCounts.map((val, i) => {
                const heightPct = val === 0 ? 5 : (val / maxMonth) * 100;
                return (
                  <motion.div 
                    key={i} 
                    initial={{ height: 0 }} 
                    whileInView={{ height: `${heightPct}%` }}
                    transition={{ duration: 1, delay: i * 0.05, ease: 'easeOut' }}
                    viewport={{ once: true }}
                    className="w-full bg-gradient-to-t from-white/10 to-white/60 rounded-t-md relative z-10 flex group"
                  >
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs md:text-sm font-bold text-white/50">{monthLabels[i]}</span>
                  </motion.div>
                );
              })}
            </div>
          </BentoCard>
        </div>
      </section>

      {/* NEW Slide 5: The Superfan */}
      <section className="snap-section px-6 md:px-12" style={{ background: 'radial-gradient(circle at bottom center, var(--era-2-color) 0%, #000 80%)' }}>
        <div className="max-w-6xl w-full mx-auto flex flex-col justify-center h-full py-12">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl md:text-6xl font-black mb-12 italic tracking-tighter text-center"
          >
            Superfan Stats
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <BentoCard delay={0.2} className="items-center text-center justify-center p-12 min-h-[300px]">
               <span className="text-white/50 uppercase text-sm font-bold tracking-widest mb-6">Longest Streak</span>
               <h3 className="text-8xl md:text-[140px] font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 mb-4">{stats.longestStreak}</h3>
               <p className="text-2xl text-white/70 font-medium">Consecutive Days</p>
               <p className="text-white/40 mt-4 italic">"Music was your oxygen."</p>
            </BentoCard>

            <BentoCard delay={0.4} className="items-center text-center justify-center p-12 min-h-[300px]">
               <span className="text-white/50 uppercase text-sm font-bold tracking-widest mb-6">Most Intense Day</span>
               <h3 className="text-6xl md:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-[#f59e0b] to-red-500 mb-4">{stats.maxDay.hours}</h3>
               <p className="text-2xl text-white/70 font-medium mb-2">Hours Streamed</p>
               <p className="text-xl text-white/50">on {stats.maxDay.date}</p>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* Slide 6: Behavioral Intelligence (Upgraded) */}
      <section className="snap-section px-6 md:px-12" style={{ background: 'radial-gradient(circle at top left, var(--era-3-color) 0%, transparent 80%)' }}>
         <div className="max-w-6xl w-full mx-auto flex flex-col justify-center h-full py-12">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-8 italic tracking-tighter text-center"
          >
            Behavioral Intelligence
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BentoCard delay={0.1} className="md:col-span-2 items-center text-center py-12 px-6">
              <span className="text-white/60 uppercase tracking-widest text-sm font-bold mb-2">Routine Heatmap</span>
              <div className="w-full flex items-end h-40 gap-2 justify-between mt-8 border-b border-white/20">
                {stats.dayOfWeekCounts.map((val, i) => {
                  const heightPct = val === 0 ? 5 : (val / maxDayOfWeek) * 100;
                  return (
                    <motion.div 
                      key={i} 
                      initial={{ height: 0 }} 
                      whileInView={{ height: `${heightPct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="flex-1 bg-white/30 rounded-t-sm relative group"
                    >
                      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-bold text-white/50">{dayLabels[i]}</span>
                    </motion.div>
                  )
                })}
              </div>
            </BentoCard>

            <div className="flex flex-col gap-6">
              <BentoCard delay={0.3} className="items-center text-center flex-1 justify-center">
                <span className="text-white/60 uppercase tracking-widest text-xs font-bold mb-2">Your Identity</span>
                <h3 className="text-4xl font-black italic text-[#4f46e5]">
                  {stats.listenerType}
                </h3>
              </BentoCard>

              <BentoCard delay={0.4} className="items-center text-center flex-1 justify-center">
                <span className="text-white/60 uppercase tracking-widest text-xs font-bold mb-2">Peak Listening Hour</span>
                <h3 className="text-5xl font-black italic text-[#10b981]">
                  {stats.peakHour}:00
                </h3>
              </BentoCard>
            </div>
          </div>
         </div>
      </section>

      {/* Slide 7: Hardware Audit */}
      <section className="snap-section px-6 md:px-12" style={{ background: 'radial-gradient(circle at bottom center, var(--era-1-color) 0%, transparent 60%)' }}>
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
                <BentoCard key={platform} delay={idx * 0.1} className="flex-1 min-w-[200px] items-center text-center py-12">
                  <h3 className="text-2xl lg:text-3xl font-black mb-4 truncate w-full px-2" title={platform}>{platform}</h3>
                  <p className="text-5xl lg:text-6xl font-black italic text-white/90">{percentage}%</p>
                  <p className="text-white/40 text-xs mt-4 uppercase tracking-widest">of your sonic life</p>
                </BentoCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Slide 8: The Summary Passport */}
      <section className="snap-section px-6 md:px-12 flex flex-col items-center bg-black">
        <div className="max-w-4xl w-full mx-auto flex flex-col items-center">
          
          <div ref={passportRef} className="w-full relative rounded-[2.5rem] overflow-hidden p-[4px] bg-gradient-to-br from-[#4f46e5] via-[#f59e0b] to-[#10b981]">
            <div className="bg-black rounded-[2.3rem] p-8 md:p-12 w-full h-full flex flex-col">
              <div className="flex justify-between items-start mb-10 border-b border-white/10 pb-8">
                <h2 className="text-4xl font-black tracking-tighter">Spotify Wrapped<br/><span className="italic text-white/50 text-2xl font-medium">V2 Edition</span></h2>
                <div className="text-right">
                  <span className="block text-5xl font-black italic text-white drop-shadow-lg">{stats.totalHours.toLocaleString()}</span>
                  <span className="uppercase text-sm font-bold tracking-widest text-[#f59e0b] mt-1 block">Total Hours</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
                <div>
                  <span className="uppercase text-xs font-bold tracking-widest text-white/40 block mb-2">Main Character</span>
                  <span className="text-2xl lg:text-3xl font-black leading-tight text-white/90">{stats.topArtist?.name}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="uppercase text-xs font-bold tracking-widest text-white/40 block mb-2">Top Anthem</span>
                  <span className="text-2xl lg:text-3xl font-black leading-tight text-[#10b981]">{stats.topSong}</span>
                </div>
                <div>
                  <span className="uppercase text-xs font-bold tracking-widest text-white/40 block mb-2">Superfan Streak</span>
                  <span className="text-2xl font-black">{stats.longestStreak} Days</span>
                </div>
                <div>
                  <span className="uppercase text-xs font-bold tracking-widest text-white/40 block mb-2">Listening Identity</span>
                  <span className="text-2xl font-black">{stats.listenerType}</span>
                </div>
                <div>
                  <span className="uppercase text-xs font-bold tracking-widest text-white/40 block mb-2">Arch Nemesis</span>
                  <span className="text-xl font-bold">{stats.mostlySkippedArtist?.name || 'None'}</span>
                  <span className="text-xs text-white/50 block mt-1">{(stats.mostlySkippedArtist?.skipRate * 100).toFixed(0)}% Skips</span>
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
            Save Passport
          </motion.button>

        </div>
      </section>
    </div>
  );
}
