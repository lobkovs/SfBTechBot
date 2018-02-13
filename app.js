/**
 * @project SfBTechBot
 * @description REST API реализация бота для Skype for Business
 * @author Александр Лобков <lobkovs@yandex.ru>
 */

// /////////////
// Модули
// /////////////
var
	log 		= require('./libs/log')(module),
	router 		= require('./router'),
	restify		= require('restify'),
	session		= require('./libs/session');

// /////////////
// /////////////
// Инициализация и запуск сервера
// /////////////
// /////////////
var server = restify.createServer();
server.use(restify.plugins.bodyParser());

// Перед каждым запросом на сервер, проверим существование сессии
// Так же установим глобано ID сессии,
// для подстановки перед каждой записью в лог
server.use(function(req, res, next) {
	if (req.body.session)
		session.set(req.body.session);

	log.debug('################№###');
	log.debug('### Новый запрос ###');
	log.debug('################№###');
	log.debug('Заголовки:', req.headers);
	log.debug('URL:', req.url);
	log.debug('Метод:', req.method);
	log.debug('Тело запроса:', req.body);
	next();
});

// Залогируем ответ на запрос
server.on('after', function(req, res, route, error) {
	log.debug(`Ответ`);
	log.debug(`Метод: ${res.methods}`);
	log.debug(`Статус: ${res.statusCode}`);
	log.debug(`Тело: ${res._data}`);
	log.debug(`Сообщение: ${res.statusMessage};`);
})

// Запустим сервер
server.listen(process.env.port || process.env.PORT || 2909, function() {
	log.info('%s listening to %s', server.name, server.url);
});

// /////////////
// /////////////
// Диалог бота
// /////////////
// /////////////

// Слушаем сообщения от пользователя на root адресе "/"
server.post('/', router);