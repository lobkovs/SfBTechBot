var
	H			= require('../libs/helper'), // Подключим вспомогательные функции
	fs			= require('fs'),
	log 		= require('../libs/log')(module),
	path		= require('path'),
	config		= require('../config.js'),
	node_ssh	= require('node-ssh'),
	sendMail	= require('../libs/mail'),
	credentials	= require('../credentials.js'); //hide

var
	/**
	* Экземпляр Node SSH
	*
	* @instance
	*/
	ssh = new node_ssh(),
	/**
	* Флаг запущенной синхронизации
	*
	* @global
	*/
	isSyncStart = false, //
	/**
	* Хранит время старта синхронизации
	*
	* @global
	*/
	syncStartTime = null; //

module.exports = {
	/**
	 * Синхронизация
	 *
	 * @param {object} this - Полный обьект запроса к серверу.
	 * @return {Promise} Промис обьект выполнения
	 */
	func: function() {
		var req = this;
		return new Promise(function(resolve, reject) {
			if (isSyncStart) {
				resolve('Синхронизация уже запущена, ожидайте...');
			} else {
				var body = req.body;
				isSyncStart = true;
				// Запомним время старта
				syncStartTime = new Date();
				var msg;
				// Соединение с удалённым хостом
				ssh.connect({
					host: config.remoteHost,
					username: credentials.username,
					password: credentials.password,
					port: 22,
				}).then(function() { // Выполнение комманды
					ssh.execCommand(
						config.remoteCommand,
						{ cwd: config.remoteScriptDir }
					).then(function(result) {
						// Запишем кто запускал
						appendWho(body.adUser, getSyncStartTime());
						if (result.stdout) {
							// Запишем в файл результат
							fs.appendFileSync(getReportFilePath(), result.stdout);
							// Сгенерируем ответ
							msg = 'Синхронизация выполнена успешно!\r\nПрошло: ' +
								H.elapsedTimeFormat(getSyncStartTime());
							// Завершим promise положительно
							resolve(msg);
						} else if (result.stderr) {
							fs.appendFileSync(getReportErrFilePath(), result.stderr);
							// Завершим promise отрицательно
							resolve('Ошибка выполнения синхронизации!');
						}
						isSyncStart = false;
						// Запишем под кем закончилось
						appendWho(body.adUser, new Date(), 'Finish sync');
						// Отправим уведомление на почту
						sendMail('Выполнение синхронизации тарифов', fs.createReadStream(getReportFilePath()));
					})
				})
			}
		});
	},
	info: 'Запуск синхронизации'
}
/**
 * Возвращает время начала синхронизации, если нет, задаёт заново
 *
 * @returns {timestamp} Таймштам
 */
function getSyncStartTime() {
	if (!syncStartTime) syncStartTime = new Date();
	return syncStartTime;
}
/**
 * Добавим "кто запускал"
 *
 * @param {string} who - AD имя того кто запускает
 * @param {time} [time] - Date()
 * @param {string} [text] - Текст который надо записать
 */
function appendWho(who, time, text) {
	var
		message = "",
		time = H.getStringOfTimespamp('d-m-Y H:i:s', time) || H.getStringOfTimespamp('d-m-Y H:i:s'),
		text = text || 'Start sync';

	message += `\r\n${time} [${who}] ${text}\r\n`;
	fs.appendFileSync(getReportFilePath(), message);
}
/**
 * Возвращает полный путь к файлу "нормального" лога
 *
 * @returns {string} путь к лог файлу отсчёта
 */
function getReportFilePath() {
	var fileName = H.getStringOfTimespamp('log_dmY_His', getSyncStartTime()) + '.txt';
	return path.join(getLogsFolder(), fileName);
}
/**
 * Возвращает полный путь к файлу с ошибкой
 *
 * @returns {string} полный путь к файлу с ошибкой
 */
function getReportErrFilePath() {
	var fileName = 'err_' + H.getStringOfTimespamp('log_dmY_His', getSyncStartTime()) + '.txt'
	return path.join(getLogsFolder(), fileName);
}
/**
 * Возвращает папку с логами, если папки нет, тогда создаёт
 *
 * @returns {string} Возвращает путь к папке с логами
 */
function getLogsFolder() {
	var logsPath = "./logs/actions";
	if (!fs.existsSync(logsPath)) fs.mkdirSync(logsPath)
	return logsPath;
}