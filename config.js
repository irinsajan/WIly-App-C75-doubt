import firebase from 'firebase/app';
require("@firebase/firestore")

const firebaseConfig = {
    apiKey: "AIzaSyD6sdt8eCWBzkhtf5b8_0GPYU2VU7DGpWE",
    authDomain: "wily-app-307a6.firebaseapp.com",
    projectId: "wily-app-307a6",
    storageBucket: "wily-app-307a6.appspot.com",
    messagingSenderId: "337477910109",
    appId: "1:337477910109:web:39ea57fa8e8c461e8497b4"
  };

  if(!firebase.apps.length){
    firebase.initializeApp(firebaseConfig);
  }
  export default firebase.firestore();