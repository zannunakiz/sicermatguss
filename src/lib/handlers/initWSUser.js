
// TODO: implement online/offline for each time theres an update from this function
export const handle = (data) => {
    localStorage.setItem("paired_devices", JSON.stringify(data));
    console.log(`[Init WS User] Received data: ${JSON.stringify(data)}`);
};