/**
 * pubg.plus 数据抓取（新版接口）
 *
 * pubg.plus 已于 2026-08 改版为纯前端 SPA，页面不再包含 __NUXT__ 数据。
 * 新版站点通过私有接口 https://apiv1.pubg.plus 获取数据，接口需要签名参数：
 *   ts   = 当前时间戳（秒，字符串）
 *   sign = HMAC-SHA256(key + ts, SECRET) 的十六进制前 16 位
 * 其中 key 依接口而定（player/info 用玩家名，player/season 等用 accountId）。
 * SECRET 从站点前端资源中提取，若站点再次改版需重新核对。
 */

const axios = require('axios');
const crypto = require('crypto');

const API_BASE = 'https://apiv1.pubg.plus';
const SIGN_SECRET = 'Bm4is8qQgJXdocrvobbFR7u2kh66Pu';
const DEFAULT_PLATFORM = 'steam';

const MODE_KEYS = ['solo', 'duo', 'squad'];
const SUM_FIELDS = [
  'roundsPlayed', 'wins', 'top10s', 'kills', 'losses', 'assists',
  'damageDealt', 'headshotKills', 'dBNOs', 'heals', 'boosts', 'revives',
  'teamKills', 'suicides', 'weaponsAcquired', 'timeSurvived',
  'walkDistance', 'rideDistance', 'swimDistance', 'roadKills'
];
const MAX_FIELDS = ['roundMostKills', 'mostSurvivalTime', 'longestTimeSurvived', 'longestKill', 'maxKillStreaks'];

const REQUEST_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Origin': 'https://pubg.plus',
  'Referer': 'https://pubg.plus/zh-CN/'
};

// ---------- 基础工具 ----------

function nowSeconds() {
  return Math.floor(Date.now() / 1000).toString();
}

function computeSign(key, ts) {
  return crypto.createHmac('sha256', SIGN_SECRET)
    .update(String(key) + ts)
    .digest('hex')
    .substring(0, 16);
}

function buildParams(key, params = {}) {
  const ts = nowSeconds();
  return Object.assign({}, params, { ts, sign: computeSign(key, ts) });
}

async function apiGet(path, key, params = {}, verified = false) {
  let response;
  try {
    response = await axios.get(API_BASE + path, {
      params: buildParams(key, params),
      headers: REQUEST_HEADERS,
      timeout: 20000
    });
  } catch (err) {
    if (err.response && err.response.data) {
      const body = err.response.data;
      const status = err.response.status;
      // pubg.plus 反爬：HTTP 428 + code 1007 表示需要先通过滑动验证
      const needVerify = status === 428 && body && (body.code === 1007 || (body.data && body.data.verify === 'slide'));
      if (needVerify && !verified) {
        const token = await solveSlideCaptcha();
        if (token) {
          return apiGet(path, key, Object.assign({}, params, { verify_token: token }), true);
        }
        const e = new Error('pubg.plus 要求安全验证，暂时无法自动完成，请稍后重试；或先在浏览器中打开 pubg.plus 完成一次验证');
        e.statusCode = 428;
        throw e;
      }
      const message = body.message || body.message_en || ('请求失败（HTTP ' + status + '）');
      const e = new Error(message);
      e.statusCode = status;
      throw e;
    }
    if (err.code === 'ECONNABORTED' || /timeout|timed out|ETIMEDOUT/i.test(err.message || '')) {
      const e = new Error('访问 pubg.plus 超时，请稍后重试');
      e.statusCode = 504;
      throw e;
    }
    throw err;
  }
  return unwrap(response.data, response.status);
}

/**
 * 尝试自动完成 pubg.plus 的滑动验证码。
 * 站点接口 /verify/slide 会直接返回拼图的目标坐标 tile_x/tile_y，
 * 与站点前端一样把该坐标提交给 /verify/slide/check 即可通过。
 * 返回验证 token；任何一步失败返回 null（调用方回退为友好错误提示）。
 */
async function solveSlideCaptcha() {
  try {
    const slideResp = await axios.get(API_BASE + '/verify/slide', { headers: REQUEST_HEADERS, timeout: 15000 });
    const slide = slideResp.data && slideResp.data.data;
    if (!slide || !slide.key || slide.tile_x === undefined || slide.tile_y === undefined) return null;
    const point = slide.tile_x + ',' + slide.tile_y;
    const checkResp = await axios.post(
      API_BASE + '/verify/slide/check',
      { key: slide.key, point: point },
      { headers: REQUEST_HEADERS, timeout: 15000 }
    );
    const check = checkResp.data && checkResp.data.data;
    if (check && check.passed && check.token) return check.token;
    return null;
  } catch (err) {
    return null;
  }
}

// 某些赛季接口在无数据时返回 404，调用方可通过 statusCode 判断
async function apiGetSafe(path, key, params) {
  try {
    return await apiGet(path, key, params);
  } catch (err) {
    if (err.statusCode === 404) return null;
    throw err;
  }
}

function unwrap(body, status) {
  if (body && body.code === 0 && body.data !== undefined && body.data !== null) {
    return body.data;
  }
  const message = (body && (body.message || body.message_en)) || ('请求失败（HTTP ' + status + '）');
  const e = new Error(message);
  e.statusCode = status || (body && body.code);
  throw e;
}

function toNum(val) {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/[,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function round1(num) {
  return Math.round(num * 10) / 10;
}

function formatDuration(seconds) {
  const total = Math.max(0, Math.floor(toNum(seconds)));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return m + ':' + String(s).padStart(2, '0');
}

// ---------- 接口封装 ----------

async function getPlayerInfo(playerName) {
  const data = await apiGet('/' + DEFAULT_PLATFORM + '/player/info', playerName, { player_id: playerName });
  const player = data && data.player;
  if (!player) throw new Error('未找到玩家: ' + playerName);
  return player;
}

async function fetchSeasonList() {
  const data = await apiGet('/' + DEFAULT_PLATFORM + '/season_list', '', {});
  const list = data && data.data;
  if (!Array.isArray(list)) return [];
  
  // 按date排序，最新的在前
  const sorted = list
    .filter((s) => s && s.attributes && !s.attributes.isOffseason)
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  
  // 为每个赛季生成编号（同年份内从S1开始递增）
  const yearCountMap = {};
  sorted.forEach((s) => {
    if (s.date) {
      const year = s.date.split('.')[0];
      if (!yearCountMap[year]) yearCountMap[year] = 0;
      yearCountMap[year]++;
    }
  });
  
  // 反向编号（最新的赛季编号最大）
  let index = sorted.length + 1;
  return sorted.map((s) => {
    index--;
    return {
      id: s.id,
      name: 'S' + index,
      isCurrent: !!(s.attributes && s.attributes.isCurrentSeason)
    };
  });
}

// ---------- 数据加工 ----------

// 普通模式统计（TPP + FPP 合并）
function mergeModes(gameModeStats) {
  const merged = {};
  for (const mode of MODE_KEYS) {
    const tpp = gameModeStats[mode] || {};
    const fpp = gameModeStats[mode + '-fpp'] || {};
    if (toNum(tpp.roundsPlayed) + toNum(fpp.roundsPlayed) <= 0) continue;
    const out = {};
    for (const f of SUM_FIELDS) out[f] = toNum(tpp[f]) + toNum(fpp[f]);
    for (const f of MAX_FIELDS) out[f] = Math.max(toNum(tpp[f]), toNum(fpp[f]));
    merged[mode] = out;
  }
  return merged;
}

// 从排名数据中挑选某一模式（TPP/FPP 取场次多者）
function pickRanked(rankedGameModeStats, mode) {
  if (!rankedGameModeStats) return null;
  const a = rankedGameModeStats[mode];
  const b = rankedGameModeStats[mode + '-fpp'];
  if (a && b) return toNum(a.roundsPlayed) >= toNum(b.roundsPlayed) ? a : b;
  return a || b || null;
}

function formatNormalMode(s) {
  const roundsPlayed = toNum(s.roundsPlayed);
  const wins = toNum(s.wins);
  const top10s = toNum(s.top10s);
  const kills = toNum(s.kills);
  const deaths = toNum(s.losses); // 官方接口无 deaths 字段，用 losses 近似
  const assists = toNum(s.assists);
  const damageDealt = toNum(s.damageDealt);
  const kd = deaths > 0 ? kills / deaths : (kills > 0 ? kills : 0);
  const adr = roundsPlayed > 0 ? damageDealt / roundsPlayed : 0;
  const winRate = roundsPlayed > 0 ? (wins / roundsPlayed) * 100 : 0;
  const top10Rate = roundsPlayed > 0 ? (top10s / roundsPlayed) * 100 : 0;
  return {
    roundsPlayed: roundsPlayed,
    wins: wins,
    top10s: top10s,
    kills: kills,
    deaths: deaths,
    assists: assists,
    kdRatio: kd.toFixed(2),
    adr: round1(adr).toFixed(1),
    winRate: round1(winRate).toFixed(1),
    top10Rate: round1(top10Rate).toFixed(1),
    avgRank: '-',
    avgDamage: round1(adr).toFixed(1),
    maxKills: toNum(s.roundMostKills),
    longestTime: formatDuration(toNum(s.mostSurvivalTime) || toNum(s.longestTimeSurvived)),
    totalDamage: Math.round(damageDealt),
    headshotKills: toNum(s.headshotKills),
    dBNOs: toNum(s.dBNOs),
    revives: toNum(s.revives),
    heals: toNum(s.heals),
    boosts: toNum(s.boosts),
    teamKills: toNum(s.teamKills),
    suicides: toNum(s.suicides),
    roadKills: toNum(s.roadKills),
    walkDistance: round1(toNum(s.walkDistance)),
    rideDistance: round1(toNum(s.rideDistance)),
    swimDistance: round1(toNum(s.swimDistance)),
    weaponsAcquired: toNum(s.weaponsAcquired)
  };
}

function formatRankedMode(s) {
  const roundsPlayed = toNum(s.roundsPlayed);
  const wins = toNum(s.wins);
  const kills = toNum(s.kills);
  const deaths = toNum(s.deaths);
  const assists = toNum(s.assists);
  const damageDealt = toNum(s.damageDealt);
  const kd = deaths > 0 ? kills / deaths : 0;
  const adr = roundsPlayed > 0 ? damageDealt / roundsPlayed : 0;
  return {
    roundsPlayed: roundsPlayed,
    wins: wins,
    top10s: Math.round(toNum(s.top10Ratio) * roundsPlayed),
    kills: kills,
    deaths: deaths,
    assists: assists,
    kdRatio: (toNum(s.kdr) > 0 ? toNum(s.kdr) : kd).toFixed(2),
    adr: round1(adr).toFixed(1),
    winRate: round1(toNum(s.winRatio) * 100).toFixed(1),
    top10Rate: round1(toNum(s.top10Ratio) * 100).toFixed(1),
    avgRank: s.avgRank === undefined || s.avgRank === null ? '-' : round1(toNum(s.avgRank)).toFixed(1),
    avgDamage: round1(adr).toFixed(1),
    maxKills: toNum(s.roundMostKills),
    longestTime: formatDuration(toNum(s.avgSurvivalTime)),
    totalDamage: Math.round(damageDealt)
  };
}

// ---------- 对外接口 ----------

async function scrapePlayer(playerName, seasonId = null) {
  const player = await getPlayerInfo(playerName);
  const accountId = player.id;

  const seasons = await fetchSeasonList();
  let targetSeasonId = seasonId;
  let selected = null;
  if (!targetSeasonId) {
    selected = seasons.find((s) => s.isCurrent) || seasons[0] || null;
    targetSeasonId = selected ? selected.id : '';
  } else {
    selected = seasons.find((s) => s.id === targetSeasonId) || null;
  }
  const seasonName = selected ? (selected.name + ' 赛季') : (targetSeasonId || '最新赛季');

  let normalData = null;
  let rankedData = null;
  if (targetSeasonId) {
    normalData = await apiGetSafe('/' + DEFAULT_PLATFORM + '/player/season', accountId, { acc_id: accountId, season: targetSeasonId });
    rankedData = await apiGetSafe('/' + DEFAULT_PLATFORM + '/player/season_r', accountId, { acc_id: accountId, season: targetSeasonId });
  }

  const normalStats = normalData && normalData.attributes ? normalData.attributes.gameModeStats : {};
  const rankedStats = rankedData && rankedData.attributes ? rankedData.attributes.rankedGameModeStats : {};

  const mergedNormal = mergeModes(normalStats || {});
  const modes = {};
  for (const mode of MODE_KEYS) {
    let stats = null;
    if (mergedNormal[mode]) {
      stats = formatNormalMode(mergedNormal[mode]);
      const ranked = pickRanked(rankedStats, mode);
      if (ranked && ranked.avgRank !== undefined && ranked.avgRank !== null) {
        stats.avgRank = round1(toNum(ranked.avgRank)).toFixed(1);
      }
    } else {
      const ranked = pickRanked(rankedStats, mode);
      if (ranked && toNum(ranked.roundsPlayed) > 0) {
        stats = formatRankedMode(ranked);
      }
    }
    if (stats) modes[mode] = stats;
  }

  return {
    name: player.name || playerName,
    avatar: 'https://wstatic-prod.pubg.com/web/live/static/favicons/apple-icon-180x180.png',
    level: toNum(player.level),
    seasonName: seasonName,
    seasonId: targetSeasonId,
    modes: modes
  };
}

async function scrapeSeasons(playerName) {
  await getPlayerInfo(playerName); // 校验玩家是否存在
  const seasons = await fetchSeasonList();
  return seasons.map((s) => ({ id: s.id, name: s.name }));
}

module.exports = { scrapePlayer, scrapeSeasons };


