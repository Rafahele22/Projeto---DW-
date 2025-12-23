const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  const isMac = process.platform === "darwin";

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    titleBarStyle: "hidden",
    trafficLightPosition: { x: 12, y: 30 },
    
    titleBarOverlay: isMac
      ? true 
      : { height: 60 }, 

    autoHideMenuBar: true, 
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
  });

  mainWindow.loadFile(path.join(__dirname, "../public/main.html"));
  
  mainWindow.once("ready-to-show", () => mainWindow.show());
  
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
