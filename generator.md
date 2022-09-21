# Generator Guide

## Requirements

- git (to clone the repo)
- conda (to set up the python environment)

You can check for these commands with `git --version` and `conda --version`.

An easy way to get `conda` on Windows is by installing [Anaconda](https://www.anaconda.com/) and then using the "Anaconda Prompt".

## Clone the repo

Clone the repo and `cd` into it:
```
git clone https://github.com/sudosilico/sample-diffusion
cd sample-diffusion
```

## Set up conda environment

`cd` into the backend project and create the environment:

```
cd ./packages/backend
conda env create -f environment.yml
conda activate sd_backend
```

Make a `models` folder and place your model in `packages/backend/models/model.ckpt`, then run the generator:

```
python ./scripts/generate.py
```

Alternatively, you can pass a custom model path as an argument:

```
python ./scripts/generate.py --ckpt models/some-other-model.ckpt
```

## Generator CLI Arguments

[See available arguments and defaults.](https://github.com/sudosilico/sample-diffusion/blob/main/packages/backend/scripts/generate.py#L50:L50)
