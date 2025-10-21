const modules = import.meta.glob('/src/data/quizzes/*.json', { eager: true });

export const QUIZ_POOL = Object.entries(modules).map(([path, mod]) => ({
  key: path.split('/').pop().replace('.json', ''), // quiz1, quiz2, ...
  data: mod.default,
}));