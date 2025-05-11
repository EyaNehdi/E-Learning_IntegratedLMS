const notifier = require('node-notifier');
const path = require('path');

// Fonction pour envoyer une notification de bureau
const sendDesktopNotification = (title, message) => {
    notifier.notify({
        title: title,             // Titre de la notification
        message: message,         // Message de la notification
        sound: true,              // Activer le son pour la notification
        wait: true,               // Attendre que l'utilisateur interagisse avec la notification
        icon: path.join(__dirname, 'icon.png')  // Tu peux mettre une icône personnalisée pour ta notification
    });
};

module.exports = {
    sendDesktopNotification
};
