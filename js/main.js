(function () {
  'use strict';

  var cs = new CSInterface();
  var selectedFolder = '';

  var dropZone = document.getElementById('dropZone');
  var selectedPath = document.getElementById('selectedPath');
  var browseButton = document.getElementById('browseButton');
  var importButton = document.getElementById('importButton');
  var createRootFolder = document.getElementById('createRootFolder');
  var skipExisting = document.getElementById('skipExisting');
  var fpsDefault = document.getElementById('fpsDefault');
  var fpsManual = document.getElementById('fpsManual');
  var fpsValue = document.getElementById('fpsValue');
  var status = document.getElementById('status');

  function setStatus(message) {
    status.textContent = message;
  }

  function setFolder(path) {
    selectedFolder = path || '';
    selectedPath.textContent = selectedFolder || 'No folder selected';
    importButton.disabled = !selectedFolder;
  }

  function jsxString(value) {
    return JSON.stringify(String(value || ''));
  }

  function jsxBool(value) {
    return value ? 'true' : 'false';
  }

  function selectedFps() {
    if (!fpsManual.checked) {
      return 0;
    }

    var value = parseFloat(fpsValue.value);
    if (!isFinite(value) || value <= 0) {
      return -1;
    }
    return value;
  }

  function updateFpsInput() {
    fpsValue.disabled = !fpsManual.checked;
  }

  fpsDefault.addEventListener('change', updateFpsInput);
  fpsManual.addEventListener('change', updateFpsInput);

  browseButton.addEventListener('click', function () {
    cs.evalScript('chooseSequenceRootFolder()', function (result) {
      if (result && result !== '__CANCEL__') {
        setFolder(result);
        setStatus('Folder selected.');
      }
    });
  });

  importButton.addEventListener('click', function () {
    if (!selectedFolder) {
      setStatus('Choose a folder first.');
      return;
    }

    var fps = selectedFps();
    if (fps < 0) {
      setStatus('Enter a valid FPS value.');
      return;
    }

    importButton.disabled = true;
    setStatus('Importing...');

    var call = [
      'importSequencesFromRoot(',
      jsxString(selectedFolder), ',',
      jsxBool(createRootFolder.checked), ',',
      jsxBool(skipExisting.checked), ',',
      String(fps),
      ')'
    ].join('');

    cs.evalScript(call, function (result) {
      importButton.disabled = false;
      setStatus(result || 'Done.');
    });
  });

  dropZone.addEventListener('dragover', function (event) {
    event.preventDefault();
    dropZone.classList.add('active');
  });

  dropZone.addEventListener('dragleave', function () {
    dropZone.classList.remove('active');
  });

  dropZone.addEventListener('drop', function (event) {
    event.preventDefault();
    dropZone.classList.remove('active');

    var files = event.dataTransfer.files;
    if (!files || files.length < 1) {
      setStatus('Nothing was dropped.');
      return;
    }

    var path = files[0].path || '';
    if (!path) {
      setStatus('This host did not expose the dropped folder path. Use Choose Folder.');
      return;
    }

    cs.evalScript('isFolderPath(' + jsxString(path) + ')', function (result) {
      if (result === 'true') {
        setFolder(path);
        setStatus('Folder selected.');
      } else {
        setStatus('Drop a folder, not a file.');
      }
    });
  });
}());
