const combineReducersWithFullState = (reducers) => {
  return (state, action) => {
    var hasChanged = false;
    var nextState = {};
    const finalReducerKeys = Object.keys(reducers);
    for (var _i = 0; _i < finalReducerKeys.length; _i++) {
      var _key = finalReducerKeys[_i];
      var reducer = reducers[_key];
      var previousStateForKey = state[_key];
      var nextStateForKey = reducer(previousStateForKey, action, state);

      if (typeof nextStateForKey === 'undefined') {
        var actionType = action && action.type;
        throw new Error(process.env.NODE_ENV === "production" ? "Error in combineReducersWithFullState" : "When called with an action of type " + (actionType ? "\"" + String(actionType) + "\"" : '(unknown type)') + ", the slice reducer for key \"" + _key + "\" returned undefined. " + "To ignore an action, you must explicitly return the previous state. " + "If you want this reducer to hold no value, you can return null instead of undefined.");
      }

      nextState[_key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }

    const keysInNextState = Object.keys(nextState);
    const keysInState = Object.keys(state);
    // Copy new values to old state
    keysInState.filter((k) => keysInNextState.indexOf(k) < 0).forEach((k) => {
      nextState[k] = state[k];
    });
    keysInNextState.filter((k) => keysInState.indexOf(k) < 0).forEach((k) => {
      state[k] = nextState[k];
    });

    // hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length;
    return hasChanged ? nextState : state;
  }
}

export default combineReducersWithFullState;