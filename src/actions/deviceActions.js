import { getToken } from "./creds";

export async function pairDevice(deviceData) {
   const res = await fetch(`${process.env.REACT_APP_API}/device/pair`, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(deviceData),
   });

   if (res.ok) {
      return true
   } else {
      return false
   }
}

export async function assignWifi(wifiData) {
   const res = await fetch(`${process.env.REACT_APP_API}/device/assign-wifi`, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(wifiData),
   });


   if (res.ok) {
      return true
   } else {
      return false
   }
}

export async function getDevices() {
   const token = getToken()
   const res = await fetch(`${process.env.REACT_APP_API}/device/get-devices`, {
      method: 'GET',
      headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`,
      },
   });


   const { content } = await res.json()

   if (res.ok) {
      return {
         success: true,
         devices: content.devices
      }
   }
   else {
      return {
         success: false
      }
   }
}

export async function updateDeviceName(deviceData) {
   const res = await fetch(`${process.env.REACT_APP_API}/device/update-device`, {
      method: 'PUT',
      headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(deviceData),
   });

   if (res.ok) {
      return true
   } else {
      return false
   }
}

export async function getHistoryData(){
   const res = await fetch(`${process.env.REACT_APP_API}/get-history`, {
      method: 'GET',
      headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${getToken()}`,
      }, 
   });
   if (res.ok){
      return res.data.content
   }else{
      return false
   }
}