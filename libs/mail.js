/**
 * @project SfBTechBot
 * @description REST API реализация бота для Skype for Business
 * @author Александр Лобков <lobkovs@yandex.ru>
 */

// /////////////
// /////////////
// Отправка писем на почту
// /////////////
// /////////////


var
	log 		= require('../libs/log')(module),
	config		= require('../config.js'),
	nodemailer	= require('nodemailer');

// Создадим транспорт для отправки почты
var transporter = nodemailer.createTransport({
	sendmail: true,
	newline: 'unix',
	path: '/usr/sbin/sendmail'
});

/**
 * Отправляет уведомление на почту
 */
module.exports = function (subject, text) {
	if (!transporter) {
		log.error('Недоступен транспорт для отправки почты!');
		return false;
	}

	transporter.sendMail({
		from: 'SfBTechBot <SfBTechBot@localhost>',
		to: config.mailAddreses,
		subject: subject,
		text: text,
	}, function(err, info) {
		if (err) {
			log.error(err);
			return true;
		}
		log.debug(`Сообщение отправлено!`)
		log.debug(info.envelope);
		log.debug(info.messageId);
	});
}