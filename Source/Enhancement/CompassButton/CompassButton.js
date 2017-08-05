define([
    '../../Core/defined',
    '../../Core/defineProperties',
    '../../Core/destroyObject',
    '../../Core/DeveloperError',
    '../../ThirdParty/knockout',
    '../../Widgets/getElement',
    './CompassButtonViewModel'
], function(
    defined,
    defineProperties,
    destroyObject,
    DeveloperError,
    knockout,
    getElement,
    CompassButtonViewModel) {
    'use strict';

    function CompassButton(container, scene, duration) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(container)) {
            throw new DeveloperError('container is required.');
        }
        //>>includeEnd('debug');

        container = getElement(container);

        var viewModel = new CompassButtonViewModel(scene, duration);

        viewModel._svgPath = 'M14,0C6.268,0,0,6.268,0,14s6.268,14,14,14s14-6.268,14-14S21.732,0,14,0z M14,26\
            C7.373,26,2,20.627,2,14S7.373,2,14,2s12,5.373,12,12S20.627,26,14,26z \
            M10,14c0,2.21,1.791,4,4,4s4-1.79,4-4S14,3,14,3S10,11.79,10,14z M16,14c0,1.104-0.896,2-2,2\
            s-2-0.896-2-2s0.896-2,2-2S16,12.896,16,14z';

        var element = document.createElement('button');
        element.type = 'button';
        element.className = 'cesium-button cesium-toolbar-button cesium-compass-button';
        element.setAttribute('data-bind', '\
attr: { title: tooltip },\
click: command,\
cesiumSvgPath: { path: _svgPath, width: 28, height: 28, style:{transform: headingStyle, "-ms-transform": headingStyle, "-webkit-transform": headingStyle}}');
        container.appendChild(element);
        knockout.applyBindings(viewModel, element);

        this._container = container;
        this._viewModel = viewModel;
        this._element = element;
    }

    defineProperties(CompassButton.prototype, {
        container: {
            get: function() {
                return this._container;
            }
        },

        viewModel: {
            get: function() {
                return this._viewModel;
            }
        }
    });

    CompassButton.prototype.isDestroyed = function() {
        return false;
    };

    CompassButton.prototype.destroy = function() {
        this.viewModel.destroy();

        knockout.cleanNode(this._element);
        this._container.removeChild(this._element);

        return destroyObject(this);
    };

    return CompassButton;
});