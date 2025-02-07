"""
Wifi Connection Status Characteristic
"""

import json
import dbus
from .dbus_interface.dbus_bluez_interface import Characteristic
from .dbus_interface.dbus_bluez_names import BLUEZ_GATT_CHARACTERISTIC

class EyeSpyConnStatusCharacteristic(Characteristic):
    """
    Sends notifications of the format:
    {
        "State": Value according to networking.wifi_manager.DeviceState
        "Reason": Value from NetworkManager which corresponds to NMDeviceStateReason
    }
    """

    EYESPY_CONN_UUID = "136670fb-f95b-4ee8-bc3b-81eadb234268"

    def __init__(self, **kwargs):
        Characteristic.__init__(
            self,
            service = kwargs["service"],
            bus     = kwargs["bus"],
            uuid    = self.EYESPY_CONN_UUID,
            flags   = ['notify'],
            index   = kwargs["index"]
        )
        self.is_notifying = False
        kwargs["wifi_manager"].register_wifi_state_callback(self._state_change_callback)

    def _state_change_callback(self, new_state, new_reason):
        """
        This will send notifications to the phone when the NetworkManager state changes
        """

        if not self.is_notifying:
            return

        json_bytes = json.dumps({
            "State": new_state.value,
            "Reason": new_reason.value
        }).encode("ascii")
        new_value = dbus.ByteArray(json_bytes)

        changed = dbus.Dictionary({ 'Value': new_value }, signature='sv')
        self.PropertiesChanged(BLUEZ_GATT_CHARACTERISTIC, changed, [])

    def StartNotify(self):
        print("Start notification")
        self.is_notifying = True

    def StopNotify(self):
        print("Stop notification")
        self.is_notifying = False
