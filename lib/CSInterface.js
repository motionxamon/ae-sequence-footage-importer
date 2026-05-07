/* Minimal CSInterface wrapper for evalScript-based CEP panels. */
(function () {
  'use strict';

  function CSInterface() {}

  CSInterface.prototype.evalScript = function (script, callback) {
    if (window.__adobe_cep__ && window.__adobe_cep__.evalScript) {
      window.__adobe_cep__.evalScript(script, callback || function () {});
      return;
    }

    if (callback) {
      callback('CEP bridge is not available. Open this panel inside After Effects.');
    }
  };

  window.CSInterface = CSInterface;
}());
