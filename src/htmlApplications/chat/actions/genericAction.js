export const genericAction = (dispatch) => {
  return (type, event, ...args) => {
    const [payload] = args;
    // console.log('Got request for type', type, 'with payload', payload);
    dispatch({
      type,
      payload
    });
  }
};
