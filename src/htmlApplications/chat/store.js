import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'
// import { namedReducerEnhancer } from "redux-named-reducers";

// import monitorReducersEnhancer from './enhancers/monitorReducers'
// import loggerMiddleware from './middleware/logger'
import rootReducer from './rootReducer'

export default function configureAppStore(preloadedState) {
  const store = configureStore({
    reducer: rootReducer,
    middleware: [...getDefaultMiddleware()],
    preloadedState,
    // enhancers: [namedReducerEnhancer]
  })

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept("./rootReducer", () => {
      store.replaceReducer(require("./rootReducer").default)
    });
  }

  return store
}