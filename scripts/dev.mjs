import { spawn } from 'node:child_process';

const commands = [
  ['npm', ['run', 'dev', '--workspace', 'apps/api']],
  ['npm', ['run', 'dev', '--workspace', 'apps/web']]
];

const children = commands.map(([command, args]) =>
  spawn(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32'
  })
);

function shutdown(signal) {
  for (const child of children) child.kill(signal);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

Promise.race(
  children.map(
    (child) =>
      new Promise((resolve) => {
        child.on('exit', (code) => resolve(code ?? 0));
      })
  )
).then((code) => {
  shutdown('SIGTERM');
  process.exit(Number(code));
});
