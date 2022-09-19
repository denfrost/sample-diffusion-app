import { execSync } from "child_process";
import * as path from "path";
import * as fs from "fs";

function install() {
  assertGitInstalled();
  assertPythonInstalled();
  assertPipInstalled();

  cloneGitRepos();

  installPythonPackages();
}

function assertGitInstalled() {
  try {
    execSync("git --version");
  } catch (error) {
    console.error("Git is not installed. Please install git and try again.");
    process.exit(1);
  }
}

function assertPythonInstalled() {
  try {
    execSync("python --version");
  } catch (error) {
    console.error(
      "Python is not installed. Please install python and try again."
    );
    process.exit(1);
  }
}

function assertPipInstalled() {
  try {
    execSync("pip --version");
  } catch (error) {
    console.error("Pip is not installed. Please install pip and try again.");
    process.exit(1);
  }
}

function createOutFolder() {
  const outFolder = path.join(process.cwd(), "out");

  if (fs.existsSync(outFolder)) {
    fs.rmSync(outFolder, { recursive: true, force: true });
  }

  fs.mkdirSync(outFolder);
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
  createOutFolder();

  // cd to out dir
  process.chdir(path.join(process.cwd(), "out"));

  console.log("Cloning git repos...");

  gitClone("https://github.com/harmonai-org/sample-generator");
  gitClone("https://github.com/crowsonkb/v-diffusion-pytorch", {
    recursive: true,
  });
}

function installPythonPackages() {
  const cwd = process.cwd();

  // the repos we cloned
  pipInstall(path.join(cwd, "sample-generator"));
  pipInstall(path.join(cwd, "v-diffusion-pytorch"));

  // deps
  pipInstall("ipywidgets==7.7.1");
  pipInstall("flask-socketio");
  pipInstall("eventlet");
  pipInstall("simple-websocket");
}

install();
