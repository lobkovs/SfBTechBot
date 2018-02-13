/**
 * @project SfBTechBot
 * @description REST API реализация бота для Skype for Business
 * @author Александр Лобков <lobkovs@yandex.ru>
 */

// /////////////
// /////////////
// Логгер
// /////////////
// /////////////


let winston = require('winston');
let path = require('path');
let ENV = process.env.NODE_ENV;
let H = require('./helper'); // Подключим вспомогательные функции
let session = require('./session');

require('winston-daily-rotate-file');

let timestampPretty = () => H.getStringOfTimespamp('Y-m-d H:i:s');

function getLogger(module) {

	var label = module.filename.split(path.sep).slice(-2).join(path.sep);
	return new winston.Logger({
		transports: [
			new (winston.transports.DailyRotateFile)({
				timestamp: timestampPretty,
				prettyPrint: true,
				colorize: true,
				level: 'debug',
				// level: (ENV == 'development') ? 'debug' : 'error',
				label: label,
				filename: "./logs/self/log",
				prepend: true,
				datePattern: 'yyyy-MM-dd_self.',
				json: false,
			})
		],
		// Модифицируем каждую запись в лог файл,
		// Подставим сначале сообщения, ID сессии
		filters: [function(level, msg, meta) {
			return `${session.get()} ${msg}`
		}]
	});
}

module.exports = getLogger;