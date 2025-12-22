## About Fontscope
Fontscope is an application designed to discover, filter, search, collect, and experiment with free typefaces. The platform offers two viewing modes, grid and list, and allows filtering by tags, foundries, number of styles, and variable fonts.

<img width="1200" height="798" alt="Image" src="https://github.com/user-attachments/assets/36af9653-5423-4bdf-acfb-11bdc84da72a" />
<img width="1200" height="798" alt="Image" src="https://github.com/user-attachments/assets/ed03540b-c4ca-4444-a2d4-40506ce12b4f" />
<img width="1200" height="798" alt="Image" src="https://github.com/user-attachments/assets/37f8c0a6-b24c-45c7-82e5-e3f268fad019" />



Each typeface can be customized in real time by adjusting its style, sample text, font size, leading, and tracking, enabling users to test and compare fonts directly within the interface. 

<img width="1200" height="798" alt="Image" src="https://github.com/user-attachments/assets/a3bcbf09-fc5e-44e2-aac3-56d166b4070d" />
<img width="1200" height="798" alt="Image" src="https://github.com/user-attachments/assets/5243db97-9cdb-4f89-8d2c-b75a173afebf" />



Fontscope also allows users to create a personal profile, where they can save favorite fonts and font pairs, create albums, and build their own pairings.
<img width="1200" height="798" alt="Image" src="https://github.com/user-attachments/assets/0d4328d9-5898-4dbc-9aa3-cbb82cd13fbb" />
<img width="1200" height="798" alt="Image" src="https://github.com/user-attachments/assets/5040196c-ca9b-4037-b8cd-b18c7dcb71bb" />
<img width="1200" height="798" alt="Image" src="https://github.com/user-attachments/assets/ddaadb1e-0e7c-4b63-b494-bb3ece87968a" />
<img width="1200" height="798" alt="Image" src="https://github.com/user-attachments/assets/dc9fe3fb-c856-4771-b90f-b1d17e39553e" />



Fontscope is intended for both designers and non-designers, offering clear and useful information about each typeface, an intuitive and efficient search experience, and hands-on customization tools that support faster and more informed typographic decisions for any project.


## Instructions for running the electron app
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start Electron:
   ```bash
   npm run electron
   ```

### How to start MongoDB and the local server
1. Make sure MongoDB is running locally (port 3000)
2. Start the server:
   ```bash
   cd server
   node server.js
   ```
3. Access the application:
   - Open Electron, or
   - Open `public/main.html` in your browser for the web version

### Project structure
```
Projeto---DW-
├── public/
│   ├── main.html
│   ├── css/
│   ├── js/
│   │   └── main/
│   │       ├── index.js
│   │       ├── filtering.js
│   │       ├── react/
│   │       └── ...
│   └── assets/
├── server/
│   ├── server.js
│   └── config/
├── data/
├── C-react/
├── electron/
├── docs/
│   └── JS_STRUCTURE.md
├── readme.md
└── instructions.md
```

## Task Distribution

| Contributor | Main Responsibilities |
|-------------|----------------------|
| **Olga**    | - Logo and icon design and animation<br>- Collection and construction of the font database (free fonts only)<br>- HTML/CSS structure<br>&nbsp;&nbsp;&nbsp;&rarr; Styling of all interface elements<br>&nbsp;&nbsp;&nbsp;&rarr; Responsive design (media queries)<br>- Linking content to the fonts dataset<br>- Filtering system (native JavaScript)<br>- Dropdown buttons<br>- Page navigation and routing<br>- “Similar” feature<br>- Login state handling (UI changes based on authentication)<br>- Electron navigation bar<br>- Loading screen |
| **Rafael**  | - File and codebase organization<br>- Node.js / Electron / MongoDB project structure<br>- Connection of all content to MongoDB<br>- Authentication and login functionality<br>- Conversion of filters and collections to React<br>- Search bar and slider functionality<br>- User dataset creation<br>- Collection dataset creation<br>- User features:<br>&nbsp;&nbsp;&nbsp;&rarr; Add albums<br>&nbsp;&nbsp;&nbsp;&rarr; Add pairs<br>&nbsp;&nbsp;&nbsp;&rarr; Manage favorites<br>- Connection to the server<br>- Refactoring and modularization of React components<br>- Implementation and debugging of filtering, search, and lazy loading logic<br>- Asset loading and server path troubleshooting<br>- Improvements to project documentation and onboarding<br>- Technical planning and architectural decisions |