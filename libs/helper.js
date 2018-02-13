/**
 * @project SfBTechBot
 * @description REST API реализация бота для Skype for Business
 * @module Вспомогательные функции
 * @author Александр Лобков <lobkovs@yandex.ru>
 */
var
	config = require('../config');

module.exports = {
	/**
	 * Проверка существования значения в массиве
	 *
	 * @param {array} array - Входной массив
	 * @param {mixed} search - Что искать в массиве
	 * @returns {bool} Результат поиска
	 */
	isInArray: function(array, search) {
		return array.indexOf(search) >= 0;
	},
	/**
	 * Проверка пользователя на допуск
	 *
	 * @param {string} username - Имя пользователя
	 * @return {bool}
	 */
	isAllowUser: function(username) {
		return this.isInArray(config.allowUsers, username);
	},
	/**
	 * Возвращает текущий или заданный штамп времени в строковом формате.
	 *
	 * @param {string} [format=Y.m.d H:i:s] - Формат даты/времени
	 * @param {date} [date] - Дата/Время
	 * @return {string} строковый формат даты/времени
	 */
	getStringOfTimespamp: function(format, date) {
		var
			format = format || 'Y.m.d H:i:s',
			timeArray = date ? this.getTimeArray(date) : this.getTimeArray();
			output = "";

		for(var i = 0; i < format.length; i++)
			output += timeArray[format[i]] ? timeArray[format[i]] : format[i];

		return output;
	},
	/**
	 * Возвращает строковый массив текущего или заданного времени
	 *
	 * @param {date} [date=now] Дата/Время
	 * @param {array} Строковый массив описания времени
	 */
	getTimeArray: function(date) {
		var output = [];
		var today = date || new Date();

		output['Y'] = today.getFullYear(),
		output['m'] = this.checkLeadZero(today.getMonth() + 1), // +1 потому что месяцы в JS начинаются с "0"
		output['d'] = this.checkLeadZero(today.getDate()),
		output['H'] = this.checkLeadZero(today.getHours()),
		output['i'] = this.checkLeadZero(today.getMinutes()),
		output['s'] = this.checkLeadZero(today.getSeconds());

		return output;
	},
	/**
	 * Возвращает значение с лидирующим нулём
	 *
	 * @param {(string|int)} value - Значение
	 * @return {(string|ing)}
	 */
	checkLeadZero: function(value) {
		if (value < 10) {
			return '0' + value;
		} else {
			return value;
		}
	},
	/**
	 * Вычисляет разницу времени в секундах
	 *
	 * @param {date} now - Текущее время
	 * @param {date} last - Время в прошлом
	 * @return {int} Разница времени в секундах
	 */
	diffTime: function(now, last) {
		var differenceTimeExport = now.getTime() - last.getTime();
		return Math.floor((differenceTimeExport) / (1000));
	},
	/**
	 * Возвращает текстовое представление прошеднего времени типа HH:MM:SS
	 * с переданного момента до текущего момента времени
	 *
	 * @param {date} last - Время в прошлом
	 * @return {string} Прошедшее время в виде HH:MM:SS
	 */
	elapsedTimeFormat: function(last) {
		var sec = this.diffTime(new Date(), last);
		var hours = Math.floor(sec / 3600);
		var minutes = Math.floor((sec - (hours * 3600)) / 60);
		var seconds = sec - (hours * 3600) - (minutes * 60);

		return this.checkLeadZero(hours) + ':' + this.checkLeadZero(minutes) + ':' + this.checkLeadZero(seconds);
	},
	/**
	 * Возвращает строку с заглавной первой буквой
	 *
	 * @param {string} str - Строка
	 * @returns {string} Строка с заглавной буквы
	 */
	ucFirst: function(str) {
		if (!str) return str;
		return str[0].toUpperCase() + str.slice(1);
	}
}

/**
 * Кастомная нативная функция
 * @see {@link https://jsperf.com/sdngjkn}
 *
 * @param {callback} f - Callback функция
 */
Array.prototype.forEachNext = function(f){
	var l = this.length;
	for (var i = 0; i < l; i++) f(this[i],i)
}