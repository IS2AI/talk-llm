## A Custom Keyword Spotting (KWS) Model Development

### Synthetic Data Generation 
We employed [Piper](https://github.com/rhasspy/piper)'s English text-to-speech (TTS) models to generate synthetic speech commands. In total, we used 1,917 TTS models with US and British accents. 
To generate a synhtetic dataset for your custom keyword, first download the TTS models from [Google Drive](https://drive.google.com/drive/folders/1dOF5m9ZboVGJc52ThFnYUTftcmyT8nYF?usp=sharing). Then, open ```generate_synthetic_data.ipynb``` notebook, insert your keyword, and run all cells. 

### Model Training
In this work, we employed the [Keyword-MLP](https://github.com/AI-Research-BD/Keyword-MLP) keyword spotting model. We thank the authors for open-sourcing their code. 

#### Setup

```
git clone https://github.com/AI-Research-BD/Keyword-MLP.git
cd Keyword-MLP
pip3 install -r requirements.txt
```

#### Dataset
To increase the dataset by adding background noise signals, download the [ESC-50 dataset](https://github.com/karolpiczak/ESC-50), open ```augment_synthetic_data.ipynb``` and run all cells. 

#### Training
```
python3 train.py --conf configs/kwmlp_issai_s.yaml
```

#### PyTorch to ONNX 
```
python3 convert_to_onnx.py --conf configs/kwmlp_issai_s.yaml \
                           --ckpt checkpoints/kwmlp_issai_small.pth \
                           --out checkpoints/issai_small.onnx
```
### Inference

#### PyTorch 

You can use the pre-trained model (or a model you trained) for inference, using the two scripts:

- `inference.py`: For short ~1s clips, like the audios in the Speech Commands dataset
- `window_inference.py`: For running inference on longer audio clips, where multiple keywords may be present. Runs inference on the audio in a sliding window manner.

```
python3 inference.py --conf configs/kwmlp_issai_s.yaml \
                    --ckpt checkpoints/issai_small.pth \
                    --inp <path to audio.wav / path to audio folder> \
                    --out <output directory> \
                    --lmap data_issai/label_map.json \
                    --device cpu \
                    --batch_size 8   # should be possible to use much larger batches if necessary, like 128, 256, 512 etc.

python3 window_inference.py --conf configs/kwmlp_issai_s.yaml \
                    --ckpt checkpoints/issai_small.pth \
                    --inp <path to audio.wav / path to audio folder> \
                    --out <output directory> \
                    --lmap data_issai/label_map.json \
                    --device cpu \
                    --wlen 1 \
                    --stride 0.5 \
                    --thresh 0.85 \
                    --mode multi
```
#### ONNX 
```
python3 onnx_inference.py --onnx_model checkpoints/issai_small.onnx \
                          --conf configs/kwmlp_issai_s.yaml \
                          --lmap data_issai/label_map.json \
                          --inp <path to audio.wav / path to audio folder>
```

### Pretrained Checkpoints (PTH, ONNX)

| Model Name | # Params | Accuracy |
| ---------- | -------- |---------------- |
| [KW-MLP-Small](https://github.com/IS2AI/talk-llm/tree/main/KWS/Keyword-MLP/checkpoints)|   ~34K  | 99.53%|
