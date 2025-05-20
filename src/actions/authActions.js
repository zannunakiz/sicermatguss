import { saveCredentials, saveToken } from "./creds";

export async function authSignIn(userData) {
   const res = await fetch(`${process.env.REACT_APP_API}/auth/login`, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
   });

   const { content } = await res.json()

   if (res.ok) {
      await saveCredentials(content.user_data);
      await saveToken(content.token);
      return true
   } else {
      return false
   }
}

export async function authSignUp(userData) {
   const res = await fetch(`${process.env.REACT_APP_API}/auth/register`, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
   });

   if (res.ok) {
      return true
   } else {
      return false
   }
}

export async function changePassword(passwordData) {
   const res = await fetch(`${process.env.REACT_APP_API}/auth/change-password`, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
      },
      body: JSON.stringify(passwordData),
   });

   if (res.ok) {
      return true
   } else {
      return false
   }
}