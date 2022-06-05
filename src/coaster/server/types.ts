export type Server = {
  start: () => Promise<void>;
  stop: () => Promise<void>;
};
