/**
 * @author Alec Hill
 * 
 * tests for LiveValidation 1.3 (prototype.js version)
 */

// <![CDATA[

// utility functions /////////////////////////////////////

// strip spaces from the beginning and end of a value
function stripSpaces(value){ return value.strip(); }

// simulate events
Event.simulateEvent = function(element, eventName, optionsObj) {
  var options = Object.extend({
    bubbles: true,
    cancelable: true,
    view: window
  }, optionsObj || {});
  if(document.createEvent){
    try {
      var oEvent = document.createEvent("Events");
    }catch (err) {
      var oEvent = document.createEvent("UIEvents");
    }finally{
      oEvent.initEvent(eventName, options.bubbles, options.cancelable, options.view);
      try{Object.extend(oEvent, options);}catch(error){}
      $(element).dispatchEvent(oEvent);
    }
  }else if( document.createEventObject ) {
    var oEvent = document.createEventObject();
    oEvent.relatedTarget = $(element);
    Object.extend(oEvent, options);
    $(element).fireEvent('on' + eventName, oEvent);
  }
}

Event.simulateMouseEvent = function(element, eventName, optionsObj) {
  var options = Object.extend({
    bubbles: true,
    cancelable: true,
    view: window,
    detail: 1,
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 0,
    relatedTarget: $(element)
  }, optionsObj || {});
  if(document.createEvent){
    try{
      var oEvent = document.createEvent("MouseEvents");
      oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, options.view, options.detail, options.screenX, options.screenY, options.clientX, options.clientY, options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, options.relatedTarget);
      $(element).dispatchEvent(oEvent);
    }catch(error){
      Event.simulateEvent(element, eventName, options);
    }
  }else if( document.createEventObject ){
    // rearrange for ie implementation of button
    switch(options.button){
      case 0:
        options.button = 1;
        break;
      case 1:
        options.button = 4;
        break;
      case 2:
        break;
      default:
        options.button = 0;                    
      }   
      Event.simulateEvent(element, eventName, options);
  }
}

Event.simulateKeyEvent = function(element, eventName, optionsObj) {
  var options = Object.extend({
    bubbles: true,
    cancelable: true,
    view: window,
    altKey: false,
    ctrlKey: false,
    shiftKey: false,
    metaKey: false,
    keyCode: 0,
    charCode: 0
  }, optionsObj || {});
  if(document.createEvent){
    try{
      var oEvent = document.createEvent("KeyboardEvent");
      oEvent.initKeyEvent(eventName, options.bubbles, options.cancelable, options.view, options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.keyCode, options.charCode);
      $(element).dispatchEvent(oEvent);
    }catch(err){
      Event.simulateEvent(element, eventName, options);
    }
  }else if( document.createEventObject ){
    Event.simulateEvent(element, eventName, options);
  }
}

// clears all events defined by prototype, as this was made private in prototype 1.6, must define our own
Event.unloadCache = function() {
  for (var id in Event.cache)
    for (var eventName in Event.cache[id])
      Event.cache[id][eventName] = null;
}

// defines and runs all the tests ///////////////////////////
function runTests(){
	
	
  new Test.Unit.Runner({
    
    setup: function() { with(this) {
        // set up some pre defined events to check they are preserved
        var el = $('myText');
		el.value = '';
		el.disabled = false;
        el.focusCheck = false;
        el.onfocus = function(){ this.focusCheck = true; }
        el.blurCheck = false;
        el.onblur = function(){ this.blurCheck = true; }
        el.keyupCheck = false;
        el.onkeyup = function(){ this.keyupCheck = true; }
        var chkEl = $('myCheckbox');
        chkEl.clickCheck = false;
        chkEl.onclick = function(){ this.clickCheck = true; }
        var selectEl = $('mySelect');
        selectEl.changeCheck = false;
        selectEl.onchange = function(){ this.changeCheck = true; }
        var formEl = $('myForm');
        formEl.submitCheck = false;
        formEl.onsubmit = function(){ this.submitCheck = true; return false; }
		// preset inline check values
		var iEl = $('myInlineText');
		iEl.disabled = false;
        iEl.inlineFocusCheck = false;
        iEl.inlineBlurCheck = false;
        iEl.inlineKeyupCheck = false;
		iEl.value = '';
        var iChkEl = $('myInlineCheckbox');
        iChkEl.inlineClickCheck = false;
        var iSelectEl = $('myInlineSelect');
        iSelectEl.inlineChangeCheck = false;
        var iFormEl = $$('form')[1];
        iFormEl.inlineSubmitCheck = false;
        // make the first LiveValidation object and first inline events one and define others
		// scoped on an object
		subjects = {};
        subjects.lv = new LiveValidation('myText');
		subjects.lv2;
		subjects.lv3;
		subjects.lv4;
		subjects.lv5;
		subjects.ilv = new LiveValidation('myInlineText');
		subjects.ilv2;
    }},
    
    teardown: function() { with(this) {
		// destroy objects (and therefore their events) so they dont encroach on the next test
		
		if( !Object.isUndefined(subjects.lv) ) subjects.lv.destroy();
		if( !Object.isUndefined(subjects.lv2) ) subjects.lv2.destroy();
		if( !Object.isUndefined(subjects.lv3) ) subjects.lv3.destroy();
		if( !Object.isUndefined(subjects.lv4) ) subjects.lv4.destroy();
		if( !Object.isUndefined(subjects.lv5) ) subjects.lv5.destroy();
		if( !Object.isUndefined(subjects.ilv) ) subjects.ilv.destroy();
		if( !Object.isUndefined(subjects.ilv2) ) subjects.ilv2.destroy();
		//if( !Object.isUndefined(subjects.lv.formObj) ) subjects.lv.formObj.destroy(true);
		//if( !Object.isUndefined(subjects.ilv.formObj) ) subjects.ilv.formObj.destroy(true);

		
    }},
	
    testValidatePresence: function() { with(this) {
       assert(Validate.Presence('hello world'));
        try{
            assertNotEqual(true, Validate.Presence(''), "Validation should be false (_001_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Can't be empty!", error.message);
            }else{
                throw error;
            }
        }
    }},
    
    testValidateNumericality: function() { with(this) {
        // test passes when given number
        assert(Validate.Numericality(2));
        // test passes when given string with number in
        assert(Validate.Numericality('2'));
        // test passes when given 0
        assert(Validate.Numericality(2));
        // test passes when given string '0'
        assert(Validate.Numericality('0'));
        // test passes when given negative number
        assert(Validate.Numericality(-2));
        // test passes when given negative number
        assert(Validate.Numericality('-2'));
        // test passes when given a float
        assert(Validate.Numericality(2.5));
        // test passes when given a string float
        assert(Validate.Numericality('2.5'));
        // test passes when given an integer to only integer
        assert(Validate.Numericality(2, {onlyInteger: true}));
        // test passes when given an scientific number that will evaluate to an integer
        assert(Validate.Numericality(1.123e3, {onlyInteger: true}));
        // test passes when given a string scientific number that will evaluate to an integer
        assert(Validate.Numericality('1.123e3', {onlyInteger: true}));
        // test passes when given a 0 and is only integer
        assert(Validate.Numericality(0, {onlyInteger: true}));
        // test passes when given a string '0' and is only integer
        assert(Validate.Numericality('0', {onlyInteger: true}));
        // test that it fails when no numeric characters are given
        try{
            assertNotEqual(true, Validate.Numericality('hello world'), "Validation should be false (_002_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must be a number!", error.message);
            }else{
                throw error;
            }
        }
        // test that fails validation when a float is supplied to only integer
        try{
            assertNotEqual(true, Validate.Numericality(1.5, {onlyInteger: true}), "Validation should be false (_003_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must be an integer!", error.message);
            }else{
                throw error;
            }
        }
        // test that fails when a string float is given to onlyInteger
        try{
            assertNotEqual(true, Validate.Numericality('1.5', {onlyInteger: true}), "Validation should be false (_004_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must be an integer!", error.message);
            }else{
                throw error;
            }
        }
        // test that fails when a string float with floating point followed by only zeros at end is is given to onlyInteger
        try{
            assertNotEqual(true, Validate.Numericality('1.0000000', {onlyInteger: true}), "Validation should be false (_005_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must be an integer!", error.message);
            }else{
                throw error;
            }
        }
        // test that if a trailing . is there on onlInteger it will fail validation
        try{
            assertNotEqual(true, Validate.Numericality('1.', {onlyInteger: true}), "Validation should be false (_006_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must be an integer!", error.message);
            }else{
                throw error;
            }
        }
        // test fails validation for a string scientific number that evaluates to a float
        try{
            assertNotEqual(true, Validate.Numericality('1.1234e3', {onlyInteger: true}), "Validation should be false (_007_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must be an integer!", error.message);
            }else{
                throw error;
            }
        }
        // test fails validation for a scientific number that evaluates to a float
        try{
            assertNotEqual(true, Validate.Numericality(1.1234e3, {onlyInteger: true}), "Validation should be false (_008_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must be an integer!", error.message);
            }else{
                throw error;
            }
        }
        // test ranges...
        var myIs = 11;
        var myMin = 6;
        var myMax = 10;
        var myRangeMin = 6;
        var myRangeMax = 8;
        // test passes for an specified length
        assert(Validate.Numericality(11, {is: myIs}));
        // test passes for when 0 is the passed in / required number
        assert(Validate.Numericality(0, {is: 0}));
        // test passes for an specified length but is supplied as a string that a number can be derived from
        assert(Validate.Numericality('10e1', {is: 10e1}));
        // test that it fails when not the specifeid length
        try{
            assertNotEqual(true, Validate.Numericality(2, {is: myIs}), "Validation should be false (_009_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must be " + myIs + "!", error.message);
            }else{
                throw error;
            }
        }
        // test that it fails when a number cannot be obtained from the value
        try{
            assertNotEqual(true, Validate.Numericality('alec', {is: myIs}), "Validation should be false (_010_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must be a number!", error.message);
            }else{
                throw error;
            }
        }
        // test passes for an specified minimum
        assert(Validate.Numericality(7, {minimum: myMin}));
        // test that it fails when less than the specifeid minimum
        try{
            assertNotEqual(true, Validate.Numericality(5, {minimum: myMin}), "Validation should be false (_011_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must not be less than " + myMin + "!", error.message);
            }else{
                throw error;
            }
        }
        // test passes for an specified maximum
        assert(Validate.Numericality(10, {maximum: myMax}));
        // test that it fails when more than the specifeid maximum
        try{
            assertNotEqual(true, Validate.Numericality(11, {maximum: myMax}), "Validation should be false (_012_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must not be more than " + myMax + "!", error.message);
            }else{
                throw error;
            }
        }
        // test passes for all values in a range
        assert(Validate.Numericality(6, {minimum: myRangeMin, maximum: myRangeMax}));
        assert(Validate.Numericality(7, {minimum: myRangeMin, maximum: myRangeMax}));
        assert(Validate.Numericality(8, {minimum: myRangeMin, maximum: myRangeMax}));
        // test that it fails when more than the range
        try{
            assertNotEqual(true, Validate.Numericality(9, {minimum: myRangeMin, maximum: myRangeMax}), "Validation should be false (_013_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must not be more than " + myRangeMax + "!", error.message);
            }else{
                throw error;
            }
        }
        // test that it fails when less than the range
        try{
            assertNotEqual(true, Validate.Numericality(5, {minimum: myRangeMin, maximum: myRangeMax}), "Validation should be false (_014_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must not be less than " + myRangeMin + "!", error.message);
            }else{
                throw error;
            }
        }
        // test that it passes a more complex combination of all the different parameters that can be used together
        assert(Validate.Numericality(2.567e3, {minimum:2567, maximum:2569, onlyInteger:true}));
        assert(Validate.Numericality(2.568e3, {minimum:2567, maximum:2569, onlyInteger:true}));
        assert(Validate.Numericality(2.569e3, {minimum:2567, maximum:2569, onlyInteger:true}));
        // test a scientific string number in the parameters
        assert(Validate.Numericality(2.569e3, {minimum:'2567', onlyInteger:true}));
        // test a scientific number in the parameters
        assert(Validate.Numericality(2.569e3, {minimum:2.567e3, maximum:2569, onlyInteger:true}));
        // test a scientific string number in the parameters
        assert(Validate.Numericality(2.569e3, {minimum:'2.567e3', maximum:2569, onlyInteger:true}));
        // test that it fails when less than the range of the above combination assertions
        try{
            assertNotEqual(true, Validate.Numericality(2.566e3, {minimum:2567, maximum:2569, onlyInteger:true}), "Validation should be false (_015_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must not be less than 2567!", error.message);
            }else{
                throw error;
            }
        }
        // test that is takes precedence over max and min
        assert(Validate.Numericality(2.568e3, {is: 2568, minimum:2569, maximum:2575, onlyInteger:true}));
    }},
    
    testValidateFormat: function() { with(this) {
        assert(Validate.Format('live validation', {pattern: /live/i}));
        try{
            assertNotEqual(true, Validate.Format('hello world', {pattern: /live/i}), "Validation should be false (_016_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Not valid!", error.message);
            }else{
                throw error;
            }
        }
        // negated version
        assert(Validate.Format('hello world', {pattern: /live/i, negate: true}));
        try{
            assertNotEqual(true, Validate.Format('live validation', {pattern: /live/i, negate: true}), "Validation should be false (_030_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Not valid!", error.message);
            }else{
                throw error;
            }
        }
    }},
    
    testValidateLength: function() { with(this) {
        var myIs = 11;
        var myMin = 6;
        var myMax = 10;
        var myRangeMin = 6;
        var myRangeMax = 8;
        // test passes for an specified length
        assert(Validate.Length('hello world', {is: myIs}));
        // test that it fails when not the specifeid length
        try{
            assertNotEqual(true, Validate.Length('hello alec', {is: myIs}), "Validation should be false (_017_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must be " + myIs + " characters long!", error.message);
            }else{
                throw error;
            }
        }
        // test passes even if 0 is given as a parameter
        assert(Validate.Length('', {is: 0}));
        // test passes for an specified minimum
        assert(Validate.Length('helloo', {minimum: myMin}));
        // test that it fails when less than the specifeid minimum
        try{
            assertNotEqual(true, Validate.Length('hello', {minimum: myMin}), "Validation should be false (_018_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must not be less than " + myMin + " characters long!", error.message);
            }else{
                throw error;
            }
        }
        // test passes for an specified maximum
        assert(Validate.Length('hello alec', {maximum: myMax}));
        // test that it fails when more than the specifeid maximum
        try{
            assertNotEqual(true, Validate.Length('hello world', {maximum: myMax}), "Validation should be false (_019_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must not be more than " + myMax + " characters long!", error.message);
            }else{
                throw error;
            }
        }
        // test passes for all values in a range
        assert(Validate.Length('helloo', {minimum: myRangeMin, maximum: myRangeMax}));
        assert(Validate.Length('hellooo', {minimum: myRangeMin, maximum: myRangeMax}));
        assert(Validate.Length('helloooo', {minimum: myRangeMin, maximum: myRangeMax}));
        // test that it fails when more than the range
        try{
            assertNotEqual(true, Validate.Length('hellooooo', {minimum: myRangeMin, maximum: myRangeMax}), "Validation should be false (_020_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must not be more than " + myRangeMax + " characters long!", error.message);
            }else{
                throw error;
            }
        }
        // test that it fails when less than the range
        try{
            assertNotEqual(true, Validate.Length('hello', {minimum: myRangeMin, maximum: myRangeMax}), "Validation should be false (_021_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must not be less than " + myRangeMin + " characters long!", error.message);
            }else{
                throw error;
            }
        } 
    }},
     
    testValidateInclusion: function() { with(this){
        // test passes if included
        assert(Validate.Inclusion('hello', {within: ['hello', 1]}));
        // test that it fails when isnt included
        try{
            assertNotEqual(true, Validate.Inclusion('alec', {within: ['hello', 1]}), "Validation should be false (_022_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must be included in the list!", error.message);
            }else{
                throw error;
            }
        }
        // test passes if included and partialMatch: true
        assert(Validate.Inclusion('hello world', {within: ['hello', 1], partialMatch: true}));
        // test that it fails when partialMatch is false
        try{
            assertNotEqual(true, Validate.Inclusion('hello world', {within: ['hello', 1]}), "Validation should be false (_022_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must be included in the list!", error.message);
            }else{
                throw error;
            }
        }
        // test passes if included and is a string using caseSensitive: false
        assert(Validate.Inclusion('HeLLo', {within: ['hello', 1], caseSensitive: false}));
        // test that it fails when case insensitive is true
        try{
            assertNotEqual(true, Validate.Inclusion('HeLLo', {within: ['hello', 1]}), "Validation should be false (_031_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must be included in the list!", error.message);
            }else{
                throw error;
            }
        }
        // test passes if passes null and allowNull is set to true
        assert(Validate.Inclusion(null, {within: ['hello', 'world'], allowNull: true}));
        // test that it fails when null is passed and allowNull is false
        try{
            assertNotEqual(true, Validate.Inclusion(null, {within: ['hello', 'world']}), "Validation should be false (_023_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must be included in the list!", error.message);
            }else{
                throw error;
            }
        }
        // test passes if included and partialMatch: true and caseSensitive: false
        assert(Validate.Inclusion('heLLo world', {within: ['hEllo', 1], partialMatch: true, caseSensitive: false}));
    }},
    
    testValidateExclusion: function() { with(this){
        // test passes if excluded
        assert(Validate.Exclusion('alec', {within: ['hello', 'world']}));
        // test that it fails when isnt excluded
        try{
            assertNotEqual(true, Validate.Exclusion('hello', {within: ['hello', 'world']}), "Validation should be false (_024_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must not be included in the list!", error.message);
            }else{
                throw error;
            }
        }
        // test passes if passes null and allowNull is set to true
        assert(Validate.Exclusion(null, {within: ['hello', 'world'], allowNull: true}));
        // test that it fails when null is passed and allowNull is false
        try{
            assertNotEqual(true, Validate.Exclusion(null, {within: ['hello', 'world']}), "Validation should be false (_025_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must not be included in the list!", error.message);
            }else{
                throw error;
            }
        }
        // test that it fails when partialMatch is true, and a partial match is found
        try{
            assertNotEqual(true, Validate.Exclusion('hello world', {within: ['hello', 1], partialMatch: true}), "Validation should be false (_032_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must not be included in the list!", error.message);
            }else{
                throw error;
            }
        }
        // test passes if excluded when case insensitive is true
        assert(Validate.Exclusion('HeLLo', {within: ['hello', 1]}));
        // test that it fails when is a string using caseSensitive: false
        try{
            assertNotEqual(true, Validate.Exclusion('HeLLo', {within: ['hello', 1], caseSensitive: false}), "Validation should be false (_033_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must not be included in the list!", error.message);
            }else{
                throw error;
            }
        }
        // test fails if not included and partialMatch: true and caseSensitive: false
        try{
          assertNotEqual(true, Validate.Exclusion('heLLo world', {within: ['hEllo', 1], partialMatch: true, caseSensitive: false}), "Validation should be false (_034_)");
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must not be included in the list!", error.message);
            }else{
                throw error;
            }
        }
    }},
    
    testValidateConfirmation: function() { with(this){
        // test that it passes if the value of the match field matches
        assert(Validate.Confirmation('hello world', {match: 'matchField'}));
        // test should fail when the value does not match that in the field
        try{
            assertNotEqual(true, Validate.Confirmation('ahoy there matey', {match: 'matchField'}), "Validation should be false (_026_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Does not match!", error.message);
            }else{
                throw error;
            }

        }
    }},
    
    testValidateAcceptance: function(){ with(this){
        // test that it passes if the value is true, 1, or a non-empty string
        assert(Validate.Acceptance(true));
        assert(Validate.Acceptance(1));
        assert(Validate.Acceptance('hello'));
        // test that it fails if the value is false
        try{
            assertNotEqual(true, Validate.Acceptance(false), "Validation should be false (_027_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must be accepted!", error.message);
            }else{
                throw error;
            }
        }
        // test that it fails if the value is null
        try{
            assertNotEqual(true, Validate.Acceptance(null), "Validation should be false (_028_)" );
        }catch(error){
            assertEqual('ValidationError', error.name);
            if(error.name == 'ValidationError'){
                assertEqual("Must be accepted!", error.message);
            }else{
                throw error;
            }
        }
    }},
    
    testValidateNow: function(){ with(this){
        // test that true is returned for a valid validation
        assert(Validate.now(Validate.Acceptance, true));
        // test that fasle is returned for an invalid validation
        assert(!Validate.now(Validate.Acceptance, false));
        // test that it throws exception if the validation function provided does not exist
        //assertRaise("Validate::now - Validation function must be provided!", Validate.now(Validate.JollyRoger, true));
    }},
    
    /*********************** LiveValidation *****************************/
   
   testInstanciateLiveValidation: function(){ with(this){
        // test that a LiveValidation object has  been set up 
        assertEqual($('myText'), subjects.lv.element, "Expecting LiveValidation element to be myField0");
        // test its default values
        assertEqual('Thankyou!', subjects.lv.validMessage);
        assertEqual($('myText'), subjects.lv.insertAfterWhatNode, "Expecting the node to insert the message after to be subjects.lv.element by default");
        assertEqual('function', typeof subjects.lv.onValid);
        assertEqual('function', typeof subjects.lv.onInvalid);
        //test overiding the defaults
		subjects.lv.destroy(); //destroy previous to remove events
        subjects.lv = new LiveValidation('myText', {validMessage: 'Ta!', 
                                                                insertAfterWhatNode: $('myText').parentNode, 
                                                                onValid: function(){ /*alert('i am valid');*/ },
                                                                onInvalid: function(){ /*alert('i am not valid');*/ }
                                                                });
        assertEqual('Ta!', subjects.lv.validMessage);
        assertEqual($('myText').parentNode, subjects.lv.insertAfterWhatNode, "Expecting the node to insert the message to have been overidden to be subjects.lv.element.parentNode");
        assertEqual('function', typeof subjects.lv.onValid);
        assertEqual('function', typeof subjects.lv.onInvalid);
    }},
    
    testAdd: function(){ with(this){
        // test validations array is empty to start
        assertEqual(0, subjects.lv.validations.length , "Length should be 0" );
        // add a validation
        var params = {failureMessage: 'Invalid!'};
        subjects.lv.add(Validate.Presence, params);
        // tets it is held as an object
        assertEqual('object', typeof subjects.lv.validations[0], "The validation should be stored of an object");
        // test that this has been passed into the validations array
        assertEqual(1, subjects.lv.validations.length, "Length should be 1" );
        // test vthat it is holding the passd in validation correctly
        assertEqual(Validate.Presence, subjects.lv.validations[0].type, "The validation type should be Validate.Presence");
        assertEqual(params , subjects.lv.validations[0].params, "The validation params should be an object of parameters");
    }},
    
    testGetElementType: function(){ with(this){
        // test it is  a text input
        assertEqual(LiveValidation.TEXT, subjects.lv.getElementType('myText'));
        // test it is  a textarea
		subjects.lv.destroy(); //destroy previous to remove events etc.
        subjects.lv = new LiveValidation('myTextarea');
        assertEqual(LiveValidation.TEXTAREA, subjects.lv.getElementType('myTextarea'));
        // test it is  a password input
		subjects.lv.destroy(); //destroy previous to remove events etc.
        subjects.lv = new LiveValidation('myPassword');
        assertEqual(LiveValidation.PASSWORD, subjects.lv.getElementType('myPassword'));
        // test it is  a checkbox input
		subjects.lv.destroy(); //destroy previous to remove events etc.
        subjects.lv = new LiveValidation('myCheckbox');
        assertEqual(LiveValidation.CHECKBOX, subjects.lv.getElementType('myCheckbox'));
        // test it is  a select element
		subjects.lv.destroy(); //destroy previous to remove events etc.
        subjects.lv = new LiveValidation('mySelect');
        assertEqual(LiveValidation.SELECT, subjects.lv.getElementType('mySelect'));
    }},
    
    testValidateElement: function(){ with(this){
        subjects.lv.element.value = '';
        subjects.lv.displayMessageWhenEmpty = true;
        // test that if empty and should show the message when empty that it returns false and sets the message
        assertEqual(false, subjects.lv.validateElement(Validate.Presence, {}), "Validation should return false as there is no content in required field");
        assertEqual("Can't be empty!", subjects.lv.message, "Message should be set to default Presence failure message");
        // test it returns true if should pass
        subjects.lv.element.value = 'hello world';
        assert(subjects.lv.validateElement(Validate.Presence, {}), "Validation should pass and return true");
        // test that it doesnt fail when empty if it should not display error for empty field (ie not Presence, Acceptance, Confirmation)
        subjects.lv.element.value = '';
        subjects.lv.displayMessageWhenEmpty = false;
        assert(subjects.lv.validateElement(Validate.Format, { pattern: /hello/i}), "Validation should pass and return true for an empty field with Validate.Format only");
        // test that it will fail if should fail and has a value in the field
        subjects.lv.element.value = 'howdy';
        assertEqual(false, subjects.lv.validateElement(Validate.Format, { pattern: /hello/i}), "Validation should fail and return false for a non-empty field with an invalid value with Validate.Format only");
    }},
    
    testDoValidations: function(){ with(this){
        subjects.lv.add(Validate.Presence);
        // test that it returns false if the validation should fail
        assertEqual(false, subjects.lv.doValidations(), "Should return false as this should fail");
        assert(subjects.lv.displayMessageWhenEmpty, "subjects.lv.displayMessageWhenEmpty should be true for a presence validation");
        // test that it returns true if the validation should pass
        subjects.lv.element.value = 'hello world';
        assert(subjects.lv.doValidations(), "Should return true as this should pass");
        // test that stacked validations fail in precedence, (first one takes precedence etc)
        subjects.lv.element.value = '';
        subjects.lv.add(Validate.Format, { pattern: /hello/i });
        subjects.lv.doValidations();
        assertEqual("Can't be empty!" , subjects.lv.message, "Presence should fail first");
        subjects.lv.element.value = 'howdy';
        subjects.lv.doValidations();
        assertEqual("Not valid!" , subjects.lv.message, "Format should fail second");
        // test that displayMessageWhenEmpty is false for a format validation
        assert(subjects.lv.displayMessageWhenEmpty, "subjects.lv.displayMessageWhenEmpty should be false for a format validation");
        // tets that stacked validations can all be performed and return true if they all pass
        subjects.lv.element.value = 'hello world';
        assert(subjects.lv.doValidations(), "All validations should pass so should return true");
    }},
    
    testValidate: function(){ with(this){
        subjects.lv.add(Validate.Presence);
        subjects.lv.add(Validate.Format, {pattern: /hello/i});
        subjects.lv.add(Validate.Length, {minimum: 6});
        // test that validating a stacked validation field passes and fails as expected
        subjects.lv.element.value = '';
        assertEqual(false, subjects.lv.validate(), "Validation should be false, failing on presence");
        assertEqual("Can't be empty!", subjects.lv.message, "Should be default presence failureMessage");
        subjects.lv.element.value = 'hey';
        assertEqual(false, subjects.lv.validate(), "Validation should be false, failing on format");
        assertEqual("Not valid!", subjects.lv.message, "Should be default format failureMessage");
        subjects.lv.element.value = 'hello';
        assertEqual(false, subjects.lv.validate(), "Validation should be false, failing on length");
        assertEqual("Must not be less than 6 characters long!", subjects.lv.message, "Should be default minimum length failureMessage");
        subjects.lv.element.value = 'hello world';
        assert(subjects.lv.validate(), "Validation should be true, as all validations should pass now");
        // test that the default validMessage has been created in a span and appended after the field
        assertEqual('SPAN', $(subjects.lv.element).next().nodeName, "A span should have been inserted after the field");
        assertEqual('Thankyou!',$(subjects.lv.element).next().firstChild.nodeValue, "The span should contain a textnode with the default validMessage as its value in it");
        // test that can pass a different element to insert after and it will use that instead
		subjects.lv.destroy(); //destroy previous to remove events
        subjects.lv = new LiveValidation('myText', {insertAfterWhatNode: $('myText').parentNode});
        subjects.lv.add(Validate.Presence);
        subjects.lv.element.value = '';
        subjects.lv.validate();
        // should have span with default presence failureMessage after field's parentNode
        assertEqual('SPAN', $('myText').up().next().nodeName, "A span should have been inserted after the fields parentNode");
        assertEqual("Can't be empty!",$('myText').up().next().firstChild.nodeValue, "The span should  contain a textnode with the default presence failureMessage as its value in it");
        //test it replaces that with the valid message -  should have span with default validMessage after field's parentNode
        subjects.lv.element.value = 'hello world';
        subjects.lv.validate();
        assertEqual('SPAN', $('myText').up().next().nodeName, "A span should have been inserted after the fields parentNode");
        assertEqual('Thankyou!',$('myText').up().next().firstChild.nodeValue, "The span should contain a textnode with the default validMessage as its value in it");
        $('myText').up().next().up().removeChild($('myText').up().next());
        // test the classes added to the field in various valid states
        //var stripSpaces = function(value){ return value.strip(); }
        //clear any class names added by previous tests
        $('myText').className = '';
		subjects.lv.destroy(); //destroy previous to remove events
        subjects.lv = new LiveValidation('myText');
        subjects.lv.add(Validate.Numericality);
        subjects.lv.element.value = '';
        //test that the class of the field is empty to start with
        assertEqual('', stripSpaces($(subjects.lv.element).className), "The className should be empty");
        //test that the class of the field has been set to the invalid one
        subjects.lv.element.value = 'alec';
        subjects.lv.validate();
        assertEqual(subjects.lv.invalidFieldClass, stripSpaces($(subjects.lv.element).className), "The className of the field should be the default invalidFieldClass");
         //test that the class of the field is still the invalid one but has not been duplicated
        subjects.lv.element.value = 'live validation';
        subjects.lv.validate();
        assertEqual(subjects.lv.invalidFieldClass, stripSpaces($(subjects.lv.element).className), "The className of the field should be the default invalidFieldClass, but may have been duplicated");
        //test that the class of the field has been set to the valid one
        subjects.lv.element.value = '2';
        subjects.lv.validate();
        assertEqual(subjects.lv.validFieldClass, stripSpaces($(subjects.lv.element).className), "The className of the field should be the default validFieldClass");
        //test that the class of the field is valid and not duplicated
        subjects.lv.element.value = '20';
        subjects.lv.validate();
        assertEqual(subjects.lv.validFieldClass, stripSpaces($(subjects.lv.element).className), "The className of the field should be the default validFieldClass, but may have been duplicated");
        //test that the class of the field gets set back to empty if the validation type does not require to show valid state when empty
        subjects.lv.element.value = '';
        subjects.lv.validate();
        assertEqual('', stripSpaces($(subjects.lv.element).className), "The className of the field should have been be emptied (as no class existed before)");
    }},
    
    testMassValidate: function(){ with(this){
        subjects.lv.add(Validate.Presence);
        subjects.lv2 = new LiveValidation('myTextarea');
        subjects.lv2.add(Validate.Format, {pattern: /hello/i});
        subjects.lv3 = new LiveValidation('myPassword');
        subjects.lv3.add(Validate.Numericality);
        subjects.lv4 = new LiveValidation('myCheckbox');
        subjects.lv4.add(Validate.Acceptance);
        subjects.lv5 = new LiveValidation('mySelect');
        subjects.lv5.add(Validate.Inclusion, {within: ['Hello world', 'Howdy']});
        var vs = [subjects.lv, subjects.lv2, subjects.lv3, subjects.lv4, subjects.lv5];
        // test one by one that if all the others pass validation, and 1 should fail, that this causes the massValidate to return false
        subjects.lv.element.value = '';
        subjects.lv2.element.value = 'hello world';
        subjects.lv3.element.value  = '3';
        subjects.lv4.element.checked = true;
        subjects.lv5.element.selectedIndex = 1;
        assertEqual(false, LiveValidation.massValidate(vs), "Should return false because subjects.lv has no value, and has presence validation");
        subjects.lv.element.value = 'alec';
        subjects.lv2.element.value = 'i am invalid';
        subjects.lv3.element.value  = '3';
        subjects.lv4.element.checked = true;
        subjects.lv5.element.selectedIndex = 1;
        assertEqual(false, LiveValidation.massValidate(vs), "Should return false because subjects.lv2 has invalid value, and has format validation");
        subjects.lv.element.value = 'alec';
        subjects.lv2.element.value = 'hello world';
        subjects.lv3.element.value  = 'foo';
        subjects.lv4.element.checked = true;
        subjects.lv5.element.selectedIndex = 1;
        assertEqual(false, LiveValidation.massValidate(vs), "Should return false because subjects.lv3 has non numeric value, and has numericality validation");
        subjects.lv.element.value = 'alec';
        subjects.lv2.element.value = 'hello world';
        subjects.lv3.element.value  = '3';
        subjects.lv4.element.checked = false;
        subjects.lv5.element.selectedIndex = 1;
        assertEqual(false, LiveValidation.massValidate(vs), "Should return false because subjects.lv4 is not checked, and has acceptance validation");
        subjects.lv.element.value = 'alec';
        subjects.lv2.element.value = 'hello world';
        subjects.lv3.element.value  = '3';
        subjects.lv4.element.checked = true;
        subjects.lv5.element.selectedIndex = 0;
        assertEqual(false, LiveValidation.massValidate(vs), "Should return false because subjects.lv5 has first option selected, which is not allowed by the inclusion validation");
        // test that it returns true when all fields are valid
        subjects.lv.element.value = 'alec';
        subjects.lv2.element.value = 'hello world';
        subjects.lv3.element.value  = '3';
        subjects.lv4.element.checked = true;
        subjects.lv5.element.selectedIndex = 1;
        assert(LiveValidation.massValidate(vs), "Should return true because all fields are valid");
    }},
    
    testFocusedFlag: function(){ with(this){
        subjects.lv.doOnFocus();
        assertEqual(true, subjects.lv.focused);
        subjects.lv.doOnBlur();
        assertEqual(false, subjects.lv.focused);
    }},
    
    testRemovesMessageAndFieldClassOnFocus: function(){ with(this){
        subjects.lv.add(Validate.Presence);
        subjects.lv.element.value = '';
        subjects.lv.validate();
        assertEqual("Can't be empty!", subjects.lv.message, "Message should be set to default Presence failure message");
        Event.simulateEvent(subjects.lv.element, 'focus');
        assertEqual('', stripSpaces($(subjects.lv.element).className), "The className of the field should have been be emptied (as no class existed before)");
        assertEqual(undefined, $(subjects.lv.element).next(), "There should now be no span element after the field, as it should have been removed");
    }},
    
    testOnlyOnBlur: function(){ with(this){
		subjects.lv.destroy(); //destroy previous to remove events etc.
        subjects.lv = new LiveValidation('myText', {onlyOnBlur: true});
        subjects.lv.add(Validate.Presence);
        Event.simulateEvent(subjects.lv.element, 'focus');
        subjects.lv.element.value = '';
        Event.simulateEvent(subjects.lv.element, 'blur');
        assertEqual("Can't be empty!", subjects.lv.message, "Message should be set to default Presence failure message");
        Event.simulateEvent(subjects.lv.element, 'focus');
        subjects.lv.element.value = 'hello world';
        Event.simulateEvent(subjects.lv.element, 'blur');
        assertEqual("Thankyou!", subjects.lv.message, "Message should be set to default valid message");
    }},
    
    testDeferValidation: function(){ with(this){
		subjects.lv.destroy(); //destroy previous to remove events etc.
        subjects.lv = new LiveValidation('myText', {wait: 1500});
        subjects.lv.add(Validate.Presence);
        subjects.lv.element.value = '';
        subjects.lv.deferValidation();
        assertEqual(undefined, subjects.lv.message, "Message should be undefined at this point, as wait time has not elapsed");
        clearTimeout(subjects.lv.timeout);
     }},
     
     testOnlyOnSubmit: function(){ with(this){
	 	 subjects.lv.destroy(); //destroy previous to remove events etc.
		 subjects.lv = new LiveValidation('myText', {onlyOnSubmit: true});
		 subjects.lv.add(Validate.Presence);
         Event.simulateEvent(subjects.lv.element, 'focus');
         subjects.lv.element.value = '';
         Event.simulateEvent(subjects.lv.element, 'blur');
         assertEqual(undefined, subjects.lv.message, "Message should be undefined at this point, as it should only be set when form is submitted");
         Event.simulateEvent(subjects.lv.form, 'submit');
		 assertEqual("Can't be empty!", subjects.lv.message, "Message should be set to default Presence failure message now that the form has submitted");
     }},
	 
	testEnableDisable: function(){ with(this){
        subjects.lv.add(Validate.Presence);
        subjects.lv.element.value = '';
        subjects.lv.disable();
		subjects.lv.element.value = 'Woooo';
		subjects.lv.validate();
        assertEqual(undefined, subjects.lv.message, "Message should still be undefined, as the validation should not have run again as disabled");
		subjects.lv.enable();
        subjects.lv.validate();
        assertEqual("Thankyou!", subjects.lv.message, "Message should be set to default valid message, as validation has been run and valid");
    }},
     
     testPreserveOldOnFocus: function(){ with(this){
        Event.simulateEvent(subjects.lv.element, 'focus');
        assertEqual(true, subjects.lv.element.focusCheck);     
     }},
     
     testPreserveOldOnBlur: function(){ with(this){
        Event.simulateEvent(subjects.lv.element, 'blur');
        assertEqual(true, subjects.lv.element.blurCheck);     
     }},
     
     testPreserveOldOnClick: function(){ with(this){
        subjects.lv2 = new LiveValidation('myCheckbox');
        Event.simulateMouseEvent(subjects.lv2.element, 'click');
        assertEqual(true, subjects.lv2.element.clickCheck);     
     }},
     
     testPreserveOldOnChange: function(){ with(this){
        subjects.lv2 = new LiveValidation('mySelect');
        Event.simulateEvent(subjects.lv2.element, 'change');
        assertEqual(true, subjects.lv2.element.changeCheck);     
     }},
     
     testPreserveOldOnKeyup: function(){ with(this){
        Event.simulateKeyEvent(subjects.lv.element, 'keyup');
        assertEqual(true, subjects.lv.element.keyupCheck, {keyCode: 9});     
     }},
	 
	 testPreserveInlineOldOnFocus: function(){ with(this){
        Event.simulateEvent(subjects.ilv.element, 'focus');
        assertEqual(true, subjects.ilv.element.inlineFocusCheck);     
     }},
     
     testPreserveInlineOldOnBlur: function(){ with(this){
        Event.simulateEvent(subjects.ilv.element, 'blur');
        assertEqual(true, subjects.ilv.element.inlineBlurCheck);     
     }},
     
     testPreserveInlineOldOnClick: function(){ with(this){
        subjects.ilv2 = new LiveValidation('myInlineCheckbox');
        Event.simulateMouseEvent(subjects.ilv2.element, 'click');
        assertEqual(true, subjects.ilv2.element.inlineClickCheck);     
     }},
     
     testPreserveInlineOldOnChange: function(){ with(this){
        subjects.ilv2 = new LiveValidation('myInlineSelect');
        Event.simulateEvent(subjects.ilv2.element, 'change');
        assertEqual(true, subjects.ilv2.element.inlineChangeCheck);     
     }},
	 
	 testPreserveInlineOldOnKeyup: function(){ with(this){
        Event.simulateKeyEvent(subjects.ilv.element, 'keyup');
	   subjects.ilv.add(Validate.Presence);
        assertEqual(true, subjects.ilv.element.inlineKeyupCheck, {keyCode: 9});     
     }},
    
     testLiveValidationFormIsInstantiated: function(){ with(this){
       assertNotNull(LiveValidationForm.instances['myForm'], "LiveValidationForm.instances['myForm'] should have been created by the first LiveValidation object");
     }},

     testLiveValidationFormIdGenerated: function(){ with(this){
       subjects.ilv = new LiveValidation('myInlineText');
       assertNotNull(subjects.ilv.form.id, "form should have a randomly generated id assigned to it");
       assert(subjects.ilv.form.id.indexOf('.') == -1, "randomly generated id of form should not have a decimal point in it")
     }},
    
     testLiveValidationFormPreserveOldOnSubmit: function(){ with(this){
       // add a validation rule so that form wont submit
	   subjects.lv.add(Validate.Presence);
       Event.simulateEvent(subjects.lv.form, 'submit');
       assertEqual(false, subjects.lv.form.submitCheck, 'Should be false because old was not run as not valid');     
      
	   subjects.lv.element.value = 'i am valid';
       Event.simulateEvent(subjects.lv.form, 'submit');
       assertEqual(true, subjects.lv.form.submitCheck, 'Should be true because old onsubmit should have run as it is now valid');     
	 }},
    
     testLiveValidationFormPreserveInlineOldOnSubmit: function(){ with(this){
	   // add a validation rule so that form wont submit
	   subjects.ilv.add(Validate.Presence);
	   
       Event.simulateEvent(subjects.ilv.form, 'submit');
       assertEqual(false, subjects.ilv.form.inlineSubmitCheck, 'Should be false because old should not run as not valid');  
	   subjects.ilv.element.value = 'i am valid';
       Event.simulateEvent(subjects.ilv.form, 'submit');
       assertEqual(true, subjects.ilv.form.inlineSubmitCheck, 'Should be true because old onsubmit should have run as it is now valid');     
     }},
	 
	 testRemoveFromFieldsLiveValidationFormOnDestroy: function() { with(this) {
		subjects.lv2 = new LiveValidation('myCheckbox');
		var lvF = subjects.lv.formObj;
		subjects.lv.destroy();
		assertEqual(1, lvF.fields.length );
		subjects.lv2.destroy();
		assertEqual(0, lvF.fields.length );
    }},
	
	testPreserveOldOnFocusAfterDestroy: function(){ with(this){
		subjects.lv.destroy();
        Event.simulateEvent(subjects.lv.element, 'focus');
        assertEqual(true, subjects.lv.element.focusCheck);     
     }},
     
     testPreserveOldOnBlurAfterDestroy: function(){ with(this){
	 	subjects.lv.destroy();
        Event.simulateEvent(subjects.lv.element, 'blur');
        assertEqual(true, subjects.lv.element.blurCheck);     
     }},
     
     testPreserveOldOnClickAfterDestroy: function(){ with(this){
        subjects.lv2 = new LiveValidation('myCheckbox');
        subjects.lv2.destroy();
		Event.simulateMouseEvent(subjects.lv2.element, 'click');
        assertEqual(true, subjects.lv2.element.clickCheck);     
     }},
     
     testPreserveOldOnChangeAfterDestroy: function(){ with(this){
        subjects.lv2 = new LiveValidation('mySelect');
        subjects.lv2.destroy();
		Event.simulateEvent(subjects.lv2.element, 'change');
        assertEqual(true, subjects.lv2.element.changeCheck);     
     }},
     
     testPreserveOldOnKeyupAfterDestroy: function(){ with(this){
        subjects.lv.destroy();
		Event.simulateKeyEvent(subjects.lv.element, 'keyup');
        assertEqual(true, subjects.lv.element.keyupCheck, {keyCode: 9});     
     }},
	 
	 testPreserveInlineOldOnFocusAfterDestroy: function(){ with(this){
        subjects.ilv.destroy();
		Event.simulateEvent(subjects.ilv.element, 'focus');
        assertEqual(true, subjects.ilv.element.inlineFocusCheck);     
     }},
     
     testPreserveInlineOldOnBlurAfterDestroy: function(){ with(this){
	 	subjects.ilv.destroy();
        Event.simulateEvent(subjects.ilv.element, 'blur');
        assertEqual(true, subjects.ilv.element.inlineBlurCheck);     
     }},
     
     testPreserveInlineOldOnClickAfterDestroy: function(){ with(this){
        subjects.ilv2 = new LiveValidation('myInlineCheckbox');
		subjects.ilv2.destroy();
        Event.simulateMouseEvent(subjects.ilv2.element, 'click');
        assertEqual(true, subjects.ilv2.element.inlineClickCheck);     
     }},
     
     testPreserveInlineOldOnChangeAfterDestroy: function(){ with(this){
        subjects.ilv2 = new LiveValidation('myInlineSelect');
		subjects.ilv2.destroy();
        Event.simulateEvent(subjects.ilv2.element, 'change');
        assertEqual(true, subjects.ilv2.element.inlineChangeCheck);     
     }},
	 
	 testPreserveInlineOldOnKeyupAfterDestroy: function(){ with(this){
	 	subjects.ilv.destroy();
        Event.simulateKeyEvent(subjects.ilv.element, 'keyup');
        assertEqual(true, subjects.ilv.element.inlineKeyupCheck, {keyCode: 9});     
     }},
	 
	 testLiveValidationFormPreserveOldOnSubmitAfterDestroy: function(){ with(this){
       // add a validation rule so that form wont submit
	   subjects.lv.add(Validate.Presence);
	   subjects.lv.destroy();
       Event.simulateEvent(subjects.lv.form, 'submit');
       assertEqual(true, subjects.lv.form.submitCheck);     
     }},
    
     testLiveValidationFormPreserveInlineOldOnSubmitAfterDestroy: function(){ with(this){
       // add a validation rule so that form wont submit
	   subjects.ilv.add(Validate.Presence);
	   subjects.ilv.destroy();
       Event.simulateEvent(subjects.ilv.form, 'submit');
       assertEqual(true, subjects.ilv.form.inlineSubmitCheck);     
     }}

  }, "testlog");


} // end function

// ]]>