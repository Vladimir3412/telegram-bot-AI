const TelegramApi = require('node-telegram-bot-api')
const token = '8046196760:AAHSMzcyFC9t_bSO76rTeSv2kBG-hGUd6zo'
const {gameOptions, againOptions} = require('./options');
const sequelize = require('./db')
const UserModel = require('./models')
const bot = new TelegramApi(token, {polling: true})

const chats = {}

const startGame = async (chatId) => {
            await bot.sendMessage(chatId, `Сейчас я загадаю число от 0 до 9, а ты отгадай его!`)
        const randomNumber = Math.floor(Math.random() * 10)
         chats[chatId] = randomNumber; 
          await sleep(500)
         await bot.sendMessage(chatId,"Отгадывай", gameOptions )
}



const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));



const start = async () => {

    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (error) {
        console.log('Поломано соединение к БД');
        
    }

    bot.setMyCommands([
   {command: '/start', description: 'Запуск бота'},
    {command: '/info', description: 'Получить информацию'},
    {command: '/game', description: 'Игра'},
         ]
    )





bot.on('message',  async msg => {

     const text = msg.text;
    const chatId = msg.chat.id;

       try {
         if (text === "/start") {
   await UserModel.create({chatId})
   await bot.sendMessage(chatId, "Добро пожаловать!", )
   return bot.sendPhoto(chatId, 'https://cdn.html.it/_DWECPGZRuSKvJ1SfR0JqFUyBto=/2212x1210/smart/filters:format(webp)/https://www.html.it/app/uploads/2024/03/react.jpeg')
    }
    
      else if (text === "/info") {
        const user = await UserModel.findOne({chatId})
        await bot.sendMessage(chatId, "Загружаю информацию...")
        await sleep(1000)
        await bot.sendMessage(chatId, "Готово!");
        await bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name}, твой ID TG: @${msg.from.username}, в игре  у тебя правильных ответов: ${user.right}, неправильных: ${user.wrong}` )
        
    }
     else if(text === "/game") {
        return startGame(chatId);
    }

    else {
        return bot.sendMessage(chatId, `Я тебя не понимаю, ${msg.from.first_name}`);
    }
    } catch (error) {
        return bot.sendMessage(chatId, 'Ошибка не по плану');
    }

})
    bot.on('callback_query',  async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;

        if(data === '/again') {
             return startGame(chatId);
        }

        const user = await UserModel.findOne({chatId})

        if(data == chats[chatId]) {
            user.right += 1;
            await  bot.sendMessage(chatId, `Поздравляю, вы отгадал цифру ${chats[chatId]} 🔥`, againOptions )
        } else {
            user.wrong += 1;
            await bot.sendMessage(chatId, `К сожалению, ты проиграл, правильная цифра была ${chats[chatId]}`, againOptions)
        }
        await user.save();
    })
   

}

start()