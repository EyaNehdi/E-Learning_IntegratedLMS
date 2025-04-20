let io = null;

const initSocket = (socketInstance) => {
    io = socketInstance;
};

const emitNewLog = (logData) => {
    if (io) {
        io.emit('new-audit-log', logData);
    }
};

module.exports = {
    initSocket,
    emitNewLog
};