import { wrap } from 'module';

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

type DefinedError = {
  name: string;
  message: string;
  stack: string;
  status: { date: Date; solved: boolean }[];
};

function wrapFunction<Action>(actions: {
  [key: string]: (args?: any) => Action;
}) {
  try {
  } catch (error) {}
}

function createErrorHandler() {
  const defaultState: DefinedError[] = [];

  const state = createState<DefinedError[]>(defaultState);

  return {
    state, 
    wrapFunction: 
  };
}

function createAppActions() {
  let actions: { [key: string]: (props?: any) => any } = {};

  return {
    getActions: actions,
    addActions: (action: (props?: any)=> any) => {actions = {...actions, ...action}}
  }
}

export function createApp() {
  const appActions = createAppActions()
  const errorHandler = createErrorHandler();

  return {};
}
