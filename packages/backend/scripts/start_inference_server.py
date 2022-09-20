import os, argparse, math, gc
import torchaudio
import torch
from torch import nn
from pytorch_lightning import seed_everything
from einops import rearrange
from diffusion import sampling
from audio_diffusion.models import DiffusionAttnUnet1D
from audio_diffusion.utils import Stereo, PadCrop
from flask import Flask
from flask_socketio import SocketIO

from sample_diffusion.model import load_model
from sample_diffusion.inference import generate_audio
from sample_diffusion.server import SocketIOServer, create_socket_server, start_socket_server

def main():
    args, generation_args = parse_cli_args()
    
    # load model
    model, device = load_model(args)

    server = SocketIOServer()
    
    # create socket server
    socketio, app = create_socket_server(args.ws_host, args.ws_port, args.public_url)

    start_socket_server(socketio, app, args)

    # set seed
    #generation_args.seed = set_seed(generation_args.seed)

    # generate
    #audio_out = generate_audio(generation_args, args, device, model, create_progress_callback(socketio, 'zzz'))
    
    # save audio
    #save_audio(generation_args, args, audio_out)

def set_seed(new_seed):
    if new_seed != -1:
        seed = new_seed
    else:
        seed = torch.seed()
    seed = seed % 4294967295
    seed_everything(seed)
    return seed

# ----- generation

def save_audio(generation_args, model_args, audio_out, base_out_path):
    output_path = get_output_path(generation_args, base_out_path)

    if not os.path.exists(output_path):
        os.makedirs(output_path)

    for ix, sample in enumerate(audio_out):
        output_file = os.path.join(output_path, f'sample #{ix + 1}.wav')
        open(output_file, 'a').close()
        output = sample.cpu()
        torchaudio.save(output_file, output, model_args.sr)
        
    print(f'Your samples are waiting for you here: {output_path}')

def get_output_path(generation_args, base_out_path):
    if generation_args.input:
        return os.path.join(base_out_path, "variations", f'{generation_args.seed}_{generation_args.n_steps}_{generation_args.noise_level}/')
    
    return os.path.join(base_out_path, "generations", f'{generation_args.seed}_{generation_args.n_steps}/')
    

# ----- args

def parse_cli_args():
    parser = argparse.ArgumentParser()

    # args for socketio server
    parser.add_argument("--ws_host", type = str, default = 'localhost', help = "host for the websocket server")
    parser.add_argument("--ws_port", type = int, default = 5001, help = "port for the websocket server")
    parser.add_argument("--public_url", type = str, default = 'http://localhost:3000', help = "public url for the dashboard")

    # args for model
    parser.add_argument("--ckpt", type = str, default = "models/model.ckpt", help = "path to the model to be used")
    parser.add_argument("--spc", type = int, default = 65536, help = "the samples per chunk of the model")
    parser.add_argument("--sr", type = int, default = 48000, help = "the samplerate of the model")

    # ??
    parser.add_argument("--out_path", type = str, default = "audio_out", help = "path to the folder for the samples to be saved in")

    # args for generation
    parser.add_argument("--sample_length_multiplier", type = int, default = 1, help = "sample length multiplier for audio2audio")
    parser.add_argument("--input_sr", type = int, default = 44100, help = "samplerate of the input audio specified in --input")
    parser.add_argument("--noise_level", type = float, default = 0.7, help = "noise level for audio2audio")
    parser.add_argument("--n_steps", type = int, default = 25, help = "number of sampling steps")
    parser.add_argument("--n_samples", type = int, default = 1, help = "how many samples to produce / batch size")
    parser.add_argument("--seed", type = int, default = -1, help = "the seed (for reproducible sampling)")
    parser.add_argument("--input", type = str, default = '', help = "path to the audio to be used for audio2audio")

    return parser.parse_args()

# ----- websocket



if __name__ == "__main__":
    main()