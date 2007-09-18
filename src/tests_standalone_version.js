/**
 * @author alec.hill
 * 
 * tests for LiveValidation 1.1 (standalone version)
 */

// <![CDATA[

// utility functions
function stripSpaces(value){ return value.strip(); }

// defines and runs all the tests
function runTests(){
	
	
  new Test.Unit.Runner({
    
    setup: function() { with(this) {
        lv = new LiveValidation('myText');
    }},
    
    teardown: function() { with(this) {
        lv = null;
        Event.unloadCache(); // remove events so they dont encroach on the next test
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
        assert(Validate.Inclusion('hello', {within: ['hello', 'world']}));
        // test that it fails when isnt included
        try{
            assertNotEqual(true, Validate.Inclusion('alec', {within: ['hello', 'world']}), "Validation should be false (_022_)" );
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
        // test that a LiveValidation object can be set up 
        assertEqual($('myText'), lv.element, "Expecting LiveValidation element to be myField0");
        // test its default values
        assertEqual('Thankyou!', lv.validMessage);
        assertEqual($('myText'), lv.insertAfterWhatNode, "Expecting the node to insert the message after to be lv.element by default");
        assertEqual('function', typeof lv.onValid);
        assertEqual('function', typeof lv.onInvalid);
        //test overiding the defaults
        lv = new LiveValidation('myText', {validMessage: 'Ta!', 
                                                                insertAfterWhatNode: $('myText').parentNode, 
                                                                onValid: function(){ alert('i am valid'); },
                                                                onInvalid: function(){ alert('i am not valid'); }
                                                                });
        assertEqual('Ta!', lv.validMessage);
        assertEqual($('myText').parentNode, lv.insertAfterWhatNode, "Expecting the node to insert the message to have been overidden to be lv.element.parentNode");
        assertEqual('function', typeof lv.onValid);
        assertEqual('function', typeof lv.onInvalid);
    }},
    
    testadd: function(){ with(this){
        // test validations array is empty to start
        assertEqual(0, lv.validations.length , "Length should be 0" );
        // add a validation
        var params = {failureMessage: 'Invalid!'};
        lv.add(Validate.Presence, params);
        // tets it is held as an object
        assertEqual('object', typeof lv.validations[0], "The validation should be stored of an object");
        // test that this has been passed into the validations array
        assertEqual(1, lv.validations.length, "Length should be 1" );
        // test vthat it is holding the passd in validation correctly
        assertEqual(Validate.Presence, lv.validations[0].type, "The validation type should be Validate.Presence");
        assertEqual(params , lv.validations[0].params, "The validation params should be an object of parameters");
    }},
    
    testGetElementType: function(){ with(this){
        // test it is  a text input
        assertEqual(LiveValidation.TEXT, lv.getElementType('myText'));
        // test it is  a textarea
        lv = new LiveValidation('myTextarea');
        assertEqual(LiveValidation.TEXTAREA, lv.getElementType('myTextarea'));
        // test it is  a password input
        lv = new LiveValidation('myPassword');
        assertEqual(LiveValidation.PASSWORD, lv.getElementType('myPassword'));
        // test it is  a checkbox input
        lv = new LiveValidation('myCheckbox');
        assertEqual(LiveValidation.CHECKBOX, lv.getElementType('myCheckbox'));
        // test it is  a select element
        lv = new LiveValidation('mySelect');
        assertEqual(LiveValidation.SELECT, lv.getElementType('mySelect'));
    }},
    
    testValidateElement: function(){ with(this){
        lv.element.value = '';
        lv.displayMessageWhenEmpty = true;
        // test that if empty and should show the message when empty that it returns false and sets the message
        assertEqual(false, lv.validateElement(Validate.Presence, {}), "Validation should return false as there is no content in required field");
        assertEqual("Can't be empty!", lv.message, "Message should be set to default Presence failure message");
        // test it returns true if should pass
        lv.element.value = 'hello world';
        assert(lv.validateElement(Validate.Presence, {}), "Validation should pass and return true");
        // test that it doesnt fail when empty if it should not display error for empty field (ie not Presence, Acceptance, Confirmation)
        lv.element.value = '';
        lv.displayMessageWhenEmpty = false;
        assert(lv.validateElement(Validate.Format, { pattern: /hello/i}), "Validation should pass and return true for an empty field with Validate.Format only");
        // test that it will fail if should fail and has a value in the field
        lv.element.value = 'howdy';
        assertEqual(false, lv.validateElement(Validate.Format, { pattern: /hello/i}), "Validation should fail and return false for a non-empty field with an invalid value with Validate.Format only");
    }},
    
    testDoValidations: function(){ with(this){
        lv.add(Validate.Presence);
        // test that it returns false if the validation should fail
        assertEqual(false, !lv.doValidations(), "Should return false as this should fail");
        assert(lv.displayMessageWhenEmpty, "lv.displayMessageWhenEmpty should be true for a presence validation");
        // test that it returns true if the validation should pass
        lv.element.value = 'hello world';
        assert(lv.doValidations(), "Should return true as this should pass");
        // test that stacked validations fail in precedence, (first one takes precedence etc)
        lv.element.value = '';
        lv.add(Validate.Format, { pattern: /hello/i });
        lv.doValidations();
        assertEqual("Can't be empty!" , lv.message, "Presence should fail first");
        lv.element.value = 'howdy';
        lv.doValidations();
        assertEqual("Not valid!" , lv.message, "Format should fail second");
        // test that displayMessageWhenEmpty is false for a format validation
        assert(lv.displayMessageWhenEmpty, "lv.displayMessageWhenEmpty should be false for a format validation");
        // tets that stacked validations can all be performed and return true if they all pass
        lv.element.value = 'hello world';
        assert(lv.doValidations(), "All validations should pass so should return true");
    }},
    
    testValidate: function(){ with(this){
        lv.add(Validate.Presence);
        lv.add(Validate.Format, {pattern: /hello/i});
        lv.add(Validate.Length, {minimum: 6});
        // test that validating a stacked validation field passes and fails as expected
        lv.element.value = '';
        assertEqual(false, lv.validate(), "Validation should be false, failing on presence");
        assertEqual("Can't be empty!", lv.message, "Should be default presence failureMessage");
        lv.element.value = 'hey';
        assertEqual(false, lv.validate(), "Validation should be false, failing on format");
        assertEqual("Not valid!", lv.message, "Should be default format failureMessage");
        lv.element.value = 'hello';
        assertEqual(false, lv.validate(), "Validation should be false, failing on length");
        assertEqual("Must not be less than 6 characters long!", lv.message, "Should be default minimum length failureMessage");
        lv.element.value = 'hello world';
        assert(lv.validate(), "Validation should be true, as all validations should pass now");
        // test that the default validMessage has been created in a span and appended after the field
        assertEqual('SPAN', $(lv.element).next().nodeName, "A span should have been inserted after the field");
        assertEqual('Thankyou!',$(lv.element).next().firstChild.nodeValue, "The span should contain a textnode with the default validMessage as its value in it");
        // test that can pass a different element to insert after and it will use that instead
        lv = new LiveValidation('myText', {insertAfterWhatNode: $('myText').parentNode});
        lv.add(Validate.Presence);
        lv.element.value = '';
        lv.validate();
        // should have span with default presence failureMessage after field's parentNode
        assertEqual('SPAN', $('myText').up().next().nodeName, "A span should have been inserted after the fields parentNode");
        assertEqual("Can't be empty!",$('myText').up().next().firstChild.nodeValue, "The span should  contain a textnode with the default presence failureMessage as its value in it");
        //test it replaces that with the valid message -  should have span with default validMessage after field's parentNode
        lv.element.value = 'hello world';
        lv.validate();
        assertEqual('SPAN', $('myText').up().next().nodeName, "A span should have been inserted after the fields parentNode");
        assertEqual('Thankyou!',$('myText').up().next().firstChild.nodeValue, "The span should contain a textnode with the default validMessage as its value in it");
        $('myText').up().next().up().removeChild($('myText').up().next());
        // test the classes added to the field in various valid states
        //var stripSpaces = function(value){ return value.strip(); }
        //clear any class names added by previous tests
        $('myText').className = '';
        lv = new LiveValidation('myText');
        lv.add(Validate.Numericality);
        lv.element.value = '';
        //test that the class of the field is empty to start with
        assertEqual('', stripSpaces($(lv.element).className), "The className should be empty");
        //test that the class of the field has been set to the invalid one
        lv.element.value = 'alec';
        lv.validate();
        assertEqual(lv.invalidFieldClass, stripSpaces($(lv.element).className), "The className of the field should be the default invalidFieldClass");
         //test that the class of the field is still the invalid one but has not been duplicated
        lv.element.value = 'live validation';
        lv.validate();
        assertEqual(lv.invalidFieldClass, stripSpaces($(lv.element).className), "The className of the field should be the default invalidFieldClass, but may have been duplicated");
        //test that the class of the field has been set to the valid one
        lv.element.value = '2';
        lv.validate();
        assertEqual(lv.validFieldClass, stripSpaces($(lv.element).className), "The className of the field should be the default validFieldClass");
        //test that the class of the field is valid and not duplicated
        lv.element.value = '20';
        lv.validate();
        assertEqual(lv.validFieldClass,stripSpaces( $(lv.element).className), "The className of the field should be the default validFieldClass, but may have been duplicated");
        //test that the class of the field gets set back to empty if the validation type does not require to show valid state when empty
        lv.element.value = '';
        lv.validate();
        assertEqual('', stripSpaces($(lv.element).className), "The className of the field should have been be emptied (as no class existed before)");
    }},
    
    testMassValidate: function(){ with(this){
        lv.add(Validate.Presence);
        lv2 = new LiveValidation('myTextarea');
        lv2.add(Validate.Format, {pattern: /hello/i});
        lv3 = new LiveValidation('myPassword');
        lv3.add(Validate.Numericality);
        lv4 = new LiveValidation('myCheckbox');
        lv4.add(Validate.Acceptance);
        lv5 = new LiveValidation('mySelect');
        lv5.add(Validate.Inclusion, {within: ['Hello world', 'Howdy']});
        var vs = [lv, lv2, lv3, lv4, lv5];
        // test one by one that if all the others pass validation, and 1 should fail, that this causes the massValidate to return false
        lv.element.value = '';
        lv2.element.value = 'hello world';
        lv3.element.value  = '3';
        lv5.element.selectedIndex = 1;
        lv4.element.checked = true;
        assertEqual(false, LiveValidation.massValidate(vs), "Should return false because lv has no value, and has presence validation");
        lv.element.value = 'alec';
        lv2.element.value = 'i am invalid';
        lv3.element.value  = '3';
        lv5.element.selectedIndex = 1;
        lv4.element.checked = true;
        assertEqual(false, LiveValidation.massValidate(vs), "Should return false because lv2 has invalid value, and has format validation");
        lv.element.value = 'alec';
        lv2.element.value = 'hello world';
        lv3.element.value  = 'foo';
        lv5.element.selectedIndex = 1;
        lv4.element.checked = true;
        assertEqual(false, LiveValidation.massValidate(vs), "Should return false because lv3 has non numeric value, and has numericality validation");
        lv.element.value = 'alec';
        lv2.element.value = 'hello world';
        lv3.element.value  = '3';
        lv5.element.selectedIndex = 1;
        lv4.element.checked = false;
        assertEqual(false, LiveValidation.massValidate(vs), "Should return false because lv4 is not checked, and has acceptance validation");
        lv.element.value = 'alec';
        lv2.element.value = 'hello world';
        lv3.element.value  = '3';
        lv4.element.checked = true;
        lv5.element.selectedIndex = 0;
        assertEqual(false, LiveValidation.massValidate(vs), "Should return false because lv5 has first option selected, which is not allowed by the inclusion validation");
        // test that it returns true when all fields are valid
        lv.element.value = 'alec';
        lv2.element.value = 'hello world';
        lv3.element.value  = '3';
        lv5.element.selectedIndex = 1;
        lv4.element.checked = true;
        assert(LiveValidation.massValidate(vs), "Should return true because all fields are valid");
    }},
    
    testFocusedFlag: function(){ with(this){
        lv.doOnFocus();
        assertEqual(true, lv.focused);
        lv.doOnBlur();
        assertEqual(false, lv.focused);
    }},
    
    testRemovesMessageAndFieldClassOnFocus: function(){ with(this){
        lv.add(Validate.Presence);
        lv.element.value = '';
        lv.validate();
        assertEqual("Can't be empty!", lv.message, "Message should be set to default Presence failure message");
        lv.doOnFocus();
        assertEqual('', stripSpaces($(lv.element).className), "The className of the field should have been be emptied (as no class existed before)");
        assertEqual(undefined, $(lv.element).next(), "There should now be no span element after the field, as it should have been removed");
    }},
    
    testOnlyOnBlur: function(){ with(this){
        lv = new LiveValidation('myText', {onlyOnBlur: true});
        lv.add(Validate.Presence);
        lv.doOnFocus();
        lv.element.value = '';
        lv.doOnBlur();
        assertEqual("Can't be empty!", lv.message, "Message should be set to default Presence failure message");
        lv.doOnFocus();
        lv.element.value = 'hello world';
        lv.doOnBlur();
        assertEqual("Thankyou!", lv.message, "Message should be set to default valid message");
    }},
    
    testDeferValidation: function(){ with(this){
        lv = new LiveValidation('myText', {wait: 1500});
        lv.add(Validate.Presence);
        lv.element.value = '';
        lv.deferValidation();
        assertEqual(undefined, lv.message, "Message should be undefined at this point, as wait time has not elapsed");
     }}

  }, "testlog");


} // end function

// ]]>