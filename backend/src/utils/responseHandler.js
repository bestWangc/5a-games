// 通用响应函数
const sendResponse = (res, code, msg, data = {}) => {
    res.json({ code, msg, data });
};

// 成功响应
export const successRes = (res, data, msg = "success", code = 200) => {
    sendResponse(res, code, msg, data);
};

// 失败响应
export const errorRes = (res, msg = "fail", code = 500) => {
    sendResponse(res, code, msg);
};