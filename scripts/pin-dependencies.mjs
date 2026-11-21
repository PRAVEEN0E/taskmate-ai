// Run after npm install to pin direct dependencies to the resolved stable versions.
import { readFileSync, writeFileSync } from 'node:fs';
const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
for (const folder of ['.', 'frontend', 'backend']) {
  const file = `${folder}/package.json`,
    pkg = JSON.parse(readFileSync(file, 'utf8'));
  for (const group of ['dependencies', 'devDependencies'])
    for (const name of Object.keys(pkg[group] ?? {})) {
      const item =
        lock.packages[`${folder}/node_modules/${name}`] ?? lock.packages[`node_modules/${name}`];
      if (!item?.version) throw new Error(`Missing ${name}`);
      if (item.version.includes('-')) throw new Error(`Pre-release dependency: ${name}`);
      pkg[group][name] = item.version;
    }
  writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
}
