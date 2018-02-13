/**
 * @project SfBTechBot
 * @description REST API реализация бота для Skype for Business
 * @author Александр Лобков <lobkovs@yandex.ru>
 */

// /////////////
// /////////////
// Роутер для сервера
// /////////////
// /////////////


var
	H			= require('../libs/helper'), // Подключим вспомогательные функции
	_ 			= require('lodash'),
	log			= require('../libs/log')(module),
	config		= require('../config.js'),
	request 	= require('request'),
	actions 	= require('../actions');

module.exports = function(req, res, next) {

	// Проверим идентификатор сессии
	if (!req.body.session) {
		res.send();
		log.warn("Идентификатор сессии не найден!");
		return next();
	}

	// Check AD username
	if (!req.body.adUser) {
		res.send();
		log.warn("403, Ошибка имени пользователя!");
		return next();
	}

	// Проверим права пользователя
	if (!H.isAllowUser(req.body.adUser)) {
		res.send();
		log.warn("403, Недостаточно прав для выполнения операции!");
		return next();
	}

	// Получим ответ за запрос
	getAnswer(req)
		.then(function(result) {
			// Проинициализируем ответ
			var answer = {};
			answer.session = req.body.session;

			if (result)
				answer.text = result;
			else
				answer.text = ' ';

			// res.send(answer);
			// Отправим ответ на сервер
			pushResponse(answer);

		}, function(error) {
			log.debug('Ошибка в получении ответа', error);
		})
	// Ответим запросившему пустым ответом 200, в любом случае
	// оссобенность взаимодействия
	res.send();
	return next();
};

/**
 * Возвращает ответ от действия
 *
 * @param {object} body - Распарсеное тело запроса.
 * @return {Promise} Промис обьект выполнения
 */

function getAnswer(req) {
	return new Promise(function(resolve, reject) {
		// Распарсим запрос
		var query = parseQuery(req.body.text);
		log.debug('Распарсеный запрос:', query);
		// Проверим существование обработчика команды
		if (actions.isExistAction(query.command)) {
			// Выполним обработку команды к контекте запроса req и параметрами
			actions.getActionFunc(query.command).apply(req, query.params)
				.then(
					function(result) {
						resolve(result);
					},
					function(error) {
						reject(`500, Ошибка в обработке события. Описание, ${error}`);
					}
				);
		} else {
			// Чтобы небыло некрасивого "undefined" в ответе,
			// когда обработчик команды не был найден
			var command = query.command ? query.command : '';
			// Текст ответа
			var answer = `Команда "${command}" не распознана!\r\nВведите "help" для справки.`;
			// Запишем лог
			log.debug('404', answer);
			resolve(answer);
		}
	})
}

/**
 * Отправляет ответ на сервер SfB
 *
 * @param {object} answer - Тело ответа.
 */
function pushResponse(answer) {
	log.debug('#####################');
	log.debug(`## Ответ на запрос ##`);
	log.debug('#####################');

	// Конфиг для встречного запроса на другой адрес
	let opt = {
		url: config.answerUrl,
		method: 'POST',
		form: answer
	}
	log.debug('Тело ответа:');
	log.debug(opt);
	// Запросим адрес для ответа
	request(opt, function (error, response, body) {
		log.debug(`Ответ от сервера ${config.answerUrl}:`);
		if (error) log.debug('Error:', error); // Print the error if one occurred
		if (response) log.debug('StatusCode:', response && response.statusCode); // Print the response status code if a response was received
		if (body) log.debug('Body:', body); // Print the HTML for the Google homepage.
	});
}
/**
 * Возвращает обьект команды запроса от пользователя
 *
 * @param {string} query - Запрос от пользователя.
 * @return {object} Обработанный обьект запроса
 */
function parseQuery(query) {
	// Удалим пробелы на концах строки
	var q = query.trim();
	// Проинициализирует возвращаемый обьект запроса
	var queryObject = {};
	// Если в запросе есть хотябы один пробел с последующим символом
	if (/\s.{1}/i.test(q)) {
		// Разобьём по пробелам
		var queryArray = q.split(" ");
		// Первый, это команда
		queryObject.command = queryArray.splice(0, 1).toString().toLowerCase();
		// Остальные, это параметры команды
		queryObject.params = queryArray;
	} else { // Таких ненашлось, присвоим команду обьекту
		queryObject.command = q.toLowerCase();
		// Параметры пустые
		queryObject.params = [];
	}
	return queryObject;
}