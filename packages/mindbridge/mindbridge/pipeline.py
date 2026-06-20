from __future__ import annotations

from dataclasses import dataclass
from math import cos, pi, sin, sqrt
from typing import Mapping, Sequence


@dataclass(frozen=True)
class EEGWindow:
    samples: Mapping[str, Sequence[float]]
    sampling_rate: int


class SignalFeatureExtractor:
    bands = {
        "theta": (4.0, 7.0),
        "alpha": (8.0, 12.0),
        "beta": (13.0, 30.0),
    }

    def extract(self, window: EEGWindow) -> dict[str, float]:
        values: list[float] = []
        band_values: dict[str, list[float]] = {band_name: [] for band_name in self.bands}
        for channel, samples in window.samples.items():
            cleaned = [float(value) for value in samples]
            if not cleaned:
                continue
            rms = sqrt(sum(value * value for value in cleaned) / len(cleaned))
            values.append(rms)
            for band_name, band in self.bands.items():
                center_frequency = sum(band) / 2.0
                power = self._goertzel_power(cleaned, window.sampling_rate, center_frequency)
                values.append(power)
                band_values[band_name].append(power)

        mean_energy = sum(values) / max(len(values), 1)
        alpha = self._band_average(band_values["alpha"])
        beta = self._band_average(band_values["beta"])
        theta = self._band_average(band_values["theta"])
        return {
            "mean_energy": mean_energy,
            "alpha_beta_ratio": alpha / max(beta, 1e-9),
            "theta_alpha_ratio": theta / max(alpha, 1e-9),
            "channel_count": float(len(window.samples)),
        }

    @staticmethod
    def _band_average(values: Sequence[float]) -> float:
        return sum(values) / max(len(values), 1)

    @staticmethod
    def _goertzel_power(samples: Sequence[float], sampling_rate: int, frequency: float) -> float:
        normalized = frequency / max(sampling_rate, 1)
        coeff = 2.0 * cos(2.0 * pi * normalized)
        q0 = q1 = q2 = 0.0
        for sample in samples:
            q0 = coeff * q1 - q2 + sample
            q2 = q1
            q1 = q0
        real = q1 - q2 * cos(2.0 * pi * normalized)
        imag = q2 * sin(2.0 * pi * normalized)
        return real * real + imag * imag


class IntentDecoder:
    def __init__(self, weights: Mapping[str, Mapping[str, float]]) -> None:
        self.weights = weights

    @classmethod
    def default(cls) -> IntentDecoder:
        return cls(
            {
                "idle": {"mean_energy": -0.2, "alpha_beta_ratio": 0.5},
                "write": {"mean_energy": 0.2, "theta_alpha_ratio": 0.5},
                "select": {"alpha_beta_ratio": 0.8, "channel_count": 0.05},
                "robot_reach": {"mean_energy": 0.45, "alpha_beta_ratio": -0.2},
            }
        )

    def predict(self, features: Mapping[str, float]) -> tuple[str, float]:
        scored = []
        for label, label_weights in self.weights.items():
            score = sum(features.get(name, 0.0) * weight for name, weight in label_weights.items())
            scored.append((label, score))
        label, score = max(scored, key=lambda item: item[1])
        confidence = 1.0 / (1.0 + pow(2.718281828, -score))
        return label, confidence


class CommandPlanner:
    command_map = {
        "idle": {"type": "system.idle", "payload": {"hold": True}},
        "write": {"type": "writer.stroke", "payload": {"mode": "assistive_text"}},
        "select": {"type": "ui.select", "payload": {"target": "focused_option"}},
        "robot_reach": {"type": "robot.arm.reach", "payload": {"frame": "relative", "x": 0.12, "y": 0.0, "z": 0.08}},
    }

    def plan(self, intent: str, confidence: float) -> dict[str, object]:
        command = dict(self.command_map.get(intent, self.command_map["idle"]))
        command["confidence"] = round(confidence, 4)
        command["source"] = "mindbridge-prototype"
        return command


class MindBridgePipeline:
    def __init__(
        self,
        extractor: SignalFeatureExtractor,
        decoder: IntentDecoder,
        planner: CommandPlanner,
    ) -> None:
        self.extractor = extractor
        self.decoder = decoder
        self.planner = planner

    @classmethod
    def default(cls) -> MindBridgePipeline:
        return cls(SignalFeatureExtractor(), IntentDecoder.default(), CommandPlanner())

    def run(self, window: EEGWindow) -> dict[str, object]:
        features = self.extractor.extract(window)
        intent, confidence = self.decoder.predict(features)
        command = self.planner.plan(intent, confidence)
        return {
            "intent": intent,
            "confidence": confidence,
            "features": features,
            "command": command,
        }
