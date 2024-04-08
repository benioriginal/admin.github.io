import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js'; // Import auth module
import { getDatabase, ref as dbRef, set, get, update, remove } from 'https://www.gstatic.com/firebasejs/10.10.0/firebase-database.js';
const firebaseConfig = {
    apiKey: "AIzaSyCp6_PsJxlQaAaF04J18RTNDdrac_rPEJA",
    authDomain: "playground-4bbad.firebaseapp.com",
    databaseURL: "https://playground-4bbad-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "playground-4bbad",
    storageBucket: "playground-4bbad.appspot.com",
    messagingSenderId: "292222200783",
    appId: "1:292222200783:web:8fe0eef41ee8d4e7f840ba"
  };
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const main = document.getElementById("main")
const registerForm = document.getElementById("login-form"); 

const adsRef = dbRef(db, 'Ads');
const addAd = document.getElementById("Addd")
const exit = document.getElementById("exit")
      
const AdButtonAdd = document.getElementById("Add")
AdButtonAdd.addEventListener("click", function(){
    addAd.style.display = 'block'
    console.log(1)
})
exit.addEventListener("click", function(){
    addAd.style.display = 'none'

    console.log(1)
})
addAd.style.display = 'none'
const storage = getStorage(app);
get(adsRef)
  .then((snapshot) => {
    if (snapshot.exists()) {
      const ads = snapshot.val();

      for (const ad in ads) {
        const main = document.getElementById('main')

        const adDiv = document.createElement('div');
        adDiv.className = 'ad';
        adDiv.innerHTML = `
          <button class="options-button">...</button>
          <div class="options" style="display: none;">
            <input type="text" id="username" placeholder="Enter username">
            <input type="password" id="password" placeholder="Enter password">
            <button class="toggle-vandut">Toggle Vandut</button>
            <button class="delete-ad">Delete Ad</button>
          </div>
          <img src="${ads[ad].imagini[0]}" alt="" />
          <p>${ad}</p>
          <h1>${ads[ad].pret} Lei</h1>
          <p class="date">${ads[ad].Data}</p>
          <h1 class="${ads[ad].vandut ? 'vandut' : 'nevandut'}">${ads[ad].vandut ? 'VANDUT' : 'NEVANDUT'}</h1>
        `;

        const optionsButton = adDiv.querySelector('.options-button');
        const optionsDiv = adDiv.querySelector('.options');
        const toggleVandutButton = optionsDiv.querySelector('.toggle-vandut');
        const deleteAdButton = optionsDiv.querySelector('.delete-ad');
        const usernameInput = optionsDiv.querySelector('#username');
        const passwordInput = optionsDiv.querySelector('#password');

        optionsButton.addEventListener('click', () => {
          optionsDiv.style.display = optionsDiv.style.display === 'none' ? 'block' : 'none';
        });

        toggleVandutButton.addEventListener('click', async () => {
          const username = usernameInput.value;
          const password = passwordInput.value;

          try {
            const userCredential = await signInWithEmailAndPassword(auth, username + '@example.com', password);
            const user = userCredential.user;

            if (user) {
              ads[ad].vandut = !ads[ad].vandut;
              const adRef = dbRef(db, 'Ads/' + ad);
              update(adRef, { vandut: ads[ad].vandut });
              location.reload();
            }
          } catch (error) {
            alert('Invalid username or password', error);
          }
        });

        deleteAdButton.addEventListener('click', async () => {
          const username = usernameInput.value;
          const password = passwordInput.value;

          try {
            const userCredential = await signInWithEmailAndPassword(auth, username + '@example.com', password);
            const user = userCredential.user;

            if (user) {
              const adRef = dbRef(db, 'Ads/' + ad);
              remove(adRef);
              const adStorageRef = storageRef(storage, 'Ads/' + ad + "/");
              deleteObject(adStorageRef);
              main.removeChild(adDiv);
              location.refresh()
            }
          } catch (error) {
            alert('Invalid username or password', error);
          }
        });

        main.appendChild(adDiv);
      }
    } else {
      console.log("No data available");
    }
  })
  .catch((error) => {
    console.error(error);
  });



  document.getElementById('adForm').addEventListener('submit', async function(event) {
    event.preventDefault();
  
    const email = `${event.target.username.value}@example.com`;
    const password = event.target.password.value;
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Place your code here
      const images = document.getElementById('images').files;
      const title = document.getElementById('title').value;
      const price = document.getElementById('price').value;
  
      const date = new Date().toISOString().substr(0, 10);
  
      const phoneNumber = document.getElementById('phoneNumber').value;
  
      const vandut = false;
  
      const description = document.getElementById('description').value;
      const newAd = {
        imagini: [], 
        pret: price,
        Data: date,
        tel: phoneNumber,
        Vandut: vandut,
        desc: description
      };
  
      const storage = getStorage(app);
  
      Array.from(images).forEach((image, index) => {
        const imageStorageRef = storageRef(storage, 'Ads/' + title + '/imagini/' + image.name);
  
        const uploadTask = uploadBytesResumable(imageStorageRef, image);
  
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
          },
          (error) => {
            console.error('Upload failed:', error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              console.log('File available at', downloadURL);
  
              newAd.imagini.push(downloadURL);
              
              if (newAd.imagini.length === images.length) {
                const newAdDbRef = dbRef(db, 'Ads/' + title);
                set(newAdDbRef, newAd)
                  .then(() => {
                    location.reload();
                    console.log('New ad created successfully.');
                  })
                  .catch((error) => {
                    console.error('Failed to create new ad:', error);
                  });
              }
            });
          }
        );
      });
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error signing in:", errorCode, errorMessage);
      if (errorCode == 'auth/invalid-credential'){
          alert("Verifica parola sau username ul si incearca iar")
        return;
      }
    }
  });
  
