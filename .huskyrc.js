const tasks = arr => arr.join(' && ');

module.exports = {
  hooks: {
    'pre-commit': tasks(['yarn lint']),
    'commit-msg': tasks(['yarn validate-commit-msg']),
  },
};
