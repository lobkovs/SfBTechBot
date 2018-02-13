/**
 * Помощь
 *
 * @return {Promise} Промис обьект выполенения
 */

var
	H = require('../libs/helper'),
	_ = require('lodash'),
	log = require('../libs/log')(module),
	actions = require('../actions');

module.exports = {
	func: function() {
		return new Promise(function(resolve, reject) {
			var answer = "Справка:\r\n";
			actions
				.getListActions()
				.forEachNext(function(action) {
					var object = actions.getAction(action);
					// Если обьект:
					// 1. Не пуст
					// 2. Имеет совйство "showInHelp"
					// 3. showInHelp === false,
					// Тогда пропустим его вывод в текст помощи
					if (!_.isEmpty(object) && _.has(object, 'showInHelp') && !object.showInHelp) {
						return false;
					}
					answer += `"${H.ucFirst(action)}" - ${object.info}\r\n`;
				})
			resolve(answer);
		});
	},
	info: 'Помощь',
}