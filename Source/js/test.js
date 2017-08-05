define(['Cesium', '../Enhancement/CompassButton/CompassButton', '../Enhancement/CompassButton/CompassButtonViewModel'], 
    function(Cesium, CompassButton, CompassButtonViewModel) {
    'use strict';
    //>>includeStart('debug', pragmas.debug);
    console.log('%c Almond Debug ' + '%cOn ', 'background: #222; color: #bada55', 'background: #222;color: #3a3');
    //>>includeEnd('debug');

    //>>includeStart('debug', !pragmas.debug);
    console.log('%c Almond Debug ' + '%cOff ', 'background: #222; color: #bada55', 'background: #222;color: #a33');
    //>>includeEnd('debug');

    //>>includeStart('combinePath', pragmas.combinePath);
    console.log('%c Using ' + '%cCombine Path ', 'background: #222; color: #bada55', 'background: #222;color: #3a3');
    //>>includeEnd('combinePath');

    //>>includeStart('combinePath', !pragmas.combinePath);
    console.log('%c Using ' + '%cRelease Path ', 'background: #222; color: #bada55', 'background: #222;color: #3a3');
    //>>includeEnd('combinePath');

    var plc = {};
    plc['CompassButton'] = CompassButton;
    plc['CompassButtonViewModel'] = CompassButtonViewModel;
    Cesium.PLC = plc;
    return Cesium;
});