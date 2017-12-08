﻿/**
 * TODO: Document & prepare typescript definitions
 * TODO: Refactor & test more
 */
var abp = abp || {};
(function ($) {

    abp.modals = abp.modals || {};

    abp.ModalManager = (function () {
        
        return function (options) {

            var _options = options;

            var _$modalContainer = null;
            var _$modal = null;
            var _$form = null;
            var _modalId = 'Modal_' + (Math.floor((Math.random() * 1000000))) + new Date().getTime();
            var _modalObject = null;

            var _publicApi = null;
            var _args = null;
            var _getResultCallback = null;

            var _onCloseCallbacks = [];

            function _removeContainer() {
                _$modalContainer && _$modalContainer.remove();
            };

            function _createContainer() {
                _removeContainer();
                _$modalContainer = $('<div id="' + _modalId + 'Container' + '"></div>').appendTo('body');
                return _$modalContainer;
            }

            function _saveModal() {
                if (_modalObject && _modalObject.save) {
                    _modalObject.save();
                } else if (_$form) {
                    _$form.submit();
                }
            }

            function _initAndShowModal() {
                _$modal = _$modalContainer.find('.modal');

                _$form = _$modal.find('form');
                if (!_$form.length) {
                    _$form = null;
                } else if (_options.ajaxForm !== false) { //TODO: This option should be set by the modal or modal class!
                    _$form.ajaxForm(function() {
                        _$modal.modal('hide');
                    });
                }

                _$modal.modal({
                    backdrop: 'static'
                });

                _$modal.on('hidden.bs.modal', function () {
                    _removeContainer(_modalId);

                    for (var i = 0; i < _onCloseCallbacks.length; i++) {
                        _onCloseCallbacks[i]();
                    }
                });

                _$modal.on('shown.bs.modal', function () {
                    _$modal.find('input:not([type=hidden]):first').focus();
                });

                var modalClass = abp.modals[options.modalClass];
                if (modalClass) {
                    _modalObject = new modalClass();
                    if (_modalObject.init) {
                        _modalObject.init(_publicApi, _args);
                    }
                }

                _$modal.find('button[type=submit]').click(function () {
                    _saveModal();
                });

                _$modal.find('.modal-body').keydown(function (e) {
                    if (e.which === 13) {
                        if (e.target.tagName.toLocaleLowerCase() === "textarea") {
                            e.stopPropagation();
                        } else {
                            e.preventDefault();
                            _saveModal();
                        }
                    }
                });
                
                _$modal.modal('show');
            };

            var _open = function (args, getResultCallback) {

                _args = args || {};
                _getResultCallback = getResultCallback;

                _createContainer(_modalId)
                    .load(options.viewUrl, $.param(_args), function (response, status, xhr) {
                        if (status == "error") {
                            //TODO: ERROR message!
                            return;
                        };

                        if (options.scriptUrl) {
                            abp.ResourceLoader.loadScript(options.scriptUrl, function() {
                                _initAndShowModal();
                            });
                        } else {
                            _initAndShowModal();
                        }
                    });
            };

            var _close = function() {
                if (!_$modal) {
                    return;
                }

                _$modal.modal('hide');
            };

            var _onClose = function (onCloseCallback) {
                _onCloseCallbacks.push(onCloseCallback);
            }

            function _setBusy(isBusy) {
                if (!_$modal) {
                    return;
                }

                _$modal.find('.modal-footer button').buttonBusy(isBusy);
            }

            _publicApi = {

                open: _open,

                reopen: function() {
                    _open(_args);
                },

                close: _close,

                getModalId: function () {
                    return _modalId;
                },

                getModal: function () {
                    return _$modal;
                },

                getArgs: function () {
                    return _args;
                },

                getOptions: function() {
                    return _options;
                },

                setBusy: _setBusy,

                setResult: function() {
                    _getResultCallback && _getResultCallback.apply(_publicApi, arguments);
                },

                onClose: _onClose
            }

            return _publicApi;

        };
    })();

})(jQuery);