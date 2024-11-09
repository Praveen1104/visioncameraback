const sendResponse = (statuscode, message, data, additionalArgs = {}) => {
  const response = {
    status: statuscode,
    message: message,
    response: data,
    ...additionalArgs,
  };

  return response;
};

module.exports = { sendResponse };
