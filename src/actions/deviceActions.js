import { getToken } from "./creds";

export async function pairDevice(ssidData) {
   const res = await fetch(`${process.env.REACT_APP_API}/device/pair`, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(ssidData),
   });

   if (res.ok) {
      return true
   } else {
      return false
   }
}