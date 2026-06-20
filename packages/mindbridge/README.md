# MindBridge prototype package

Public-safe scaffold for the MindBridge EEG-to-command pipeline.

This is not medical software and is not a validated BCI decoder. It is a small code package that documents the intended system boundary:

1. Read a short EEG/EMG signal window.
2. Extract lightweight signal features.
3. Decode an intent label.
4. Plan a robot, writing, or environment command.
5. Return a structured command packet for a downstream controller.

The real research path should replace the simple feature extractor and linear decoder with the project's FBCSP, SSVEP, motor-imagery, or microstate models.

## Example

```python
from mindbridge import EEGWindow, MindBridgePipeline

window = EEGWindow(
    samples={
        "O1": [0.1, 0.2, 0.18, 0.16],
        "O2": [0.08, 0.19, 0.2, 0.15],
    },
    sampling_rate=128,
)

result = MindBridgePipeline.default().run(window)
print(result["intent"], result["command"])
```

