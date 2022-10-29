
import { BleError, Characteristic, Device } from 'react-native-ble-plx';
import NetInfo from '@react-native-community/netinfo';
import * as EyeSpyUUID from '../../config/BLEConfig';

/**
 * This file includes all of the camera bluetooth services that the mobile app
 * will need to connect to.  
 */

interface CameraSerial {
    Serial: string;
    PubKey: string; 
}

/**
 * getCameraSerialFromBLE will read the Eyespy Serial
 * @param device 
 * @returns Returns camera serial and BLE
 */
export async function getCameraSerialFromBLE (device: Device): CameraSerial {
// Get EyeSpy serial characteristic
    try {
        const deviceDiscovered = await device.discoverAllServicesAndCharacteristics();
        const characteristic: Characteristic = (await deviceDiscovered.readCharacteristicForService(EyeSpyUUID.BLE_SERVICE_UUID, EyeSpyUUID.SERIAL_UUID));
        
        if(!characteristic.value)
            throw new Error("ERROR: No value in characteristic!");

        const serialValues = JSON.parse(window.atob(characteristic.value));

        if(!serialValues.Serial || !serialValues.PubKey)
            throw new Error("ERROR: No serial value!");
        
        // Get characteristic values (Serial values)
        const {Serial, PubKey} = serialValues;
        return {
            Serial,
            PubKey
        }
    }
    catch (error) {
        console.log('NO DEVICE CONNECTED', error);
        throw error
    }
}

/**
 * This method will write to the write to EyeSpy Wifi to write
 * @param device 
 */
export async function writeCameraWifi (device: Device, password: string, cameraUUID: string): Promise<void> {
    try {
        const deviceDiscovered = await device.discoverAllServicesAndCharacteristics();                

        const networkState = await NetInfo.fetch();

        if(!networkState.details?.ssid)
            throw new Error("ERROR: SSID Could not be found. Make sure location permissions are turned on!")

        const wifiDetails = {
            "SSID": networkState.details?.ssid,
            "User": "TestUSER",
            "Pass": "TestPASS",
            "UUID": cameraUUID
        }
        const base64WifiDetails = window.btoa(JSON.stringify(wifiDetails));
        console.log(JSON.stringify(wifiDetails));
        console.log(wifiDetails);
        console.log(base64WifiDetails);
        console.log(await deviceDiscovered.writeCharacteristicWithResponseForService(EyeSpyUUID.BLE_SERVICE_UUID, EyeSpyUUID.WIFI_UUID, base64WifiDetails));
    }
    catch(error) {
        console.log('Error in writeCameraWifi()', error);
    }
}

export async function checkWifiType (device: Device): Promise<string> {
    try {
        const deviceDiscovered = await device.discoverAllServicesAndCharacteristics();
        const networkState = await NetInfo.fetch();
        if(!networkState.details?.ssid)
            throw new Error("ERROR: SSID Could not be found. Make sure location permissions are turned on!");
        const bleSendSSID = {
            "SSID": networkState.details?.ssid
        }        
        const base64SSID = window.btoa(JSON.stringify(bleSendSSID));
        deviceDiscovered.writeCharacteristicWithResponseForService(EyeSpyUUID.BLE_SERVICE_UUID, EyeSpyUUID.WIFI_CHECK_UUID, base64SSID);
        
        // After writing, we should read the characteristic
        const checkChar = await deviceDiscovered.readCharacteristicForService(EyeSpyUUID.BLE_SERVICE_UUID, EyeSpyUUID.WIFI_CHECK_UUID);

        console.log(checkChar);

        if(!checkChar.value)
            throw new Error("ERROR: No value in checkChar.value in checkWifiType()!")
        console.log(checkChar);
        return checkChar.value;
    } catch (error) {
        console.log('Error in checkWifiType(): ', error);
        throw error;
    }
}



/**
 * This method will check the EyeSpy Connection notification.  It will say
 * if the camera has connected to the wifi connection or not.
 * @param device 
 */
export async function checkCameraNotification(device: Device, onCameraNotificationUpdate: (error: BleError | null, characteristic: Characteristic | null) => Promise<void>): Promise<void> {

    const deviceDiscovered = await device.discoverAllServicesAndCharacteristics();
    console.log(await deviceDiscovered.monitorCharacteristicForService(EyeSpyUUID.BLE_SERVICE_UUID, EyeSpyUUID.CONNECTION_UUID, onCameraNotificationUpdate));
}

export async function cameraListener(error: BleError | null, characteristic: Characteristic | null) {
    console.log(characteristic);
    if (error) {
    console.error(error);
      return;
    }
    if (characteristic?.value) {
        console.error('No Characteristic Found');
    }
    console.log("NOTIFICATION");
    console.log(characteristic);
  }