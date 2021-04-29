const fs = require("fs");
const path = require("path");
const et = require("elementtree");

// Parses a given file into an elementtree object
function parseElementtreeSync(filename) {
  var contents = fs.readFileSync(filename, "utf-8");
  if (contents) {
    //Windows is the BOM. Skip the Byte Order Mark.
    contents = contents.substring(contents.indexOf("<"));
  }
  return new et.ElementTree(et.XML(contents));
}

function updateMimeTypes(manifest, mimeTypes) {
  const tempManifest = parseElementtreeSync(manifest);
  const root = tempManifest.getroot();

  const parent = "application/activity";

  mimeTypes.forEach((mimeType) => {
    const parentEl = root.find(parent);

    const intentFilter = new et.Element("intent-filter");
    intentFilter.append(
      new et.Element("data", { "android:mimeType": mimeType })
    );
    intentFilter.append(
      new et.Element("action", {
        "android:name": "android.intent.action.SEND",
      })
    );
    intentFilter.append(
      new et.Element("action", {
        "android:name": "android.intent.action.SEND_MULTIPLE",
      })
    );
    intentFilter.append(
      new et.Element("category", {
        "android:name": "android.intent.category.DEFAULT",
      })
    );
    parentEl.append(intentFilter);
  });

  fs.writeFileSync(manifest, tempManifest.write({ indent: 4 }), "utf-8");
}

module.exports = function (context) {
  // Prevent double execution
  if (
    context.hook == "after_prepare" &&
    !RegExp("\\s+prepare").test(context.cmdLine)
  ) {
    return "";
  }

  const packageJson = require(path.join(
    context.opts.projectRoot,
    "package.json"
  ));

  const manifestPath = path.join(
    context.opts.projectRoot,
    "platforms",
    "android",
    "app",
    "src",
    "main",
    "AndroidManifest.xml"
  );
  const pluginProperties = packageJson.cordova.plugins["cc.fovea.cordova.openwith"];

  const mimeTypes = pluginProperties["ANDROID_MIME_TYPES"].split(",");
  updateMimeTypes(manifestPath, mimeTypes);
};
