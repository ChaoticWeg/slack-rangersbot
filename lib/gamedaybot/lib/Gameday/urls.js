exports.getGameUrl     = (gameId) => `https://statsapi.mlb.com/api/v1/game/${gameId}/feed/live?language=en`;
exports.getScheduleUrl = (teamId) => `https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=${teamId}&language=en`;
exports.getContentUrl  = (gameId) => `https://statsapi.mlb.com/api/v1/schedule?sportId=1&gamePk=${gameId}&hydrate=team,linescore,person,stats,game(content(media(epg)))&language=en`;
