# Generator Guide

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
```

Make a `models` folder and place your model in `packages/backend/models/model.ckpt`, then run the generator:

```
python ./scripts/generate.py
```

## Generator CLI Arguments

```
```