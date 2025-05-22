//Token Handlers
export function saveToken(token) {
   localStorage.setItem('token', token);
}

export function getToken() {
   const token = localStorage.getItem('token');
   if (token) {
      return token
   }
   return null
}


//Credentials Handlers
export function saveCredentials(credentials) {
   localStorage.setItem('credentials', JSON.stringify(credentials));
}

export function getCredentials() {
   const cred = JSON.parse(localStorage.getItem('credentials'));
   return cred
}



//Auth Handlers
export function addAuth(token, credentials) {
   saveToken(token);
   saveCredentials(credentials);
}

export function removeAuth() {
   localStorage.removeItem('token');
   localStorage.removeItem('credentials');
   localStorage.removeItem('device');
}

export function checkAuth() {
   const token = getToken()
   const credentials = getCredentials()

   if (token && credentials) {
      return true
   }
   else {
      return false
   }
}