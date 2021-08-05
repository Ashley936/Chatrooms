const generateMsg = ({ message, username }) => {
    return {
        message,
        username,
        createdAt: new Date().getTime()
    }
}
const generateLocationMsg = ({latitude,longitude,username}) => {
    return {
        url: `https://google.com/maps?q=${latitude},${longitude}`,
        createdAt: new Date().getTime(),
        username,
    }
}

module.exports = {
    generateMsg,
    generateLocationMsg
}