module.exports = {
	func: function(name, q,w,e,r) {
		var request = this;
		return new Promise(function(resolve, reject) {
			console.log('Запрос из обработчика команды', request.body);
			console.log('q ->', q);
			console.log('w ->', w);
			console.log('e ->', e);
			console.log('r ->', r);
			resolve(`Привет, ${name}. Я бот SfBTechBot! Как твои дИла?:)\r\n${q} ${w} ${e} ${r}`)
		})
	},
	info: 'Hello',
	showInHelp: false,
}