const proxyquire = require("proxyquire").noCallThru();

// Rewire
const electronStub = {
  dialog: {
    showMessageBox: () => {
      console.log("showMessageBox");
      return 0;
    },
    showOpenDialog: () => ["./demo/lorem.txt"],
    showSaveDialog: () => {}
  }
};

// Main
const ElectronDocument = proxyquire("../index.js", {
  electron: electronStub
});

const doc = new ElectronDocument();
doc.askClose().then((mustClose) => {
  if (mustClose) {
    console.log("Must close the app");
  }
});
doc.open().then((value) => {
  console.log(`Opened "${value.filepath}" with contents: "${value.data}"`);
});
