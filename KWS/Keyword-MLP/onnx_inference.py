"""Run inference on short ~1s clips, like the ones in the Speech Commands dataset."""

from argparse import ArgumentParser
from config_parser import get_config
import onnx
import onnxruntime
from torch.utils.data import DataLoader
from utils.dataset import GoogleSpeechDataset
import os
import glob
import json

def main(args):
    ######################
    # create model
    ######################
    config = get_config(args.conf)
    
    ######################
    # setup data
    ######################
    if os.path.isdir(args.inp):
        data_list = glob.glob(os.path.join(args.inp, "*.wav"))
    elif os.path.isfile(args.inp):
        data_list = [args.inp]

    dataset = GoogleSpeechDataset(
        data_list=data_list,
        label_map=None,
        audio_settings=config["hparams"]["audio"],
        aug_settings=None,
        cache=0
    )

    dataloader = DataLoader(dataset, batch_size=args.batch_size, shuffle=False)
    
    if args.lmap:
        with open(args.lmap, "r") as f:
            label_map = json.load(f)
    
    ######################
    # check the ONNX model
    ######################
    onnx_model = onnx.load(args.onnx_model)
    onnx.checker.check_model(onnx_model)

    ######################
    # run inference
    ######################
    ort_session = onnxruntime.InferenceSession(args.onnx_model)
    tp = 0
    for data in dataloader:
        data = data.cpu().numpy()
        #print(type(data), data.shape)
        ort_inputs = {"input": data}
        ort_outs = ort_session.run(None, ort_inputs)
        #print(ort_outs)
        pred = ort_outs[0].argmax(1).ravel().tolist()
        pred = label_map[str(pred[0])]
        print(pred)
        if pred == "issai":
            tp += 1
    
    print(tp)


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("--onnx_model", type=str, required=True, help="Path to an onnx model.")
    parser.add_argument("--conf", type=str, required=True, help="Path to config file. Will be used only to construct model and process audio.")
    parser.add_argument("--inp", type=str, required=True, help="Path to input. Can be a path to a .wav file, or a path to a folder containing .wav files.")
    #parser.add_argument("--out", type=str, default="./", help="Path to output folder. Predictions will be stored in {out}/preds.json.")
    parser.add_argument("--lmap", type=str, default=None, help="Path to label_map.json. If not provided, will save predictions as class indices instead of class names.")
    parser.add_argument("--device", type=str, default="auto", help="One of auto, cpu, or cuda.")
    parser.add_argument("--batch_size", type=int, default=1, help="Batch size for batch inference.")
    
    args = parser.parse_args()

    assert os.path.exists(args.inp), f"Could not find input {args.inp}"

    main(args)