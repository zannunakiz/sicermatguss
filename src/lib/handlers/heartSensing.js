export const handle = (data) => {
    const { user_uuid, sport_type, heart_rate, spo2, status } = data;

    
    if (typeof window.heartController === 'function') {
        console.log(`[Heart Controller] Received data: ${JSON.stringify(data)}`);
        window.heartController({user_uuid, sport_type, heart_rate, spo2, status});
    }
    
};