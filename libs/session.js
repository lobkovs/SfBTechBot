/**
 * @project SfBTechBot
 * @description REST API реализация бота для Skype for Business
 * @author Александр Лобков <lobkovs@yandex.ru>
 */

// /////////////
// /////////////
// Хранитель сессий
// /////////////
// /////////////


var
	/**
	* Хранит текущую сессию
	*
	* @global
	*/
	currentSession; // keep current session

module.exports = {
	/**
	 * Возвращает строкое представление для сессии
	 *
	 * @returns {string} Строка сессии
	 */
	get: function() {
		return `[sid:${currentSession || 'NaN'}]`
	},

	/**
	 * Устанавливает ID сессии глобально!
	 */
	set: function(id) {
		currentSession = id;
	},
}