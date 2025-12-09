async function handleError<Args, Res>({
  process,
  args,
}: {
  process: (args: Args) => Promise<Res>;
  args: Args;
}): Promise<Res | void> {
  try {
    return await process(args);
  } catch (error) {
    console.error('An error occurred:', error);
    return;
  }
}

export default async function app() {
  return {};
}
