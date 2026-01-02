type Actions<Shape> = Shape & {
  addAction: <Key extends string, Action extends (...args: any[]) => any>(
    key: Key,
    action: Action
  ) => Actions<Shape & { [Property in Key]: Action }>;
};

function createActions<Shape extends Record<string, any>>(
  currentActions: Shape
): Actions<Shape> {
  return {
    ...currentActions,
    addAction: (key, action) => {
      const newActions = { ...currentActions, [key]: action };
      return createActions(newActions);
    },
  } as Actions<Shape>;
}

let testApp = createActions({});

testApp = testApp.addAction('Test', () => {
  console.log('Test');
});

testApp.Test();
