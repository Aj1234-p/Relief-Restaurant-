# Relief Restaurant Menu

A restaurant menu web app that loads food items from a JSON file, lets the user search them, and simulates the full ordering flow (take order, prepare, pay, thank you) using JavaScript promises.

Built with HTML, CSS and vanilla JavaScript. Food photos come from the Unsplash API.

Live Link:  `https://aj1234-p.github.io/Relief-Restaurant-/`

## Layout

The page has two columns, and each one scrolls independently.

```
+-------------+--------------------------------------+
|   Logo      |  Banner                              |
|   Relief    |--------------------------------------|
|             |  Search                (sticky)      |
|  Home       |--------------------------------------|
|  Menu       |  [Food] [Food] [Food]                |
|  Your Order |  [Food] [Food] [Food]                |
|  About      |  [Food] [Food] [Food]                |
|  Contact    |                                      |
+-------------+--------------------------------------+
   column 1                 column 2
```

- **Column 1:** logo, restaurant name, slogan and navigation links.
- **Column 2:** banner, search bar and the food cards.

## Features

- Load the menu from a JSON file with `fetch`
- Live search by food name or category
- Food photos from the Unsplash API, cached in `localStorage`
- Simulated order flow built on promises
- Two columns that scroll independently

## Tasks

| # | Task | Function | Behaviour |
|---|------|----------|-----------|
| 1 | Get Menu | `getMenu()` | Fetches food items from the JSON file and displays them |
| 2 | Take Order | `TakeOrder()` | Returns a promise, resolves after **2500 ms**, adds **3 random burgers** to the order object |
| 3 | Order Preparation | `orderPrep()` | Returns a promise, resolves after **1500 ms**, the chef is preparing the order |
| 4 | Pay Order | `payOrder()` | Returns a promise, resolves after **1000 ms**, the order is paid |
| 5 | Thank You | `thankyouFnc()` | Shows a thank you message once the order is paid |

The order flow runs in sequence:

```
TakeOrder()  ->  orderPrep()  ->  payOrder()  ->  thankyouFnc()
  2500 ms          1500 ms          1000 ms
```

## Tech stack

- HTML5
- CSS3 (Grid, Flexbox, `position: sticky`)
- JavaScript (ES6+, `fetch`, Promises, `async/await`, `localStorage`)
- [Unsplash API](https://unsplash.com/developers)

## Project structure

Adjust the names below to match your files.

```
Relief-Restaurant-Menu/
├── index.html
├── style.css
├── script.js
├── menu.json
├── config.example.js
├── .gitignore
├── LICENSE
└── README.md
```

## Getting started

```bash
git clone https://github.com/Aj1234-p/Relief-Restaurant-Menu.git
cd Relief-Restaurant-Menu
```

`fetch()` does not work on `file://` URLs, so run the project through a local server:

- **VS Code:** install the *Live Server* extension, right-click `index.html`, then choose *Open with Live Server*.
- **Terminal:** run `npx serve .`

### Unsplash API key (optional)

1. Create an app at https://unsplash.com/developers and copy your **Access Key**.
2. Copy `config.example.js` to `config.js` and paste the key into it.

`config.js` is listed in `.gitignore`, so your key is not committed. Any key used in front-end code can still be seen by visitors, so use this setup for demos and learning only.

## Problems faced and how I solved them

### 1. Independent scrolling for both columns

**Problem.** I wanted the logo and links column and the content column to scroll separately. Scrolling one should not move the other. Several default and unnecessary properties got in the way:

```css
body {
  height: 100vh;
  width: 100vw;      /* can add a sideways scrollbar */
  /* no margin: 0, so the default 8px margin makes the page taller than the screen */
  /* no overflow: hidden, so the page itself is free to scroll */
}
.container {
  display: grid;
  grid-template-columns: 20% 80%;
  /* no height, so the grid grows as tall as its content */
}
.logo-links-container {
  display: flex;
  flex-direction: column;
  /* no overflow and no fixed height above it, so it can't scroll on its own */
}
.search-container {
  position: sticky;
  top: 0;
  height: 1.7%;      /* a percentage height needs a parent with a real height */
}
#rest-name, #slogan, #border1 {
  position: absolute; /* no positioned parent, so it positions against the whole page */
}
```

**Root causes.**

| Cause | Effect |
|-------|--------|
| Default body margin (8px) | Page is taller than the screen, so the whole page scrolls |
| `width: 100vw` | Can add a sideways scrollbar |
| `.container` has no height | The grid grows with its content, so the columns never need their own scrollbar |
| Columns have no `overflow` | Nothing can scroll inside them |
| Percentage height on a parent with no real height | The value is ignored |
| `position: absolute` with no positioned parent | Text is placed against the page and does not scroll with its column |

**Solution.** Lock the page to the screen height, then let each column scroll inside it.

```css
html, body { height: 100%; }

body {
  margin: 0;
  height: 100vh;
  overflow: hidden;          /* the page never scrolls, the columns do */
}

.container {
  display: grid;
  grid-template-columns: 240px 1fr;
  height: 100vh;             /* a real height for the columns to fill */
}

.logo-links-container,
.content {
  height: 100%;
  overflow-y: auto;          /* each column scrolls on its own */
  min-height: 0;
}

.search-container {
  position: sticky;          /* sticks inside .content, which is the scroll container */
  top: 0;
}
```

The restaurant name, slogan and border go back to normal flow (no `position: absolute`).

**Lesson.** `overflow: hidden` on `body` is not the problem. It stops the *page* from scrolling, which is what we want here. The scrolling has to move inside the columns, and that only works when the parent has a fixed height.

### 2. Caching images: why a TTL does not fit

**Problem.** In an earlier CoinGecko project the data changed every second, so a cache with a TTL (time to live) made sense. I used the same approach here and it did not fit. Menu images do not change, so an expiry time only causes pointless re-fetching.

**Attempt A: with TTL (wrong for this project)**

```javascript
const CACHE_KEY = `unsplash_img_${query}`;
const CACHE_TTL = 60 * 1000;
const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
  data = cached.data; renderAll(data); return;
}
```

**Attempt B: without TTL (correct)**

```javascript
const CACHE_KEY = `unsplash_img_${query}`;
let cached = null;
try {
  cached = JSON.parse(localStorage.getItem(CACHE_KEY));
} catch {
  cached = null;
}
if (cached && cached.url) {
  return Promise.resolve(cached.url);
}
```

**Solution.** Cache the image URL permanently. It is a good fit here because:

- Once an item has an image, that image should stay the same on every visit.
- Fewer requests to the API, which matters because the Unsplash demo plan allows only 50 requests per hour.
- Faster page loads after the first visit.

**Lesson.** Use a TTL when data goes stale (prices, live stats). Skip it when the data is stable (images, static content).

### 3. Fetching from Unsplash: a direct link is not an API endpoint

**Problem.** In earlier API projects the pattern was always `fetch`, then `response.json()`, then use the data. Unsplash did not work with that approach. The problem was not the fetching code. It was the *kind* of URL I was fetching.

**A direct link points to one fixed thing**

```
https://picsum.photos/id/239/200/300
```

The URL names exactly one image, and the server returns those image bytes every time. To get a different image you have to write a different link.

**An API endpoint takes input and returns data**

```
https://api.unsplash.com/photos/random?query=pizza&client_id=YOUR_KEY
```

The server reads the query parameters, does the work (searches for "pizza" and picks a photo at random), and returns **JSON**, not the image itself. The image URL is inside that JSON at `urls.regular`, together with details such as the photographer's name.

**Solution.** Build the URL with query parameters and read the image URL from the JSON:

```javascript
const params = new URLSearchParams({
  query: "pizza",
  orientation: "landscape",
  client_id: UNSPLASH_KEY,
});

const res = await fetch(`https://api.unsplash.com/photos/random?${params}`);
const data = await res.json();
const imageUrl = data.urls.regular;
```

**Lesson.** When `fetch` "doesn't work", check what the URL returns before debugging the code. Compare a direct file link with an endpoint that takes parameters. The query parameters (`?query=pizza&client_id=...`) are how you tell the server what you want.

## What I learned

- Building independent scrolling layouts with Grid, `overflow` and `position: sticky`
- Choosing a caching strategy that matches how often the data changes
- The difference between a direct file link and an API endpoint with query parameters
- Sequencing asynchronous work with Promises and `async/await`

## Future improvements

- Add and remove items from the order by hand
- Category filters (Burgers, Pizza, Drinks)
- Save the last order in `localStorage`
- Move the Unsplash key behind a small backend proxy

## License

MIT. See [LICENSE](LICENSE).
