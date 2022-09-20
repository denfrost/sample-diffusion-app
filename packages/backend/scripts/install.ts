import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";

const requiredCommands = [
  'conda',
  'git',
  'python',
  'pip'
];


install();

function install() {
  assertCommandsInstalled(requiredCommands);

  cloneGitRepos();

  installPythonPackages();
}

function installPythonPackages() {
  const cwd = process.cwd();

  // the repos we cloned
  pipInstall(path.join(cwd, "sample-generator"));
  pipInstall(path.join(cwd, "v-diffusion-pytorch"));

  // deps
  pipInstall("flask-socketio");
  pipInstall("eventlet");
  pipInstall("simple-websocket");
}



function assertCommandsInstalled(names: string[]) {
  names.forEach(name => assertCommandInstalled(name));
}

function assertCommandInstalled(name: string) {
  try {
    execSync(`${name} --version`);
  } catch (error) {
    console.error(`${name} is not installed. Please install ${name} and try again.`);
    process.exit(1);
  }
}

function createSubFolder(folder: string) {
  const subFolder = path.join(process.cwd(), folder);

  if (fs.existsSync(subFolder)) {
    fs.rmSync(subFolder, { recursive: true, force: true });
  }

  fs.mkdirSync(subFolder);
}

function gitClone(path: string, opts?: { recursive?: boolean }) {
  const args = ["clone", path];
  if (opts?.recursive) {
    args.push("--recursive");
  }
  execSync("git " + args.join(" "));
}

function pipInstall(path: string) {
  execSync("pip install " + path);
}

function cloneGitRepos() {
  createSubFolder("out");
  createSubFolder("ckpt");

  // cd to out dir
  process.chdir(path.join(process.cwd(), "out"));

  console.log("Cloning git repos...");

  gitClone("https://github.com/harmonai-org/sample-generator");
  gitClone("https://github.com/crowsonkb/v-diffusion-pytorch", {
    recursive: true,
  });
}


