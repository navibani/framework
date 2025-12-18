function createState<state>(data: state) {
  let state: state = data;

  return {
    getState: () => {
      return state;
    },
    setState: (data: state) => {
      state = data;
    },
  };
}

function createErrorHandler() {
  const state = createState<Error | null>(null);

  return {};
}

export function createApp() {
  return {};
}
