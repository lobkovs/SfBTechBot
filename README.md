# SfBTechBot [REST API]

[Введение](#Введение)<br>
[Структура](#Структура)<br>
[Конфиги](#Конфиги)<br>
[Модульная архитектура](#Модульность)<br>
[Маршрутизация](#Маршрутизация)<br>

<a name="Введение"></a>
## Введение

__SfBTechBot__ для Skype for Business. Разработан для оптимизации рутинных задач эксплуатации сервиса.

Адрес бота http://localhost:2909

Размещение бота `/home/lobkovs/nodejs/SfBTechBot`

Реализован на JavaScript. Серверная часть [NODEJS](https://nodejs.org/api/) c [Resify](http://restify.com/docs/home/) модулем для реализации REST API архитектуры.

__SfBTechBot__ имеет поддержку модульной архитектуры обработчиков команд. ([Подробней](#Модульность))

<a name="Структура"></a>
## Структура

Структура основных папок и файлов:

#### actions/

Содержит набор файлов-обработчиков команд от пользователя. Файл __index.js__ не является обработчиком команд от пользователя.<br>
Этот файл отвечает за реализцию управления обработчиками. Остальные файлы отвечаю за обработку команды от пользователя.<br>
Наполнение файла содержит обьект описывающий команду. Более подробное расписание в разделе [Модульная архитектура](#Модульность)<br>

#### libs/

Содержит набор вспомогательных модуль, таких как инициализация лога, хранилище внутренних сессии, отправка почты.<br>
Комментарии есть в коде файлов.

#### logs/actions/

Содержит лог файлы выполненных действий. В данном моменте времени, туда пишутся отсчёты о выполненной синхронизации.<br>
Все можно будет посмотреть с каким результатом выполнялась синхронизация.

#### logs/self/

Содержит лог файлы самого REST API сервера. В их числе, какой запрос пришёл, что проиходилось дальше, какой был ответ и т.д.<br>
Формат записи: `<timestamp> - [<log_level>] [<Какой файл написал лог>] [sid: <id текущей сессии>] <тело сообщения>`

#### router/

Содержит основной роутер сервиса. Роутер занимается поиском обработчиков команд пользователя, проверкой входящего запроса в целом,<br>
т.е. передана ли сессия, передано ли имя пользователя, имеет ли пользователь доступ к сервису. Комментарии есть в коде:).

#### app.js

Основной файл сервера. Инициализирует сервер, устанавливает роутер, стартует сервер. По-умолчанию сервер стартует на порту __:2909__.

#### pm2.start.config.js

Настройки процесс мэнэджера [PM2](http://pm2.keymetrics.io/)

#### swagger.json

Описание спецификации запросов к серверу [SWAGGER](https://swagger.io/)

<a name="Конфиги"></a>
## Конфиги

#### config.js

Содержит основной конфиг для всего приложения.

Структура файла:

`allowUsers`— Строковый массив логинов пользователей;

`remoteHost`— Адрес удалённого хоста, для выполнения SSH команд (синхронизация);

`remoteScriptDir`— Путь до папки скрипта на удалённом хосте;

`remoteCommand`— Вызываемая команда на удалённом хосте;

`mailAddreses`— Список адресов на которые отправлять уведомления о синхронизации;

`answerUrl`<a name="answerUrl"></a> — URL адрес для ответов сервера, т.е. всё что сформировал обработчик, отсылается по этому адресу и пользователь видит ответ на клиенте;

#### credentials.js

Логин и пароль для авторизации на удалённом хосте, где необходимо выполнить команду.

<a name="Модульность"></a>
## Модульная архитектура

Как уже было сказано, __SfBTechBot__ имеет поддержку модульной архитектуры обработчиков команд.<br>
Это означает что каждый файл в папке `actions/` за исключением _index.js_ описывает обьект обработчика команды.

Рассмотрим пример простейшего модуля обработки, например __hello.js__:

```js
module.exports = {
	func: function(name, q, w, e, r) {
		var request = this;
		return new Promise(function(resolve, reject) {
			console.log('Запрос из обработчика команды', request.body);
			console.log('q ->', q);
			console.log('w ->', w);
			console.log('e ->', e);
			console.log('r ->', r);
			resolve(`Привет, ${name}. Я бот SfBTechBot! Как твои дИла:)?:)\r\n${q} ${w} ${e} ${r}`)
		})
	},
	info: 'Hello',
	showInHelp: false,
}
```

А теперь попорядку!

Базовая структура модуля обработчика команды.

```js
{
    func: {function}, // Функция должна вернуть Promise обьект выполнения обработки, подробней https://learn.javascript.ru/promise
    info: {sting}, // Строка для справки о команде,
    showInHelp: true/false, // показывать в справочнике сервиса, т.е. когда пользователь отправил help
}
```

Метод `func` реализует Promise обьект и выполняется в контекте запроса к серверу.

В функцию на вход передаются параметры от пользователя, что это значит?<br>
Например, если пользователь на клиенте ввел `stat <domain> <param_a> <param_b>`, то __func__ модуля __stat__(actions/stat.js) можно записать так:

```js
...
func: function(domain, param_a, param_b) {
    return new Promise(function(resolve, reject) {
        // some code here
    })
}
...
```
, если параметров будет меньше, например только один `<domain>`, то `<param_a>` и `<param_b>` будут равны `undefined`.

__... выполняется в контекте запроса к серверу__, можно описать так:

```js
...
func: function(domain, param_a, param_b) {
    var request = this;
    return new Promise(function(resolve, reject) {
        var command = request.body.text;
        // more code here
    })
}
...
```
, т.е. теперь в переменной `request` содержиться весь обьект запроса к серверу и с ним можно работать.<br>
Например, в переменную `command`, мы положили оригинальный текст запроса к серверу.

Про `module.exports = {}` описание и как это работает и примеры можно посмотреть [здесь](https://nodejs.org/api/modules.html).

<a name="Маршрутизация"></a>
## Маршрутизация

__SfBTechBot__, является одновременно сервером и клиентом. Это означает что __SfBTechBot__ принимает запросы от SfB сервера на адрес http://localhost:2909/,<br>
а отвечает на адрес указанный в config.js -> [answerUrl](#answerUrl).

Пример запроса:
```json
{
    "text"      : "help",
    "adUser"    : "lobkovs",
    "session"   : "d9438340-7a81-4965-b9f0-6d2efad603f0"
}

```
Пример ответа:
```json
{
    "text"      : "Справка:\r\n\"sync\" - Запуск синхронизации\r\n\"help\" - Помощь\r\n\"stat\" - Статистика по серверу\r\n",
    "session"   : "d9438340-7a81-4965-b9f0-6d2efad603f0"
}

```
Так сделано по двум причинам:
1. Ответ может в этом случае приходить со значительной задержкой и это ни на что не повлияет
2. Система сможет работать с несколькими сессиями (обращениями пользователей на один адрес скайпа) одновременно. Ответ на каждую сессию будет возвращаться тому пользователю, который ее инициировал.

Т.е. говоря коротко, __SfBTechBot__ принимает запрос на один адрес, далее обрабатывает его и запрашивает другой адрес, где телом запроса будет обработанный __SfBTechBot__ ответ.