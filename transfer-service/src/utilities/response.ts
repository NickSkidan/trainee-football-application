const response = (statusCode: number, message: string, data: unknown) => {
    if (data) {
      return {
        statusCode,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          message,
          data,
        }),
      };
    } else {
      return {
        statusCode,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          message,
        }),
      };
    }
  };
  
  export const SuccessResponse = (data: object) => {
    return response(200, 'success', data);
  };
  
  export const ErrorResponse = (code: number, error: unknown) => {
    if (Array.isArray(error)) {
      const errorObject = error[0].constraints;
      const errorMessage = errorObject[Object.keys(errorObject)[0]] || 'Error occured';
      return response(code, errorMessage, errorMessage);
    }
  
    return response(code, `${error}`, error);
  };
  