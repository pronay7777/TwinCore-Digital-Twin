
import math
import time


class BatteryDigitalTwin:
    def __init__(self):
        self.temperature = 30.0
        self.charge = 82.0
        self.current = 4.2
        self.voltage = 48.6
        self.last_update = time.monotonic()

        self.ambient_temperature = 25.0
        self.thermal_gain = 0.025
        self.cooling_rate = 0.08
        self.capacity_ah = 50.0

    def update(self):
        now = time.monotonic()
        dt = min(now - self.last_update, 2.0)
        self.last_update = now

        self.current = 4.2 + 0.8 * math.sin(now / 8.0)

        self.charge = max(
            0.0,
            self.charge
            - (self.current * dt / 3600.0)
            / self.capacity_ah * 100.0
        )

        heat_generated = self.thermal_gain * self.current**2
        heat_lost = self.cooling_rate * (
            self.temperature - self.ambient_temperature
        )

        self.temperature += (
            (heat_generated - heat_lost) * dt / 10.0
        )

        self.voltage = (
            42.0 + 0.08 * self.charge - 0.05 * self.current
        )

        status = (
            "WARNING"
            if self.temperature >= 40.0 or self.charge <= 15.0
            else "NORMAL"
        )

        return {
            "temperature": round(self.temperature, 2),
            "voltage": round(self.voltage, 2),
            "current": round(self.current, 2),
            "charge": round(self.charge, 2),
            "ambient_temperature": self.ambient_temperature,
            "status": status,
            "simulation_time": round(now, 2),
            "data_source": "Python battery simulation",
        }


battery_twin = BatteryDigitalTwin()
