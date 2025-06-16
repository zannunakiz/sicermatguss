
// TODO: implement online/offline for each time theres an update from this function
export const handle = (data) => {
    const { device_uuid, status } = data;
    if (typeof window.updateDeviceStatus === 'function') {
        window.updateDeviceStatus(device_uuid, status);
    }
    console.log(`[Update Device Status] Received data: ${JSON.stringify(data)}`);
};