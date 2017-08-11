const moment = require('moment-timezone');

const GamedayFormat = exports.GamedayFormat = "YYYYMMDD_HHmmss";
const ScheduleFormat = exports.ScheduleFormat = "YYYY-MM-DD";

/**
 * Creates a Gameday-friendly timestamp
 */
exports.gameday = () => moment().utc().format(GamedayFormat);

/**
 * Creates a schedule-friendly timestamp
 */
exports.schedule = () => moment().utc().format(ScheduleFormat);