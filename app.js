      document.addEventListener("DOMContentLoaded", function () {
        countryList();
      });

      const btn = document.querySelector(".btn-outline-success");

      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const value = document.querySelector("input").value;
        displayCountry(value);
      });

      document.querySelector("#btnLocation").addEventListener("click", ()=>{
        if(navigator.geolocation){
          navigator.geolocation.getCurrentPosition(onSuccess, onError);
          throw new Error();
        }
      })

      function onError(err){
        showLoading();
        document.querySelector("#select-country").innerHTML = "";
        document.querySelector("#border-country").innerHTML = "";
        const selectCard = document.getElementById("selectedCard");
        selectCard.classList.replace("d-block","d-none");
        const borderCard = document.getElementById("borderCard");
        borderCard.classList.replace("d-block","d-none");
        

        const html = `
        <div class="alert alert-danger mt-3">
          Unable to access your location. Please allow location permission and try again !
        </div>
        `;
        setTimeout(() => {
          document.getElementById("errors").innerHTML = "";
        }, 4000);
        document.getElementById("errors").innerHTML = html;
        hideLoading();
      }

      async function onSuccess(position){
        showLoading();
        let lat = position.coords.latitude;
        let lng = position.coords.longitude;

        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}%2C+${lng}&key=15bf9e757ba8444da412ab2884f617d3&language=en`);
        const data = await response.json();
        const country = data.results[0].components.country;
        displayCountry(country);
        hideLoading();
      }

      function countryList(country) {
        showLoading();
        document.querySelector("#country-list-item").innerHTML = "";
        fetch("https://restcountries.com/v3.1/independent?status=true")
          .then((response) => response.json())
          .then((data) => {
            for (let country of data) {
              const html = `
          <div class="col">
          <div class="card bg-card country-list-card" name="${country.name.common}" >
                          <p class="text-center h5 mb-0 text-light list-name">${country.name.common}</p>
                        </div>
                        </div>`;
              document
                .querySelector("#country-list-item")
                .insertAdjacentHTML("beforeend", html);
                const lastItem = document.querySelector("#country-list-item > div:last-child");
                lastItem.classList.add("fade-in");
            }

            document.querySelectorAll(".country-list-card").forEach((card) => {
              card.addEventListener("click", () => {
                const countryName = card.getAttribute("name");
                displayCountry(countryName);
                document.querySelector("input").value = "";
                globalThis.scrollTo({ top: 0, left: 0, behavior: "smooth" });
              });
            });
          })
          .finally(() => {
            hideLoading(); 
          });
      }

      async function displayCountry(country) {
        // -----------------------------------------------------------async & await ---------------------------------------------------------------
        showLoading();
        try {
          const response = await fetch("https://restcountries.com/v3.1/name/" + country + "?fullText=true");
          if(!response.ok)
              throw new Error("Error : Country not found. Try Again !");
          const data = await response.json();
          setCountry(data);
          triggerCardAnimation();
          const countries = data[0].borders;
          if(!countries) 
              throw new Error("This country has no land borders.")
          const response2 = await fetch("https://restcountries.com/v3.1/alpha?codes=" + countries.toString());
          const neighbors = await response2.json();
          borderCountry(neighbors);
        } catch (err) {
          const errorMessage = err.message;
            if(errorMessage =="Error : Country not found. Try Again !"){
              renderError(err);
            }else{
              renderError2(err)
            }
        }  finally {
              hideLoading();
            }


        // -------------------------------------------------------promise & fetch------------------------------------------------------------------
        // showLoading();
        // fetch("https://restcountries.com/v3.1/name/" + country + "?fullText=true")
        //   .then((response) => {
        //     if(!response.ok)
        //       throw new Error("Error : Country not found. Try Again !");
        //     return response.json();
        //   })
        //   .then((data) => {
        //     setCountry(data);
        //     const countries = data[0].borders;
        //     if(!countries) 
        //       throw new Error("This country has no land borders.")
        //     return fetch(
        //       "https://restcountries.com/v3.1/alpha?codes=" + countries.toString()
        //     );
        //   })
        //   .then((response) => response.json())
        //   .then((data) => borderCountry(data))
        //   .catch((err) => {
        //     const errorMessage = err.message;
        //     if(errorMessage =="Error : Country not found. Try Again !"){
        //       renderError(err);
        //     }else{
        //       renderError2(err)
        //     }
        //   })
        //   .finally(() => {
        //     hideLoading();
        //   });

        // -----------------------------------------------------------callback-------------------------------------------------------

        // const request = new XMLHttpRequest();

        // request.open("GET", "https://restcountries.com/v3.1/name/" + country);
        // request.send();

        // request.onload = function () {
        //   console.log(JSON.parse(this.responseText));
        //   const data = JSON.parse(this.responseText);
        //   setCountry(data);

        //   console.log(data[0].borders.toString());
        //   const countries = data[0].borders.toString();
        //   const req = new XMLHttpRequest();
        //   req.open(
        //     "GET",
        //     "https://restcountries.com/v3.1/alpha?codes=" + countries
        //   );
        //   req.send();
        //   req.onload = function () {
        //     const data = JSON.parse(this.responseText);
        //     console.log(data);
        //     borderCountry(data);
        //   };
        // };
      }

      function setCountry(data) {
        const selectCard = document.getElementById("selectedCard");
        selectCard.classList.replace("d-none","d-block");
        const borderCard = document.getElementById("borderCard");
        borderCard.classList.replace("d-block","d-none");


        document.querySelector("#select-country").innerHTML = "";
        for (let country of data) {
          const html = `<div class="row mb-3">
            <div class="col-12 col-xl-4 selected-country">
              <img src="${
                country.flags.png
              }" alt="" class="img-fluid rounded border">
            </div>
            <div class="col-12 col-xl-8">
              <h3 class="card-title fw-bold">${country.name.common}</h3>
              <hr>
              <div class="row">
                <div class="col-xl-2 col-lg-2 col-3 fw-bold">Population : </div>
                <div class="col-xl-3 col-lg-4 col-9">${(country.population / 1000000).toFixed(
                  3
                )} Million</div>
                <div class="col-xl-2 col-lg-2 col-3 fw-bold">Currency : </div>
                <div class="col-xl-5 col-lg-4 col-9">${Object.values(data[0].currencies)[0].name} (${Object.values(data[0].currencies)[0].symbol})</div>
              </div>
              <div class="row">
                <div class="col-xl-2 col-lg-2 col-3 fw-bold">Capital : </div>
                <div class="col-xl-3 col-lg-4 col-9">${country.capital[0]}</div>
                <div class="col-xl-2 col-lg-2 col-3  fw-bold">Time Zones : </div>
                <div class="col-xl-5 col-lg-4 col-9">${country.timezones[0]}</div>
              </div>
              <div class="row">
                <div class="col-xl-2 col-lg-2 col-3 fw-bold">Language : </div>
                <div class="col-xl-3 col-lg-4 col-9">${Object.values(country.languages)}</div>
                <div class="col-xl-2 col-lg-2 col-3 fw-bold"></div>
                <div class="col-xl-5 col-lg-4 col-9"></div>
              </div>
              <div class="row">
                <div class="col-xl-2 col-lg-2 col-3 fw-bold">Region : </div>
                <div class="col-xl-3 col-lg-4 col-9">${country.region}</div>
                 <div class="col-xl-2 col-lg-2 col-3 fw-bold">Map : </div>
                <div class="col-xl-5 col-lg-4 col-9"><a href="${country.maps.googleMaps}" class="btn btn-outline-success" target="_blank">
                    <i class="bi bi-globe-europe-africa"></i>
                  </a></div>
              </div>
            </div>
          </div>`;
          document
            .querySelector("#select-country")
            .insertAdjacentHTML("beforeend", html);
        }
      }

      function borderCountry(data) {
        const borderCard = document.getElementById("borderCard");
        borderCard.classList.replace("d-none","d-block");

        document.querySelector("#border-country").innerHTML = "";
        for (let country of data) {
          const html = `
          <div class="col">
          <div class="card bg-card border-card" data-country="${country.name.common}">
                          <img src="${country.flags.png}" alt="" class="border-img img-fluid rounded m-2">
                          <p class="text-center h5 text-light mt-2">${country.name.common}</p>
                        </div>
                        </div>`;
          document
            .querySelector("#border-country")
            .insertAdjacentHTML("beforeend", html);
        }
        document.querySelectorAll(".border-card").forEach((card) => {
          card.addEventListener("click", () => {
            const countryName = card.getAttribute("data-country");
            displayCountry(countryName);
            document.querySelector("input").value = "";
          });
        });
        
          triggerCardAnimationBD();
      }
    
      function renderError(err){
        document.querySelector("#select-country").innerHTML = "";
        document.querySelector("#border-country").innerHTML = "";
        const selectCard = document.getElementById("selectedCard");
        selectCard.classList.replace("d-block","d-none");
        const borderCard = document.getElementById("borderCard");
        borderCard.classList.replace("d-block","d-none");
        

        const html = `
        <div class="alert alert-danger mt-3">
          ${err.message}
        </div>
        `;
        setTimeout(() => {
          document.getElementById("errors").innerHTML = "";
        }, 3000);
        document.getElementById("errors").innerHTML = html;
      }
      
      function renderError2(err){
       

      document.querySelector("#border-country").innerHTML = ""; 
        
        const html = `
        <div class="alert alert-warning mt-3">
          ${err.message}
        </div>
        `;
        setTimeout(() => {
          document.getElementById("errors").innerHTML = "";
        }, 3000);
        document.getElementById("errors").innerHTML = html;
      }
    
      function showLoading() {
        document.getElementById("loading").classList.replace("d-none", "d-block");
       }

      function hideLoading() {
        document.getElementById("loading").classList.replace("d-block", "d-none");
      }

      function triggerCardAnimation() {
        const card = document.getElementById("selectedCard");
        const borderCard = document.getElementById("borderCard");
        borderCard.classList.remove("animate");
        card.classList.remove("animate");
        void card.offsetWidth;
        card.classList.add("animate");
        borderCard.classList.add("animate");
      }

      function triggerCardAnimationBD() {
        const borderCard = document.getElementById("borderCard");
        borderCard.classList.remove("animate");
        void borderCard.offsetWidth;
        borderCard.classList.add("animate");
      }