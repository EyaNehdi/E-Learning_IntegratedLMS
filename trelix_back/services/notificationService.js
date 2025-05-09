const notifier = require('node-notifier');
const path = require('path');

// Fonction pour envoyer une notification de bureau
const sendDesktopNotification = (title, message) => {
    notifier.notify({
        title: title,            
        message: message,         
        sound: true,              
        wait: true,               
        icon: path.join(__dirname, 'icon.png')  
    });
};

module.exports = {
    sendDesktopNotification
};
