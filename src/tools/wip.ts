function createActions(): { [key: string]: (...args: any[]) => any } {
  return {};
}

function createApp() {
  const actions = createActions();

  return {
    ...actions,
  };
}
