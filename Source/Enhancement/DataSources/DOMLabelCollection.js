define([
    '../../Core/defined',
    '../../Core/defineProperties',
    '../../Core/Event',
    '../../Core/DeveloperError',
    './DOMLabel',
    '../../Core/AssociativeArray',
    '../../Widgets/getElement',
    '../../Core/Cartesian3',
    '../../Core/RuntimeError',
    '../../Core/defaultValue'
], function (
    defined,
    defineProperties,
    Event,
    DeveloperError,
    DOMLabel,
    AssociativeArray,
    getElement,
    Cartesian3,
    RuntimeError,
    defaultValue) {
    'use strict';

    /**
     * An observable collection of {@link DOMLabel} instances where each label has an unique id.
     * @alias DOMLabelCollection
     * @constructor
     *
     * @param {Element} container The parent container of this layer.
     * @param {Scene} scene The scene related with.
     * @param {Boolean} [show=true] Set whether the collection of label show or not.
     */
    function DOMLabelCollection(container, scene, show) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(container)) {
            throw new DeveloperError('container is required.');
        }
        if (!defined(scene)) {
            throw new DeveloperError('scene is required.');
        }
        //>>includeEnd('debug');

        this._container = getElement(container);
        this._scene = scene;
        this._labels = new AssociativeArray();
        this._addedLabels = new AssociativeArray();
        this._removedLabels = new AssociativeArray();
        this._collectionChanged = new Event();
        this._show = defaultValue(show, true);
        this._firing = false;
        this._refire = false;

        this._scene.preRender.addEventListener(renderFrame, this);
    }

    /**
     * The signature of the event generated by {@link DOMLabelCollection#collectionChanged}.
     * @function
     * @param {DOMLabelCollection} collection The collection that triggered the event.
     * @param {DOMLabel[]} added The array of {@link DOMLabel} instances that have been added to the collection.
     * @param {DOMLabel[]} removed The array of {@link DOMLabel} instances that have been removed from the collection.
     */
    DOMLabelCollection.collectionChangedEventCallback = undefined;

    defineProperties(DOMLabelCollection.prototype, {
        /**
         * Gets the parent container.
         * @memberof DOMLabelCollection.prototype
         * @type {Element}
         * @readonly
         */
        container: {
            get: function () {
                return this._container;
            }
        },

        /**
         * Gets the array of DOMLabel instances in the collection.
         * This arry should not be modified directly.
         * @memberof DOMLabelCollection.prototype
         * @readonly
         * @type {DOMLabel[]}
         */
        values: {
            get: function () {
                return this._labels.values;
            }
        },

        /**
         * Gets or sets whether or not this label collection should be
         * displayed. When true, each label is only displayed if its
         * own show property is also true.
         * @memberof DOMLabelCollection.prototype
         * @type {Boolean}
         */
        show: {
            get: function () {
                return this._show;
            },
            set: function (value) {
                //>>includeStart('debug', pragmas.debug);
                if (!defined(value)) {
                    throw new DeveloperError('value is require');
                }
                //>>includeEnd('debug');

                if (value === this._show) {
                    return;
                }

                this._show = value;

                if (value) {
                    this._container.style.display = 'block';
                    this._scene.preRender.addEventListener(renderFrame, this);
                } else {
                    this._container.style.display = 'none';
                    this._scene.preRender.removeEventListener(renderFrame);
                }
            }
        },

        /**
         * Gets the event that is fired when labels are added or removed
         * from collection.
         * The generated event is a {@link DOMLabelCollection.collectionChangedEventCallback}.
         * @memberof DOMLabelCollection.prototype
         * @readonly
         * @type {Event}
         */
        collectionChanged: {
            get: function () {
                return this._collectionChanged;
            }
        }
    });

    function fireChangedEvent(collection) {
        if (collection._firing) {
            collection._refire = true;
            return;
        }

        var added = collection._addedLabels;
        var removed = collection._removedLabels;
        if (added.length !== 0 || removed.length !== 0) {
            collection._firing = true;
            do {
                collection._refire = false;
                var addedArray = added.values.slice(0);
                var removedArray = removed.values.slice(0);

                added.removeAll();
                removed.removeAll();
                collection._collectionChanged.raiseEvent(collection, addedArray, removedArray);
            } while (collection._refire);
            collection._firing = false;
        }
    }

    /**
     * Add an label to the collection.
     *
     * @param {DOMLabel} label The label to be added.
     * @returns {DOMLabel} The label that was added.
     * @exception {DeveloperError} An label with <code>label.id</code> already exists in
     * this collection.
     *
     * @example
     * var positions = Cesium.Cartesian3.fromDegreesArrayHeights([-115.0, 37.0, 100000.0, -107.0, 33.0, 0.0]);
     * label1 = viewer.domLabels.add({
     *          position: positions[0],
     *          text: "hello world 1"
     *      });
     */
    DOMLabelCollection.prototype.add = function (label) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(label)) {
            throw new DeveloperError('label is required.');
        }
        //>>includeEnd('debug');

        if (!(label instanceof DOMLabel)) {
            label = new DOMLabel(label);
        }

        var id = label.id;
        var labels = this._labels;
        if (labels.contains(id)) {
            throw new RuntimeError('A label with id ' + id + ' already exists in this collection.');
        }

        label._domlabelCollection = this;
        this._container.appendChild(label.label);
        labels.set(id, label);

        if (!this._removedLabels.remove(id)) {
            this._addedLabels.set(id, label);
        }
        fireChangedEvent(this);
        return label;
    };

    /**
     * Remove an label from the collection.
     *
     * @param {DOMLabel} label The label to be removed.
     * @returns {Boolean} true if the item was removed, false if it
     * did not exist in the collection.
     *
     * @example
     * viewer.domLabels.remove(label1);
     */
    DOMLabelCollection.prototype.remove = function (label) {
        if (!defined(label)) {
            return false;
        }
        return this.removeById(label.id);
    };

    /**
     * Return true if the provided entity is in ths collection,
     * false otherwise.
     *
     * @param {DOMLabel} label The label.
     * @returns {Boolean} true if the provided label is in this collection,
     * false otherwise.
     *
     * @example
     * var isContain = viewer.domLabels.contains(label1);
     */
    DOMLabelCollection.prototype.contains = function (label) {
        if (!defined(label)) {
            throw new DeveloperError('label is required.');
        }
        return this._labels.get(label.id) === label;
    };

    /**
     * Removes an label with the provided id from the collection.
     *
     * @param {Object} id The id of the label to remove.
     * @returns {Boolean} true if the item was removed, false if no
     * item with the provided id existed in the collection.
     *
     * @example
     * var isContain = viewer.domLabels.removeById(label1.id);
     */
    DOMLabelCollection.prototype.removeById = function (id) {
        if (!defined(id)) {
            return false;
        }

        var labels = this._labels;
        var label = labels.get(id);
        if (!this._labels.remove(id)) {
            return false;
        }

        if (!this._addedLabels.remove(id)) {
            this._removedLabels.remove(id);
        }

        this._labels.remove(id);
        label._domlabelCollection = undefined;
        this._container.removeChild(label._label);
        fireChangedEvent(this);

        return true;
    };

    /**
     * Remove all labels from the collection.
     */
    DOMLabelCollection.prototype.removeAll = function () {
        var labels = this._labels;
        var labelsLength = labels.length;
        var array = labels.values;

        var addedLabels = this._addedLabels;
        var removedLabels = this._removedLabels;

        for (var i = 0; i < labelsLength; i++) {
            var existingItem = array[i];
            var existingItemId = existingItem.id;
            var addedItem = addedLabels.get(existingItemId);
            if (!defined(addedItem)) {
                existingItem._domlabelCollection = undefined;
                this._container.removeChild(existingItem._label);
                removedLabels.set(existingItemId, existingItem);
            }
        }

        labels.removeAll();
        addedLabels.removeAll();
        fireChangedEvent(this);
    };

    /**
     * Gets an label with the specified id.
     *
     * @param {Object} id The id of the label to retrieve.
     * @returns {DOMLabel} The label with the provided id or undefined if
     * the id did not exist in the collection.
     */
    DOMLabelCollection.prototype.getById = function (id) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(id)) {
            throw new DeveloperError('id is required.');
        }
        //>>includeEnd('debug');

        return this._labels.get(id);
    };

    var labelScratch = {};
    var arrayScratch = {};
    var lengthScratch = {};
    var positionScratch = {};
    var cameraPositionScratch = {};

    function renderFrame() {
        if (this._show && this._labels.length !== 0) {
            arrayScratch = this._labels.values;
            lengthScratch = this._labels.length;
            cameraPositionScratch = this._scene.camera.position;
            for (var i = 0; i < lengthScratch; i++) {
                labelScratch = arrayScratch[i]._label;
                if (arrayScratch[i]._show) {
                    if (Cartesian3.dot(cameraPositionScratch, arrayScratch[i]._position) < 0) {
                        labelScratch.style.display = 'none';
                    } else {
                        positionScratch = this._scene.cartesianToCanvasCoordinates(arrayScratch[i]._position);
                        if (defined(positionScratch)) {
                            labelScratch.style.display = 'block';
                            labelScratch.style.top = arrayScratch[i]._vOffset + positionScratch.y - labelScratch.offsetHeight / 2 + 'px';
                            labelScratch.style.left = arrayScratch[i]._hOffset + positionScratch.x - labelScratch.offsetWidth / 2 + 'px';
                        }
                    }
                }
            }
        }
    }

    return DOMLabelCollection;
});
