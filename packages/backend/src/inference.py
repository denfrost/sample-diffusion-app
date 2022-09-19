import os, argparse, math, gc

import torch
from torch import optim, nn

import torchaudio

from diffusion import sampling
from audio_diffusion.models import DiffusionAttnUnet1D
from audio_diffusion.utils import Stereo, PadCrop
from pytorch_lightning import seed_everything
from einops import rearrange

class DiffusionInference(nn.Module):
    def __init__(self, global_args):
        super().__init__()

        self.diffusion_ema = DiffusionAttnUnet1D(global_args, n_attn_layers = 4)
        self.rng = torch.quasirandom.SobolEngine(1, scramble=True)

def create_model(chunk_size, samplerate):
    class Object(object):
        pass
    model_args = Object()
    model_args.sample_size = chunk_size
    model_args.sample_rate = samplerate
    model_args.latent_dim = 0

    return DiffusionInference(model_args)

def load_state_from_checkpoint(device, model, checkpoint_path):
    model.load_state_dict(torch.load(checkpoint_path)["state_dict"],strict = False)
    return model.requires_grad_(False).to(device)

def get_crash_schedule(t):
    sigma = torch.sin(t * math.pi / 2) ** 2
    alpha = (1 - sigma ** 2) ** 0.5
    return alpha_sigma_to_t(alpha, sigma)

def alpha_sigma_to_t(alpha, sigma):
    return torch.atan2(sigma, alpha) / math.pi * 2

def t_to_alpha_sigma(t):
    return torch.cos(t * math.pi / 2), torch.sin(t * math.pi / 2)

def load_to_device(device, path, sr):
    audio, file_sr = torchaudio.load(path)
    if sr != file_sr:
      audio = torchaudio.transforms.Resample(file_sr, sr)(audio)
    return audio.to(device)

def rand2audio(device, model, chunk_size, batch_size, n_steps):
    torch.cuda.empty_cache()
    gc.collect()
    
    noise = torch.randn([batch_size, 2, chunk_size]).to(device)
    t = torch.linspace(1, 0, n_steps + 1, device = device)[:-1]
    step_list = get_crash_schedule(t)

    return sampling.iplms_sample(model, noise, step_list, {}).clamp(-1, 1)

def audio2audio(device, model, chunk_size, batch_size, n_steps, audio_input, noise_level, sample_length_multiplier):
    effective_length = chunk_size * sample_length_multiplier

    torch.cuda.empty_cache()
    gc.collect()

    augs = torch.nn.Sequential(PadCrop(effective_length, randomize=True),Stereo())
    audio = augs(audio_input).unsqueeze(0).repeat([batch_size, 1, 1])

    t = torch.linspace(0, 1, n_steps + 1, device=device)
    step_list = get_crash_schedule(t)
    step_list = step_list[step_list < noise_level]

    alpha, sigma = t_to_alpha_sigma(step_list[-1])
    noise = torch.randn([batch_size, 2, effective_length], device='cuda')
    noised_audio = audio * alpha + noise * sigma

    return sampling.iplms_sample(model, noised_audio, step_list.flip(0)[:-1], {})

def save_audio(output_path, audio_out, sample_rate):
    try: 
        os.mkdir(output_path)
    except OSError as error: 
        print(error)

    for ix, sample in enumerate(audio_out):
        output_file = f'{output_path}sample #{ix + 1}.wav'
        open(output_file, 'a').close()
        output = sample.cpu()
        torchaudio.save(output_file, output, sample_rate)
        
    print(f'Your samples are waiting for you here: {output_path}')

def set_seed(new_seed):
    if new_seed != -1:
        seed = new_seed
    else:
        seed = torch.seed()
    seed = seed % 4294967295
    seed_everything(seed)
    return seed

#@torch.no_grad()
def main():
    #arguments
    parser = argparse.ArgumentParser()
    parser.add_argument("--ckpt", type = str, default = "models/model.ckpt", help = "path to the model to be used")
    parser.add_argument("--input", type = str, default = '', help = "path to the audio to be used for audio2audio")
    parser.add_argument("--input_sr", type = int, default = 44100, help = "samplerate of the input audio specified in --input")
    parser.add_argument("--noise_level", type = float, default = 0.7, help = "noise level for audio2audio")
    parser.add_argument("--sample_length_multiplier", type = int, default = 1, help = "sample length multiplier for audio2audio")
    parser.add_argument("--out_path", type = str, default = "audio_out/", help = "path to the folder for the samples to be saved in")
    parser.add_argument("--n_steps", type = int, default = 25, help = "number of sampling steps")
    parser.add_argument("--n_samples", type = int, default = 1, help = "how many samples to produce / batch size")
    parser.add_argument("--spc", type = int, default = 65536, help = "the samples per chunk of the model")
    parser.add_argument("--sr", type = int, default = 48000, help = "the samplerate of the model")
    parser.add_argument("--seed", type = int, default = -1, help = "the seed (for reproducible sampling)")
    args = parser.parse_args()

    ckpt_path = args.ckpt
    model_chunk_size = args.spc
    model_sample_rate = args.sr
    inference_n_steps = args.n_steps
    inference_batch_size = args.n_samples
    current_seed = set_seed(args.seed)
    input_path = args.input
    input_sample_rate = args.input_sr
    noise_level = args.noise_level
    sample_length_multiplier = args.sample_length_multiplier
    
    if input_path:
        output_path = f'{args.out_path}/{current_seed}_{inference_n_steps}_{noise_level}/'
    else:
        output_path = f'{args.out_path}/{current_seed}_{inference_n_steps}/'

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    model_ph = create_model(model_chunk_size, model_sample_rate)
    model = load_state_from_checkpoint(device, model_ph, ckpt_path)

    if input_path:
        audio_out = audio2audio(device, model.diffusion_ema, model_chunk_size, inference_batch_size, inference_n_steps, load_to_device(device, input_path, input_sample_rate), noise_level, sample_length_multiplier)
    else:
        audio_out = rand2audio(device, model.diffusion_ema, model_chunk_size, inference_batch_size, inference_n_steps)
    
    save_audio(output_path, audio_out, model_sample_rate)


if __name__ == "__main__":
    main()