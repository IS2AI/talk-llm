from argparse import ArgumentParser
from torchsummary import summary
from config_parser import get_config
from utils.misc import get_model
import torch
import os


def main(args):
    ######################
    # create model
    ######################
    config = get_config(args.conf)
    model = get_model(config["hparams"]["model"])

    ######################
    # load weights
    ######################
    ckpt = torch.load(args.ckpt, map_location="cpu")
    model.load_state_dict(ckpt["model_state_dict"])
    #print(model)
    summary(model, (1, 40, 98))

    #onnx_path = os.path.join(args.out, "onnx.onnx")
    dummy_input = torch.randn((1, 1, 40, 98))  # replace with input shape of your model
    torch.onnx.export(model, dummy_input, args.out, input_names=["input"], output_names=["output"], dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}}, opset_version=11)
    print(f"Exported the onnx model to {args.out}")


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("--conf", type=str, required=True, help="Path to config file. Will be used only to construct model and process audio.")
    parser.add_argument("--ckpt", type=str, required=True, help="Path to checkpoint file.")
    parser.add_argument("--out", type=str, required=True, help="Path to save the onnx model.")
    
    args = parser.parse_args()

    main(args)