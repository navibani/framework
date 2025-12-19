function getState<State>(state: State) {
  return state;
}

function setState<State>(state: State, data: State) {
  state = data;
}

function createState<State>(data: State) {
  let state: State = data;

  return {
    getState: () => getState(state),
    setState: (data: State) => setState(state, data),
  };
}

function createErrorHandler() {
  return {};
}

export function createApp() {
  return {};
}
