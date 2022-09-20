# Sample Diffusion

Sample Diffusion is a web application that allows you to use Dance Diffusion AI models to generate, organize, and edit audio samples. 

## Launch the web dashboard

Using **Yarn 1**, install the required dependencies:

```
yarn install
```

Then, launch the web dashboard with:

```
yarn workspace web start
```

You should then be able to launch the Sample Diffusion dashboard, although you will need to connect it to the Dance Diffusion backend service before you will be able to generate or process audio.

## Launch the Dance Diffusion backend

Using **conda**, install the 'sd_backend` conda environment:

```
conda env create -f packages/backend/environment.yml
conda activate sd_backend
```

Then, launch the Dance Diffusion service:

```
yarn workspace backend 
```


## Project Structure

The project is made up of a full-stack Next.js web application and a python socket.io service built around Dance Diffusion. It uses tRPC, as well as 

[socket.io]() is used for realtime communication between the Next.js backend and the Dance Diffusion python service. [tRPC](https://trpc.io) subscriptions are used for realtime between the Next.js backend and frontend.

- apps/web
  - [Next.js](https://nextjs.org) web application.
- packages/api
  - [tRPC](https://trpc.io) API
- packages/db
  - [Prisma](https://prisma.io) schema
- packages/backend
  - A python socket.io service that processes requests using [Dance Diffusion](#) 
