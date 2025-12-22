type Action = <Props, Result>(
  props?: Props | undefined | void
) => Result | Promise<Result> | void;

function getActions<State>(state: State) {
  return state;
}

function addAction<State, Action>(state: State, action: Action) {
  state = {
    ...state,
    action,
  };
}

function createActions() {
  let state = {};

  return {
    getActions: getActions(state),
    addAction: (action: Action) => addAction(state, action),
  };
}

function createApp() {
  const actions = createActions();

  return {};
}

const app = createApp();
