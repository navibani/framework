function getState<state>(state: state) {
  return state;
}

function setState<state>(data: state, state: state) {
  state = data;
}

function createState<state>(data: state) {
  let state: state = data;

  return {
    getState: getState<state>(state),
    setState: (data: state) => setState<state>(data, state),
  };
}

export function createApp() {
  return {};
}
