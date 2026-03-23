const fs = require('fs');
const path = require('path');

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

// Deduplicate based on ts + ms_played + track_name
const uniqueMap = new Map();
allData.forEach(item => {
  if (item.master_metadata_track_name == null) return; // Ignore podcasts/unknowns
  const id = `${item.ts}_${item.ms_played}_${item.spotify_track_uri}`;
  if (!uniqueMap.has(id)) {
    uniqueMap.set(id, item);
  }
});

let data = Array.from(uniqueMap.values());

// 1. Filter: Remove entries where ms_played < 10,000 (short skips).
data = data.filter(d => d.ms_played >= 10000);

const artistsStats = {};
const trackFirstPlay = {}; // track_uri -> year
let totalListeningMs = 0;
const uniqueTracks = new Set();
const reasons = { seeker: 0, explorer: 0 };
const platforms = {};

// 2. Normalization & Pre-calculation
data.forEach(item => {
  totalListeningMs += item.ms_played;
  
  // Convert ts to IST
  const dateUTC = new Date(item.ts);
  const dateIST = new Date(dateUTC.getTime() + (5.5 * 60 * 60 * 1000));
  const year = dateIST.getFullYear();
  const dateStr = dateIST.toISOString().split('T')[0]; // YYYY-MM-DD
  const hour = dateIST.getHours();

  item.year = year;
  item.hour = hour;
  item.dateStr = dateStr;

  const trackName = item.master_metadata_track_name?.trim() || "Unknown Track";
  const artistName = item.master_metadata_album_artist_name?.trim() || "Unknown Artist";
  item.master_metadata_album_artist_name = artistName;
  const trackUri = item.spotify_track_uri;

  uniqueTracks.add(trackUri);

  // Discovery Index logic
  if (!trackFirstPlay[trackUri]) {
    trackFirstPlay[trackUri] = year;
  }

  // Listener type
  const rStart = item.reason_start;
  if (rStart === 'clickrow' || rStart === 'fwdbtn') reasons.seeker++;
  else if (rStart === 'trackdone' || rStart === 'playlist') reasons.explorer++;

  // Platform
  const plat = item.platform || "Unknown";
  let platCategory = "Other";
  if (plat.toLowerCase().includes("android") || plat.toLowerCase().includes("ios") || plat.toLowerCase().includes("mobile")) {
     if (plat.toLowerCase().includes("samsung")) platCategory = "Samsung";
     else if (plat.toLowerCase().includes("realme")) platCategory = "Realme";
     else platCategory = "Mobile Other";
  } else if (plat.toLowerCase().includes("windows") || plat.toLowerCase().includes("mac") || plat.toLowerCase().includes("desktop") || plat.toLowerCase().includes("web_player")) {
     platCategory = "Desktop/Web";
  }
  platforms[platCategory] = (platforms[platCategory] || 0) + 1;

  // Artist stats
  if (!artistsStats[artistName]) {
    artistsStats[artistName] = { 
      name: artistName, 
      ms_played: 0, 
      plays_gt_30k: 0,
      unique_days: new Set(), 
      skipped: 0, 
      total_plays: 0, // all plays (>= 10k)
      tracks: {} // track_uri -> { trackName, ms_played, count }
    };
  }
  
  const aStat = artistsStats[artistName];
  aStat.ms_played += item.ms_played;
  aStat.unique_days.add(dateStr);
  aStat.total_plays++;
  
  if (item.skipped === true) {
    aStat.skipped++;
  }
  
  if (item.ms_played > 30000) {
    aStat.plays_gt_30k++;
    
    // track stats for anthems
    if (!aStat.tracks[trackUri]) {
       aStat.tracks[trackUri] = { trackName, count: 0, ms_played: 0 };
    }
    aStat.tracks[trackUri].count++;
    aStat.tracks[trackUri].ms_played += item.ms_played;
  }
});

// Finalize Artist Stats
const rankedArtists = Object.values(artistsStats).map(a => {
  const loyaltyScore = a.unique_days.size > 0 ? (a.ms_played / a.unique_days.size) : 0;
  const skipRate = a.total_plays > 0 ? (a.skipped / a.total_plays) : 0;
  
  // Find top tracks for the artist
  const topTracks = Object.values(a.tracks).sort((x, y) => y.count - x.count);

  return {
    name: a.name,
    loyaltyScore,
    skipRate,
    total_plays: a.total_plays,
    plays_gt_30k: a.plays_gt_30k,
    ms_played: a.ms_played,
    unique_days: a.unique_days.size,
    skipped: a.skipped,
    topTrack: topTracks[0]?.trackName || null
  };
});

// Calculate Most Skipped Artist (need minimum plays to avoid 1 play 1 skip = 100%)
const mostlySkippedArtist = rankedArtists
  .filter(a => a.total_plays > 50)
  .sort((a, b) => b.skipRate - a.skipRate)[0];

const topArtists = rankedArtists.sort((a, b) => b.plays_gt_30k - a.plays_gt_30k);

// Validation Output
const totalHours = (totalListeningMs / (1000 * 60 * 60)).toFixed(2);
const logStr = `=== VALIDATION LOGS ===
Total unique tracks count across all 6 years: ${uniqueTracks.size}
Exact total listening hours: ${totalHours}
Most Skipped Artist (min 50 plays): ${mostlySkippedArtist?.name || "None"} (${(mostlySkippedArtist?.skipRate * 100).toFixed(1)}% skip rate)
=======================
`;
console.log(logStr);
fs.writeFileSync(path.join(__dirname, 'validation_log.txt'), logStr, 'utf8');


// Build Global Stats.json payload
const totalDays = new Set(data.map(d => d.dateStr)).size;

// Peak hour
const hourCounts = new Array(24).fill(0);
data.forEach(d => { if (d.hour >= 0 && d.hour < 24) hourCounts[d.hour]++; });
const peakHour = hourCounts.indexOf(Math.max(...hourCounts));

const listenerType = reasons.seeker > reasons.explorer ? "The Seeker" : "The Explorer";

// Top Track
const trackCounts = {};
data.forEach(d => {
  if (d.ms_played > 30000) {
    const t = d.master_metadata_track_name;
    trackCounts[t] = (trackCounts[t] || 0) + 1;
  }
});
const topSongs = Object.entries(trackCounts).sort((a, b) => b[1] - a[1]);
const topSongOverall = topSongs[0] ? topSongs[0][0] : null;

// Write output
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
  mostlySkippedArtist: mostlySkippedArtist
};

fs.mkdirSync(path.join(__dirname, 'src', 'data'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'src', 'data', 'stats.json'), JSON.stringify(stats, null, 2));

console.log("stats.json created successfully in src/data/stats.json.");
