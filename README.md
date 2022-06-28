
# Files Sorter

The intention of this project is to provide a free and open source way 
to keep your folders and files organized with a few simple steps.

# Get the code

```
# Clone this repository
git clone https://github.com/DavidMunozMartinez/files-sorter.git

# Go into the repository
cd files-sorter

# Install dependecies
npm i
```

And you are ready to start development

# Run the app

## Start

```
npm run start
```

This will build the TypeScript code and initialize an electron app, once all compiles
corretly an Electron App and a developer tools window should be open

## Watch

```
npm run watch
```

This will run the app in watch mode, meaning the app refreshes as you update the code, this refreshes both the main process and the render process.  
NOTE: the ```NodeJS fs.readdir``` function stops working if you are constantly making changes (refreshing) to the render process while in watch mode, it starts working again if you make a change to the main process and the app is fully refreshed again, this is an issue
that has not been figured out yet.

## Package
```
npm run package
```
This will build the app natively for Windows or MacOS (It will build your current OS). The files will be in the release folder, the app is unsigned so if you try to run the packaged filed it will prompt warnings from both Windows and MacOS telling you that the app is from an Unknown publisher

