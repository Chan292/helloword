const express = require('express');
const cors = require('cors');
const { scrapePlayer, scrapeSeasons } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 简单的内存缓存，减少对 pubg.plus 的请求频率（避免触发反爬限制）
const cache = new Map();
const PLAYER_TTL = 10 * 60 * 1000; // 玩家数据缓存 10 分钟
const SEASONS_TTL = 30 * 60 * 1000; // 赛季列表缓存 30 分钟

function getCached(key, ttl) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.timestamp < ttl) return hit.value;
  if (hit) cache.delete(key);
  return null;
}

function setCached(key, value) {
  cache.set(key, { value, timestamp: Date.now() });
  if (cache.size > 300) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (now - v.timestamp > Math.max(PLAYER_TTL, SEASONS_TTL)) cache.delete(k);
    }
  }
}

function sendError(res, err, fallbackMessage) {
  const status = err.statusCode && err.statusCode >= 400 && err.statusCode < 600 ? err.statusCode : 500;
  res.status(status).json({ error: fallbackMessage, message: err.message });
}

app.get('/api/player/:name', async (req, res) => {
  const { name } = req.params;
  const { season } = req.query;
  const cacheKey = 'player|' + name + '|' + (season || '');

  const cached = getCached(cacheKey, PLAYER_TTL);
  if (cached) {
    console.log('[缓存] 玩家: ' + name + ', 赛季: ' + (season || '最新'));
    return res.json(cached);
  }

  try {
    console.log('[查询] 玩家: ' + name + ', 赛季: ' + (season || '最新'));
    const data = await scrapePlayer(name, season || null);
    setCached(cacheKey, data);
    res.json(data);
  } catch (err) {
    console.error('[错误] 查询玩家 ' + name + ' 失败:', err.message);
    sendError(res, err, '获取数据失败');
  }
});

app.get('/api/player/:name/seasons', async (req, res) => {
  const { name } = req.params;
  const cacheKey = 'seasons|' + name;

  const cached = getCached(cacheKey, SEASONS_TTL);
  if (cached) {
    console.log('[缓存] 赛季列表: ' + name);
    return res.json({ seasons: cached });
  }

  try {
    console.log('[查询] 赛季列表: ' + name);
    const seasons = await scrapeSeasons(name);
    setCached(cacheKey, seasons);
    res.json({ seasons });
  } catch (err) {
    console.error('[错误] 查询赛季 ' + name + ' 失败:', err.message);
    sendError(res, err, '获取赛季失败');
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log('PUBG.plus 代理服务运行在 http://localhost:' + PORT);
  console.log('API 接口: http://localhost:' + PORT + '/api/player/{玩家名称}');
  console.log('赛季接口: http://localhost:' + PORT + '/api/player/{玩家名称}/seasons');
});
