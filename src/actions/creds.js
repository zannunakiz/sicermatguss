//Token Handlers
export async function saveToken(token) {
   localStorage.setItem('token', token);
}

export async function getToken() {
   return localStorage.getItem('token');
}


//Credentials Handlers
export async function saveCredentials(credentials) {
   localStorage.setItem('credentials', JSON.stringify(credentials));
}

export async function getCredentials() {
   return JSON.parse(localStorage.getItem('credentials'));
}



//Auth Handlers
export async function addAuth(token, credentials) {
   saveToken(token);
   saveCredentials(credentials);
}

export async function removeAuth() {
   localStorage.removeItem('credentials');
   localStorage.removeItem('token');
}

export async function checkAuth() {
   return getCredentials() !== null && getToken() !== null
}