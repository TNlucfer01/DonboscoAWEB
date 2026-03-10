// utils/apiResponse.js — Standard response helpers
//great work 
const success = (res, data, statusCode = 200) => {
    return res.status(statusCode).json({ success: true, data });
};

const error = (res, message, statusCode = 500, code = 'SERVER_ERROR') => {
    return res.status(statusCode).json({ success: false, error: { code, message } });
};

module.exports = { success, error };
