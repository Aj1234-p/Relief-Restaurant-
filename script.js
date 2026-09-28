const menuContainer = document.querySelector(".menu-container");
const foodItem = document.querySelector(".food-item");

function getFoodImage(query) {
  let CACHE_KEY = `unsplash_img_${query}`;
  let cached = null;
  try{
    cached = JSON.parse(localStorage.getItem(CACHE_KEY))
  }
  catch{
    cached = null;
  }
  if(cached && cached.url){
      return Promise.resolve(cached.url);
  }
  const accessKey = "XsDsb-k7BsAOoaXPXrVA-juT00YhU5OwkRe1KoZeFBg";
  return fetch(
    `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&client_id=${accessKey}`,
  )
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      const url = data.urls?.regular || null;
      if(url){
        try{
          localStorage.setItem(CACHE_KEY,JSON.stringify({url,timestamp: Date.now()}));
        } catch(err){
          console.warn("Could not cache image:", err.message);
        }
      }
      return url;
    })
    .catch((err) => {
      console.error(`Failed to get image for "${query}":`, err.message);
      return null;
    });
}

function getMenu() {
  let pizza = [];
  return new Promise((resolve, reject) => {
    fetch("./pizzaMenu.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP Status ${response.status}`);
        }
        console.log("Response comes from the server!");
        return response.json();
      })
      .then((data) => {
        pizza = data;
        for (const item of pizza) {
          let imgUrl;
          getFoodImage(item.name)
            .then((data) => {
              imgUrl = data;
              return imgUrl;
            })
            .then((imgUrl) => {
              let card = document.createElement("div");
              card.classList.add("card");
              let imageContainer = document.createElement("div");
              imageContainer.classList.add("image-container");
              let img = document.createElement("img");
              img.classList.add("food-image");
              img.src = imgUrl || "https://placehold.co/400x300?text=No+Image";
              img.onerror = () => {
                img.src = "https://placehold.co/400x300?text=No+Image";
              };
              imageContainer.appendChild(img);
              let descriptionContainer = document.createElement("div");
              descriptionContainer.classList.add("description");
              let foodDetails = document.createElement("div");
              foodDetails.classList.add("food-details");
              let foodName = document.createElement("span");
              foodName.textContent = `${item.name}`;
              let foodPrice = document.createElement("span");
              foodPrice.textContent = `$ ${item.price}`;

              foodDetails.appendChild(foodName);
              foodDetails.appendChild(foodPrice);
              descriptionContainer.appendChild(foodDetails);
              let moreFood = document.createElement("div");
              moreFood.classList.add("add-food");
              moreFood.innerHTML = `<i class="fa-solid fa-square-plus"></i>`;
              descriptionContainer.appendChild(moreFood);
              card.appendChild(imageContainer);
              card.appendChild(descriptionContainer);
              foodItem.appendChild(card);
            });
        }
        resolve(pizza);
      })
      .catch((err) => {
        console.log("Failed to fetch error: ", err);
      });
  });
}

function TakeOrder(pizza) {
  let order = {};
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      for (let i = 1; i <= 3; i++) {
        let ID = crypto.randomUUID();
        order[ID] = pizza[Math.floor(Math.random() * 25)];
      }
      resolve(order);
    }, 2500);
  });
}

function orderPrep(order) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      order["order_status"] = true;
      order["paid"] = false;
      resolve(order);
    }, 1500);
  });
}

function payOrder(order) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      order.paid = true;
      resolve(order);
    }, 1000);
  });
}

function thankyouFnc(order) {
  alert("Thank you for eating with us today!");
  return;
}

getMenu()
  .then((data) => {
    return TakeOrder(data);
  })
  .then((data) => {
    return orderPrep(data);
  })
  .then((data) => {
    return payOrder(data);
  })
  .then((data) => {
    if (data.paid === true) return thankyouFnc(data);
  })
  .catch((err) => {
    console.log(err);
  });
