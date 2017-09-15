const electron = require("electron");
const dialog = electron.dialog;
const fs = require("fs");

const translate = function (id, args) {
  // TODO: write this function
  return id;
};

class ElectronDocument {
  constructor ({data, defaultPath, filepath, title = "New document", win} = {}) {
    Object.assign(this, {
      defaultPath,
      filepath,
      isClean: true,
      title,
      win
    });
  }

  // askClose().then(fn(arg))
  // arg is true if user selected "close"
  askClose () {
    if (this.isClean) {
      return Promise.resolve(true);
    }
    const input = dialog.showMessageBox(this.win, {
      title: translate("ask-close-title"),
      message: translate("ask-close-message", {title: this.title}),
      buttons: [
        translate("ask-close-cancel"),
        translate("ask-close-without-saving"),
        translate("ask-close-save-before")
      ],
      defaultId: 2,
      noLink: true
    });
    if (input === 2) {
      return this.save();
    }
    const mustClose = input === 1;
    return Promise.resolve(mustClose);
  }

  // load(filepath).then(fn({filepath, data}))
  load (filepath) {
    if (!filepath) {
      return Promise.reject("Could not load file: filepath is missing");
    }
    return new Promise((resolve, reject) => {
      fs.readFile(filepath, "utf8", (err, data) => {
        if (err) reject(err);
        Object.assign(this, {filepath, data});
        resolve({filepath, data});
      });
    });
  }

  // open().then(fn(arg))
  // arg is false if user canceled
  // otherwise it returns load() promise
  open () {
    const askFilepath = () => {
      const filepath = dialog.showOpenDialog(this.win, {
        title: translate("dialog-open"),
        properties: ['openFile'],
        defaultPath: this.defaultPath
      });
      return filepath[0];
    };
    const filepath = askFilepath();
    if (!filepath) {
      return Promise.resolve(false);
    }
    return this.load(filepath);
  }

  // save(filepath).then(fn({filepath, data}))
  save (filepath) {
    if (!filepath && !this.filepath) {
      return this.saveAs();
    }
    this.filepath = filepath;
    return new Promise((resolve, reject) => {
      fs.writeFile(filepath, this.data, (err) => {
        if (err) reject(err);
        resolve(filepath, this.data);
      });
    });
  }

  // saveAs().then(fn(arg))
  // arg is false if user canceled
  // otherwise it returns save() promise
  saveAs () {
    const filepath = dialog.showSaveDialog(this.win, {
      title: translate("dialog-save"),
      defaultPath: this.filepath || this.defaultPath
    });
    if (filepath) {
      return this.save(filepath);
    }
    return Promise.resolve(false);
  }
}

module.exports = ElectronDocument;
