type Fn = (...args: any[]) => any;

type FnList = Record<string, Fn>;

type App<Actions extends FnList> = {
  actions: Actions;
  addAction: <Key extends string, Action extends Fn>(
    name: Key,
    action: Action
  ) => App<Actions & { [P in Key]: Action }>;
};

function createApp<Actions extends FnList = {}>(
  actions = {} as Actions
): {
  actions: Actions;
  addAction: <Key extends string, Action extends Fn>(
    name: Key,
    action: Action
  ) => App<Actions & { [P in Key]: Action }>;
} {
  return {
    actions,
    addAction: (name, action) => createApp({ ...actions, [name]: action }),
  };
}
