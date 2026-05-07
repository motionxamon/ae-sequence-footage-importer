/* global app, Folder, File, ImportOptions, ImportAsType */
(function () {
  'use strict';

  var IMAGE_EXTENSIONS = {
    bmp: true,
    cin: true,
    dpx: true,
    exr: true,
    iff: true,
    jpeg: true,
    jpg: true,
    png: true,
    psd: true,
    rla: true,
    rpf: true,
    sgi: true,
    tga: true,
    tif: true,
    tiff: true
  };

  function decodePath(path) {
    return String(path || '').replace(/\\/g, '/');
  }

  function isFolderPath(path) {
    return Folder(decodePath(path)).exists ? 'true' : 'false';
  }

  function chooseSequenceRootFolder() {
    var folder = Folder.selectDialog('Choose root folder with rendered sequences');
    return folder ? folder.fsName : '__CANCEL__';
  }

  function getOrCreateFolder(name, parentFolder) {
    var targetParent = parentFolder || app.project.rootFolder;
    for (var i = 1; i <= app.project.numItems; i += 1) {
      var item = app.project.item(i);
      if (item instanceof FolderItem && item.name === name && item.parentFolder === targetParent) {
        return item;
      }
    }

    var created = app.project.items.addFolder(name);
    created.parentFolder = targetParent;
    return created;
  }

  function getFolderChain(baseFolder, relativeParts) {
    var current = baseFolder;
    for (var i = 0; i < relativeParts.length; i += 1) {
      if (relativeParts[i]) {
        current = getOrCreateFolder(relativeParts[i], current);
      }
    }
    return current;
  }

  function listFilesRecursive(folder, out) {
    var entries = folder.getFiles();
    for (var i = 0; i < entries.length; i += 1) {
      if (entries[i] instanceof Folder) {
        listFilesRecursive(entries[i], out);
      } else if (entries[i] instanceof File) {
        out.push(entries[i]);
      }
    }
  }

  function extensionOf(file) {
    var name = file.name;
    var index = name.lastIndexOf('.');
    if (index < 0) {
      return '';
    }
    return name.substring(index + 1).toLowerCase();
  }

  function sequenceKey(file) {
    var extension = extensionOf(file);
    if (!IMAGE_EXTENSIONS[extension]) {
      return null;
    }

    var nameWithoutExt = file.name.substring(0, file.name.length - extension.length - 1);
    var match = nameWithoutExt.match(/^(.*?)([._ -]?)(\d+)$/);
    if (!match) {
      return null;
    }

    return file.parent.fsName + '|' + match[1] + '|' + match[2] + '|' + match[3].length + '|' + extension;
  }

  function itemSourcePath(item) {
    try {
      if (item && item.mainSource && item.mainSource.file) {
        return item.mainSource.file.fsName;
      }
    } catch (error) {
      return '';
    }
    return '';
  }

  function collectImportedPaths() {
    var paths = {};
    for (var i = 1; i <= app.project.numItems; i += 1) {
      var path = itemSourcePath(app.project.item(i));
      if (path) {
        paths[path] = true;
      }
    }
    return paths;
  }

  function relativeParts(rootFolder, folder) {
    var rootPath = decodePath(rootFolder.fsName);
    var folderPath = decodePath(folder.fsName);
    var relative = folderPath.indexOf(rootPath) === 0 ? folderPath.substring(rootPath.length) : folder.name;
    relative = relative.replace(/^\/+/, '');
    return relative ? relative.split('/') : [];
  }

  function sortedSequenceGroups(files) {
    var groups = {};
    var keys = [];

    for (var i = 0; i < files.length; i += 1) {
      var key = sequenceKey(files[i]);
      if (!key) {
        continue;
      }
      if (!groups[key]) {
        groups[key] = [];
        keys.push(key);
      }
      groups[key].push(files[i]);
    }

    keys.sort();
    var result = [];
    for (var k = 0; k < keys.length; k += 1) {
      groups[keys[k]].sort(function (a, b) {
        return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
      });
      result.push(groups[keys[k]]);
    }
    return result;
  }

  function applyFrameRate(item, fps) {
    if (!fps || fps <= 0) {
      return false;
    }

    if (item && item.mainSource && item.mainSource.conformFrameRate !== undefined) {
      item.mainSource.conformFrameRate = fps;
      return Math.abs(item.mainSource.conformFrameRate - fps) < 0.0001;
    }
    return false;
  }

  function importSequence(firstFile, destinationFolder, fps) {
    var options = new ImportOptions(firstFile);
    options.sequence = true;
    options.forceAlphabetical = false;

    if (options.canImportAs(ImportAsType.FOOTAGE)) {
      options.importAs = ImportAsType.FOOTAGE;
    }

    var item = app.project.importFile(options);
    item.parentFolder = destinationFolder;
    applyFrameRate(item, fps);
    return item;
  }

  function importSequencesFromRoot(path, createRootFolder, skipExisting, fps) {
    var root = Folder(decodePath(path));
    if (!root.exists) {
      return 'Folder does not exist:\n' + path;
    }

    fps = Number(fps) || 0;
    if (fps < 0) {
      return 'Invalid FPS value.';
    }

    if (!app.project) {
      app.newProject();
    }

    var files = [];
    listFilesRecursive(root, files);
    var groups = sortedSequenceGroups(files);
    var importedPaths = skipExisting ? collectImportedPaths() : {};
    var footagesFolder = getOrCreateFolder('Footages', app.project.rootFolder);
    var baseFolder = createRootFolder ? getOrCreateFolder(root.name, footagesFolder) : footagesFolder;

    var imported = 0;
    var skipped = 0;
    var conformed = 0;
    var failed = [];

    app.beginUndoGroup('Import Rendered Sequences');
    try {
      for (var i = 0; i < groups.length; i += 1) {
        var firstFile = groups[i][0];
        if (skipExisting && importedPaths[firstFile.fsName]) {
          skipped += 1;
          continue;
        }

        try {
          var parts = relativeParts(root, firstFile.parent);
          var destination = getFolderChain(baseFolder, parts);
          var item = importSequence(firstFile, destination, fps);
          if (fps > 0 && item && item.mainSource && Math.abs(item.mainSource.conformFrameRate - fps) < 0.0001) {
            conformed += 1;
          }
          imported += 1;
        } catch (error) {
          failed.push(firstFile.fsName + ': ' + error.toString());
        }
      }
    } finally {
      app.endUndoGroup();
    }

    var message = 'Imported sequences: ' + imported + '\nSkipped existing: ' + skipped + '\nFound sequence groups: ' + groups.length;
    message += fps > 0 ? '\nManual FPS: ' + fps + '\nConformed items: ' + conformed : '\nManual FPS: off';
    if (failed.length) {
      message += '\n\nFailed:\n' + failed.join('\n');
    }
    return message;
  }

  $.global.isFolderPath = isFolderPath;
  $.global.chooseSequenceRootFolder = chooseSequenceRootFolder;
  $.global.importSequencesFromRoot = importSequencesFromRoot;
}());
