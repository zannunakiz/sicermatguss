
// TODO: implement online/offline for each time theres an update from this function
export const handle = (data) => {
    const { device_uuid, status } = data;
    const paired_devices = JSON.parse(localStorage.getItem("paired_devices"));
    if (paired_devices) {
        paired_devices[device_uuid] = status;
        localStorage.setItem("paired_devices", JSON.stringify(paired_devices));
    }
    console.log(`[Device Status Update] Received data: ${JSON.stringify(data)}`);
};