"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.verifyPartytownSetup = verifyPartytownSetup;
var _fs = require("fs");
var _chalk = _interopRequireDefault(require("next/dist/compiled/chalk"));
var _path = _interopRequireDefault(require("path"));
var _hasNecessaryDependencies = require("./has-necessary-dependencies");
var _isYarn = require("./is-yarn");
var _fileExists = require("./file-exists");
var _fatalError = require("./fatal-error");
var _recursiveDelete = require("./recursive-delete");
var Log = _interopRequireWildcard(require("../build/output/log"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
        return obj;
    } else {
        var newObj = {};
        if (obj != null) {
            for(var key in obj){
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {};
                    if (desc.get || desc.set) {
                        Object.defineProperty(newObj, key, desc);
                    } else {
                        newObj[key] = obj[key];
                    }
                }
            }
        }
        newObj.default = obj;
        return newObj;
    }
}
async function missingDependencyError(dir) {
    throw new _fatalError.FatalError(_chalk.default.bold.red("It looks like you're trying to use Partytown with next/script but do not have the required package(s) installed.") + '\n\n' + _chalk.default.bold(`Please install Partytown by running:`) + '\n\n' + `\t${_chalk.default.bold.cyan(await (0, _isYarn).isYarn(dir) ? 'yarn add @builder.io/partytown' : 'npm install @builder.io/partytown')}` + '\n\n' + _chalk.default.bold(`If you are not trying to use Partytown, please disable the experimental ${_chalk.default.cyan('"nextScriptWorkers"')} flag in next.config.js.`) + '\n');
}
async function copyPartytownStaticFiles(deps, staticDir) {
    const partytownLibDir = _path.default.join(staticDir, '~partytown');
    const hasPartytownLibDir = await (0, _fileExists).fileExists(partytownLibDir, 'directory');
    if (hasPartytownLibDir) {
        await (0, _recursiveDelete).recursiveDelete(partytownLibDir);
        await _fs.promises.rmdir(partytownLibDir);
    }
    const { copyLibFiles  } = await Promise.resolve(require(_path.default.join(deps.resolved.get('@builder.io/partytown'), '../utils')));
    await copyLibFiles(partytownLibDir);
}
async function verifyPartytownSetup(dir, targetDir) {
    try {
        var ref;
        const partytownDeps = await (0, _hasNecessaryDependencies).hasNecessaryDependencies(dir, [
            {
                file: '@builder.io/partytown',
                pkg: '@builder.io/partytown'
            }
        ]);
        if (((ref = partytownDeps.missing) === null || ref === void 0 ? void 0 : ref.length) > 0) {
            await missingDependencyError(dir);
        } else {
            try {
                await copyPartytownStaticFiles(partytownDeps, targetDir);
            } catch (err) {
                Log.warn(`Partytown library files could not be copied to the static directory. Please ensure that ${_chalk.default.bold.cyan('@builder.io/partytown')} is installed as a dependency.`);
            }
        }
    } catch (err) {
        // Don't show a stack trace when there is an error due to missing dependencies
        if (err instanceof _fatalError.FatalError) {
            console.error(err.message);
            process.exit(1);
        }
        throw err;
    }
}

//# sourceMappingURL=verify-partytown-setup.js.map