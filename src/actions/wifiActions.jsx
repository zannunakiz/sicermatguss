import { getToken } from "./creds";

export async function getWifi() {
   const token = getToken()
   const res = await fetch(`${process.env.REACT_APP_API}/device/get-wifi`, {
      method: 'GET',
      headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`,
      },
   });


   const { content } = await res.json()
   console.log(content)

   if (res.ok) {
      return {
         success: true,
         wifi: content.wifi
      }
   }
   else {
      console.log(res.message)
      return {
         success: false,
      }
   }
}


export async function updateWifi(data) {
   const token = getToken()
   const res = await fetch(`${process.env.REACT_APP_API}/device/update-wifi`, {
      method: 'PUT',
      headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
   });

   if (res.ok) {
      return true
   } else {
      console.log(res.message)
      return false
   }
}


export async function assignWifi(data) {
   const token = getToken()
   const res = await fetch(`${process.env.REACT_APP_API}/device/assign-wifi`, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
   });

   if (res.ok) {
      return true
   } else {
      console.log(res.message)
      return false
   }
}

export async function deleteWifi(wifiId) {
   const token = getToken()
   const res = await fetch(`${process.env.REACT_APP_API}/device/delete-wifi/${wifiId}`, {
      method: 'DELETE',
      headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`,
      },
   });

   if (res.ok) {
      return true
   } else {
      console.log(res.message)
      return false
   }
}