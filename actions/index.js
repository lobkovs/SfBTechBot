var
	fs = require('fs'),
	path = require('path'),
	log = require('../libs/log')(module),
	A = {};

/**
 * Проверка существования обработчика комманды
 *
 * @param {string} name - Команда
 * @returns {boolean} существование комманды
 */
A.isExistAction = function(command) {
	// Получим массив действий
	var actions = this.getListActions();

	if (actions) {
		var result = false;
		actions.forEachNext(function(name) {
			if (name.toLowerCase() === command.toLowerCase())
				result = true;
		})
		return result;
	} else {
		log.error("Массив действий не найден!");
		return result;
	}
}

/**
 * Возвращает обьект комманды
 *
 * @param {string} name - Команда
 * @returns {object} Обьект комманды
 */
A.getAction = function(name) {
	var reqiredPath = path.join(getBasePath(), name);
	return require(reqiredPath);
}

/**
 * Возвращает функцию обработчик для комманды
 *
 * @param {string} name - Команда
 * @returns {function} функция обработчик для комманды
 */
A.getActionFunc = function(name) {
	return A.getAction(name).func;
}

/**
 * Возвращает справку по комманде
 *
 * @param {string} name - Команда
 * @returns {string} справка по комманде
 */
A.getActionInfo = function(name) {
	return A.getAction(name).info;
}

/**
 * Возвращает массив доступных комманд
 *
 * @returns {array} массив доступных комманд
 */
A.getListActions = function() {
	var actions = [];
	// Получаем путь до текущего модуля
	var modulePath = getBasePath();
	// Читаем эту папку и находим файлы(actions)
	// По соглашению все обработчики команд, должны лежать в папке actions
	fs
		.readdirSync(modulePath)
		.forEachNext(function(action, index) {
			// Пропустим если "index"
			if (/index/i.test(action))
				return false;
			// Обрезаем расширение ".js" файлов
			actions.push(action.slice(0, -3));
		})

	return actions;
}

/**
 * Возвращает путь до текущего модуля
 *
 * @returns {string} путь до текущего модуля
 */
function getBasePath() {
	return module.filename.split(path.sep).slice(0, -1).join(path.sep)
}

module.exports = A;