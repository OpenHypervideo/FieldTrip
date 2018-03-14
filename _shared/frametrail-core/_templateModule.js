FrameTrail.defineModule('myAppModule', function(FrameTrail){


    // Declaration of local vars

    var localVar1,
        localVar2;


    // Implementation of local functions

    function privateFunction1(param) {

    }


    function privateFunction2(param) {

    }

    function privateFunctionListener1(newValue, oldValue) {

    }

    function privateFunctionUnload() {

    }


    // Optional: Top-level code for module initialization

    localVar1 = 'meaningful thing'
    privateFunction1();

    FrameTrail.initModule('someOtherModule');
    FrameTrail.unloadModule('someOtherModule');
    FrameTrail.module('someOtherModule').doSomething();

    var y = FrameTrail.getState('globalStateVar3');
    FrameTrail.changeState('globalStateVar1', 42);
    FrameTrail.changeState({  globalStateVar2: 'yes',
                       globalStateVar3: true
                    });




    // Export public interface object

    return {

        publicFunction: privateFunction2,

        onUnload:       privateFunctionUnload,

        onChange:       {
                            'globalStateVar2': privateFunctionListener1
                        }

    }


});
