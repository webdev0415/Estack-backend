/** Static config */
export const staticConfig = {
  swagger: {
    location: 'api',
    title: 'ESTACKK API',
    description: 'ESTACKK API server',
    version: '1.0',
  },
  corsEnabled: true,
  mongo_options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
    useFindAndModify: false,
  },
};
