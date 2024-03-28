import { createRequire } from "module";
const require = createRequire(process.cwd());
export default (dependency) => require.resolve(dependency, { paths: [process.cwd()] });
