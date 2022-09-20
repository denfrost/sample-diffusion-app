import os, argparse, math, gc
import torchaudio
import torch
from torch import nn

from einops import rearrange
from diffusion import sampling
from audio_diffusion.models import DiffusionAttnUnet1D
from audio_diffusion.utils import Stereo, PadCrop

from sample_diffusion.model import load_model
from sample_diffusion.inference import generate_audio
from sample_diffusion.server import SocketIOServer, create_socket_server, start_socket_server

def main():
    args, generation_args = parse_cli_args()

    model, device = load_model(args)
    audio_out = generate_audio(generation_args, args, device, model)

    save_audio(generation_args, args, audio_out)

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
    seed = generation_args.seed
    steps = generation_args.n_steps
    noise = generation_args.noise_level

    if generation_args.input:
        return os.path.join(base_out_path, "variations", f'{seed}_{steps}_{noise}/')

    return os.path.join(base_out_path, "generations", f'{seed}_{steps}/')
    
def parse_cli_args():
    parser = argparse.ArgumentParser()

    # args for model
    parser.add_argument("--ckpt", type = str, default = "models/model.ckpt", help = "path to the model to be used")
    parser.add_argument("--spc", type = int, default = 65536, help = "the samples per chunk of the model")
    parser.add_argument("--sr", type = int, default = 48000, help = "the samplerate of the model")

    # args for generation
    parser.add_argument("--out_path", type = str, default = "audio_out", help = "path to the folder for the samples to be saved in")
    parser.add_argument("--sample_length_multiplier", type = int, default = 1, help = "sample length multiplier for audio2audio")
    parser.add_argument("--input_sr", type = int, default = 44100, help = "samplerate of the input audio specified in --input")
    parser.add_argument("--noise_level", type = float, default = 0.7, help = "noise level for audio2audio")
    parser.add_argument("--n_steps", type = int, default = 25, help = "number of sampling steps")
    parser.add_argument("--n_samples", type = int, default = 1, help = "how many samples to produce / batch size")
    parser.add_argument("--seed", type = int, default = -1, help = "the seed (for reproducible sampling)")
    parser.add_argument("--input", type = str, default = '', help = "path to the audio to be used for audio2audio")

    return parser.parse_args()

if __name__ == "__main__":
    main()