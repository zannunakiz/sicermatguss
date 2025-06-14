
// TODO: implement online/offline for each time theres an update from this function
export const handle = (data) => {
    const { device_uuid, status } = data;

    
    if (typeof window.pairRequest === 'function') {
        window.pairRequest(device_uuid, status);
    }
    console.log(`[Pair Request] Received data: ${JSON.stringify(data)}`);
};