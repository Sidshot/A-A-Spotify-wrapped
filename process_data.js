import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, 'Spotify Extended Streaming History');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json') && f.includes('Streaming_History_'));

let allData = [];

files.forEach(file => {
  try {
    const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
       allData = allData.concat(parsed);
    }
  } catch (e) {
    console.error(`Error parsing ${file}:`, e);
  }
});

const uniqueMap = new Map();
allData.forEach(item => {
  if (item.master_metadata_track_name == null) return;
  const id = `${item.ts}_${item.ms_played}_${item.spotify_track_uri}`;
  if (!uniqueMap.has(id)) {
    uniqueMap.set(id, item);
  }
});

let data = Array.from(uniqueMap.values());
data = data.filter(d => d.ms_played >= 10000);

const artistsStats = {};
const trackFirstPlay = {};
let totalListeningMs = 0;
const uniqueTracks = new Set();
const reasons = { seeker: 0, explorer: 0 };
const platforms = {};

// New V2 Info
const monthCounts = new Array(12).fill(0);
const dayOfWeekCounts = new Array(7).fill(0); // 0=Sunday
const dailyListening = {};
const eras = {
  "2020-2021": { tracks: {}, artists: {} },
  "2022-2023": { tracks: {}, artists: {} },
  "2024-2026": { tracks: {}, artists: {} }
};

data.forEach(item => {
  totalListeningMs += item.ms_played;
  
  const dateUTC = new Date(item.ts);
  const dateIST = new Date(dateUTC.getTime() + (5.5 * 60 * 60 * 1000));
  const year = dateIST.getFullYear();
  const month = dateIST.getMonth();
  const dayOfWeek = dateIST.getDay();
  const dateStr = dateIST.toISOString().split('T')[0];
  const hour = dateIST.getHours();

  item.year = year;
  item.hour = hour;
  item.dateStr = dateStr;

  const trackName = item.master_metadata_track_name?.trim() || "Unknown Track";
  const artistName = item.master_metadata_album_artist_name?.trim() || "Unknown Artist";
  item.master_metadata_album_artist_name = artistName;
  const trackUri = item.spotify_track_uri;

  uniqueTracks.add(trackUri);

  if (!trackFirstPlay[trackUri]) trackFirstPlay[trackUri] = year;

  // Heatmap tracking
  monthCounts[month] += item.ms_played;
  dayOfWeekCounts[dayOfWeek] += item.ms_played;
  dailyListening[dateStr] = (dailyListening[dateStr] || 0) + item.ms_played;

  // Eras tracking
  let era = null;
  if (year >= 2020 && year <= 2021) era = "2020-2021";
  else if (year >= 2022 && year <= 2023) era = "2022-2023";
  else if (year >= 2024 && year <= 2026) era = "2024-2026";

  if (era) {
    // We count plays > 30k ms for tracks to be meaningful
    if (item.ms_played > 30000) {
      eras[era].tracks[trackName] = (eras[era].tracks[trackName] || 0) + 1;
    }
    eras[era].artists[artistName] = (eras[era].artists[artistName] || 0) + item.ms_played;
  }

  const rStart = item.reason_start;
  if (rStart === 'clickrow' || rStart === 'fwdbtn') reasons.seeker++;
  else if (rStart === 'trackdone' || rStart === 'playlist') reasons.explorer++;

  const plat = item.platform || "Unknown";
  let platCategory = "Other";
  if (plat.toLowerCase().includes("android") || plat.toLowerCase().includes("ios") || plat.toLowerCase().includes("mobile")) {
     if (plat.toLowerCase().includes("samsung")) platCategory = "Samsung";
     else if (plat.toLowerCase().includes("realme")) platCategory = "Realme";
     else platCategory = "Mobile Other";
  } else if (plat.toLowerCase().includes("windows") || plat.toLowerCase().includes("mac") || plat.toLowerCase().includes("desktop") || plat.toLowerCase().includes("web")) {
     platCategory = "Desktop/Web";
  }
  platforms[platCategory] = (platforms[platCategory] || 0) + 1;

  if (!artistsStats[artistName]) {
    artistsStats[artistName] = { 
      name: artistName, ms_played: 0, plays_gt_30k: 0,
      unique_days: new Set(), skipped: 0, total_plays: 0, tracks: {}
    };
  }
  
  const aStat = artistsStats[artistName];
  aStat.ms_played += item.ms_played;
  aStat.unique_days.add(dateStr);
  aStat.total_plays++;
  if (item.skipped === true) aStat.skipped++;
  
  if (item.ms_played > 30000) {
    aStat.plays_gt_30k++;
    if (!aStat.tracks[trackUri]) aStat.tracks[trackUri] = { trackName, count: 0, ms_played: 0 };
    aStat.tracks[trackUri].count++;
    aStat.tracks[trackUri].ms_played += item.ms_played;
  }
});

// Calculate streaks
const sortedDays = Object.keys(dailyListening).sort();
let longestStreak = 0;
let currentStreak = 0;
let previousDate = null;
let maxDay = { date: null, ms: 0 };

sortedDays.forEach(dateStr => {
  const ms = dailyListening[dateStr];
  if (ms > maxDay.ms) maxDay = { date: dateStr, ms };

  if (!previousDate) {
    currentStreak = 1;
  } else {
    const diff = (new Date(dateStr) - new Date(previousDate)) / (1000 * 60 * 60 * 24);
    if (Math.round(diff) === 1) {
      currentStreak++;
    } else {
      currentStreak = 1;
    }
  }
  if (currentStreak > longestStreak) longestStreak = currentStreak;
  previousDate = dateStr;
});

// Format Era metrics
const finalEras = {};
for (const [eraName, data] of Object.entries(eras)) {
  const topTracks = Object.entries(data.tracks)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(t => ({ name: t[0], count: t[1] }));
    
  const topArtists = Object.entries(data.artists)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(a => ({ name: a[0], ms_played: a[1] }));
    
  finalEras[eraName] = { topTracks, topArtists };
}

const rankedArtists = Object.values(artistsStats).map(a => {
  const loyaltyScore = a.unique_days.size > 0 ? (a.ms_played / a.unique_days.size) : 0;
  const skipRate = a.total_plays > 0 ? (a.skipped / a.total_plays) : 0;
  const topTracks = Object.values(a.tracks).sort((x, y) => y.count - x.count);
  return {
    name: a.name, loyaltyScore, skipRate, total_plays: a.total_plays,
    plays_gt_30k: a.plays_gt_30k, ms_played: a.ms_played,
    unique_days: a.unique_days.size, skipped: a.skipped,
    topTrack: topTracks[0]?.trackName || null
  };
});

const mostlySkippedArtist = rankedArtists
  .filter(a => a.total_plays > 50)
  .sort((a, b) => b.skipRate - a.skipRate)[0];

const topArtists = rankedArtists.sort((a, b) => b.plays_gt_30k - a.plays_gt_30k);

const totalHours = (totalListeningMs / (1000 * 60 * 60)).toFixed(2);
const totalDays = new Set(data.map(d => d.dateStr)).size;

const hourCounts = new Array(24).fill(0);
data.forEach(d => { if (d.hour >= 0 && d.hour < 24) hourCounts[d.hour]++; });
const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

const listenerType = reasons.seeker > reasons.explorer ? "The Seeker" : "The Explorer";

const trackCounts = {};
data.forEach(d => {
  if (d.ms_played > 30000) {
    const t = d.master_metadata_track_name;
    trackCounts[t] = (trackCounts[t] || 0) + 1;
  }
});
const topSongs = Object.entries(trackCounts).sort((a, b) => b[1] - a[1]);
const topSongOverall = topSongs[0] ? topSongs[0][0] : null;

// Build output
const stats = {
  totalHours: parseFloat(totalHours),
  uniqueTracks: uniqueTracks.size,
  topArtist: topArtists[0],
  topSong: topSongOverall,
  listenerType,
  peakHour,
  hardwareAudit: platforms,
  totalDays,
  topArtistsList: topArtists.slice(0, 10),
  topSongsList: topSongs.slice(0, 10).map(t => ({name: t[0], count: t[1]})),
  mostlySkippedArtist,
  // --- V2 METRICS ---
  monthCounts,      // Array of 12 numbers (ms per month)
  dayOfWeekCounts,  // Array of 7 numbers (ms per day, 0=Sun)
  longestStreak,    // Number of days
  maxDay: {         // Most intense day
    date: maxDay.date,
    hours: (maxDay.ms / (1000 * 60 * 60)).toFixed(1)
  },
  eraBreakdown: finalEras
};

fs.mkdirSync(path.join(__dirname, 'src', 'data'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'src', 'data', 'stats.json'), JSON.stringify(stats, null, 2));

const logStr = `=== VALIDATION LOGS V2 ===
Total unique tracks: ${uniqueTracks.size}
Total hours: ${totalHours}
Longest Streak: ${longestStreak} days
Max Day: ${stats.maxDay.date} (${stats.maxDay.hours} hrs)
==========================
`;
console.log(logStr);
fs.writeFileSync(path.join(__dirname, 'validation_log.txt'), logStr, 'utf8');
