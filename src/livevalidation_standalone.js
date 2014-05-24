// LiveValidation 1.4 (standalone version)
// Copyright (c) 2007-2010 Alec Hill (www.livevalidation.com)
// LiveValidation is licensed under the terms of the MIT License

/*********************************************** LiveValidation class ***********************************/

/**
 *	validates a form field in real-time based on validations you assign to it
 *	
 *	@param element {mixed} - either a dom element reference or the string id of the element to validate
 *	@param optionsObj {Object} - general options, see below for details
 *
 *	optionsObj properties:
 *							validMessage {String} 	- the message to show when the field passes validation (set to '' or false to not insert any message)
 *													  (DEFAULT: "Thankyou!")
 *                          beforeValidation {Function} - function to execute directly before validation is performed
 *													  (DEFAULT: function(){})
 *                          afterValidation {Function} - function to execute directly after validation is performed
 *													  (DEFAULT: function(){})
 *                          beforeValid {Function} - function to execute directly before the onValid function is executed
 *													  (DEFAULT: function(){})
 *							onValid {Function} 		- function to execute when field passes validation
 *													  (DEFAULT: function(){ this.insertMessage(this.createMessageSpan()); this.addFieldClass(); } )	
 *                          afterValid {Function} - function to execute directly after the onValid function is executed
 *													  (DEFAULT: function(){})
 *                          beforeInvalid {Function} - function to execute directly before the onInvalid function is executed
 *													  (DEFAULT: function(){})
 *							onInvalid {Function} 	- function to execute when field fails validation
 *													  (DEFAULT: function(){ this.insertMessage(this.createMessageSpan()); this.addFieldClass(); })
 *                          aterInvalid {Function} - function to execute directly after the onInvalid function is executed
 *													  (DEFAULT: function(){})
 *							insertAfterWhatNode {Int} 	- position to insert default message
 *													  (DEFAULT: the field that is being validated)	
 *              onlyOnBlur {Boolean} - whether you want it to validate as you type or only on blur
 *                            (DEFAULT: false)
 *              wait {Integer} - the time you want it to pause from the last keystroke before it validates (ms)
 *                            (DEFAULT: 0)
 *              onlyOnSubmit {Boolean} - whether should be validated only when the form it belongs to is submitted
 *                            (DEFAULT: false)						
 */
var LiveValidation = function(element, optionsObj){
  	this.initialize(element, optionsObj);
}

LiveValidation.VERSION = '1.4 standalone';

/** element types constants ****/

LiveValidation.TEXTAREA = 1;
LiveValidation.TEXT     = 2;
LiveValidation.PASSWORD = 3;
LiveValidation.CHECKBOX = 4;
LiveValidation.SELECT   = 5;
LiveValidation.FILE     = 6;

/****** Static methods *******/

/**
 *	pass an array of LiveValidation objects and it will validate all of them
 *	
 *	@param validations {Array} - an array of LiveValidation objects
 *	@return {Bool} - true if all passed validation, false if any fail						
 */
LiveValidation.massValidate = function(validations){
  var returnValue = true;
	for(var i = 0, len = validations.length; i < len; ++i ){
		var valid = validations[i].validate();
		if(returnValue) returnValue = valid;
	}
	return returnValue;
}

/****** prototype ******/

LiveValidation.prototype = {

    validClass: 'LV_valid',
    invalidClass: 'LV_invalid',
    messageClass: 'LV_validation_message',
    validFieldClass: 'LV_valid_field',
    invalidFieldClass: 'LV_invalid_field',
    
    /**
     *	initialises all of the properties and events
     *
     * @param - Same as constructor above
     */
    initialize: function(element, optionsObj){
      var self = this;
      if(!element) throw new Error("LiveValidation::initialize - No element reference or element id has been provided!");
      this.element = element.nodeName ? element : document.getElementById(element);
      if(!this.element) throw new Error("LiveValidation::initialize - No element with reference or id of '" + element + "' exists!");
      // default properties that could not be initialised above
      this.validations = [];
      this.elementType = this.getElementType();
      this.form = this.element.form;
      // options
      var options = optionsObj || {};
      this.validMessage = options.validMessage || 'Thankyou!';
      var node = options.insertAfterWhatNode || this.element;
	  this.insertAfterWhatNode = node.nodeType ? node : document.getElementById(node);
      this.onlyOnBlur =  options.onlyOnBlur || false;
      this.wait = options.wait || 0;
      this.onlyOnSubmit = options.onlyOnSubmit || false;
	  // hooks
	  this.beforeValidation = options.beforeValidation || function(){};
	  this.beforeValid = options.beforeValid || function(){};
      this.onValid = options.onValid || function(){ this.insertMessage(this.createMessageSpan()); this.addFieldClass(); };
	  this.afterValid = options.afterValid || function(){};
	  this.beforeInvalid = options.beforeInvalid || function(){};
      this.onInvalid = options.onInvalid || function(){ this.insertMessage(this.createMessageSpan()); this.addFieldClass(); };	
	  this.afterInvalid = options.afterInvalid || function(){};	
	  this.afterValidation = options.afterValidation || function(){};
      // add to form if it has been provided
      if(this.form){
        this.formObj = LiveValidationForm.getInstance(this.form);
        this.formObj.addField(this);
      }
      // events
      // collect old events
      this.oldOnFocus = this.element.onfocus || function(){};
      this.oldOnBlur = this.element.onblur || function(){};
      this.oldOnClick = this.element.onclick || function(){};
      this.oldOnChange = this.element.onchange || function(){};
      this.oldOnKeyup = this.element.onkeyup || function(){};
      this.element.onfocus = function(e){ self.doOnFocus(e); return self.oldOnFocus.call(this, e); }
      if(!this.onlyOnSubmit){
        switch(this.elementType){
          case LiveValidation.CHECKBOX:
            this.element.onclick = function(e){ self.validate(); return self.oldOnClick.call(this, e); }
          // let it run into the next to add a change event too
          case LiveValidation.SELECT:
          case LiveValidation.FILE:
            this.element.onchange = function(e){ self.validate(); return self.oldOnChange.call(this, e); }
            break;
          default:
            if(!this.onlyOnBlur) this.element.onkeyup = function(e){ self.deferValidation(); return self.oldOnKeyup.call(this, e); }
      	    this.element.onblur = function(e){ self.doOnBlur(e); return self.oldOnBlur.call(this, e); }
        }
      }
    },
	
	/**
     *	destroys the instance's events (restoring previous ones) and removes it from any LiveValidationForms
     */
    destroy: function(){
  	  if(this.formObj){
		// remove the field from the LiveValidationForm
		this.formObj.removeField(this);
		// destroy the LiveValidationForm if no LiveValidation fields left in it
		this.formObj.destroy();
	  }
      // remove events - set them back to the previous events
	  this.element.onfocus = this.oldOnFocus;
      if(!this.onlyOnSubmit){
        switch(this.elementType){
          case LiveValidation.CHECKBOX:
            this.element.onclick = this.oldOnClick;
          // let it run into the next to add a change event too
          case LiveValidation.SELECT:
          case LiveValidation.FILE:
            this.element.onchange = this.oldOnChange;
            break;
          default:
            if(!this.onlyOnBlur) this.element.onkeyup = this.oldOnKeyup;
      	    this.element.onblur = this.oldOnBlur;
        }
      }
      this.validations = [];
	  this.removeMessageAndFieldClass();
    },
    
    /**
     *	adds a validation to perform to a LiveValidation object
     *
     *	@param validationFunction {Function} - validation function to be used (ie Validate.Presence )
     *	@param validationParamsObj {Object} - parameters for doing the validation, if wanted or necessary
     * @return {Object} - the LiveValidation object itself so that calls can be chained
     */
    add: function(validationFunction, validationParamsObj){
      this.validations.push( {type: validationFunction, params: validationParamsObj || {} } );
      return this;
    },
    
	/**
     *	removes a validation from a LiveValidation object - must have exactly the same arguments as used to add it 
     *
     *	@param validationFunction {Function} - validation function to be used (ie Validate.Presence )
     *	@param validationParamsObj {Object} - parameters for doing the validation, if wanted or necessary
     *  @return {Object} - the LiveValidation object itself so that calls can be chained
     */
    remove: function(validationFunction, validationParamsObj){
  	  var victimless = [];
  	  for( var i = 0, len = this.validations.length; i < len; i++){
	       var v = this.validations[i];
	       if(v.type != validationFunction && v.params != validationParamsObj) victimless.push(v);
	  }
	  this.validations = victimless;
      return this;
    },
    
	
    /**
     * makes the validation wait the alotted time from the last keystroke 
     */
    deferValidation: function(e){
      if(this.wait >= 300) this.removeMessageAndFieldClass();
      var self = this;
      if(this.timeout) clearTimeout(self.timeout);
      this.timeout = setTimeout( function(){ self.validate() }, self.wait); 
    },
        
    /**
     * sets the focused flag to false when field loses focus 
     */
    doOnBlur: function(e){
      this.focused = false;
      this.validate(e);
    },
        
    /**
     * sets the focused flag to true when field gains focus 
     */
    doOnFocus: function(e){
      this.focused = true;
      this.removeMessageAndFieldClass();
    },
    
    /**
     *	gets the type of element, to check whether it is compatible
     *
     *	@param validationFunction {Function} - validation function to be used (ie Validate.Presence )
     *	@param validationParamsObj {Object} - parameters for doing the validation, if wanted or necessary
     */
    getElementType: function(){
		var nn = this.element.nodeName.toUpperCase();
		var nt = this.element.type.toUpperCase();
	    switch(true){
	      case (nn == 'TEXTAREA'):
	        return LiveValidation.TEXTAREA;
	      case (nn == 'INPUT' && nt == 'TEXT'):
	        return LiveValidation.TEXT;
	      case (nn == 'INPUT' && (nt == 'EMAIL' || nt == 'URL' || nt == 'TEL' || nt == 'NUMBER' || nt == 'RANGE')):
	        return LiveValidation.TEXT;
	      case (nn == 'INPUT' && nt == 'PASSWORD'):
	        return LiveValidation.PASSWORD;
	      case (nn == 'INPUT' && nt == 'CHECKBOX'):
	        return LiveValidation.CHECKBOX;
	      case (nn == 'INPUT' && nt == 'FILE'):
	        return LiveValidation.FILE;
	      case (nn == 'SELECT'):
	        return LiveValidation.SELECT;
	      case (nn == 'INPUT'):
	        throw new Error('LiveValidation::getElementType - Cannot use LiveValidation on an ' + nt.toLowerCase() + ' input!');
	      default:
	        throw new Error('LiveValidation::getElementType - Element must be an input, select, or textarea - ' + nn.toLowerCase() + ' was given!');
	    }
	  },
    
    /**
     *	loops through all the validations added to the LiveValidation object and checks them one by one
     *
     *	@param validationFunction {Function} - validation function to be used (ie Validate.Presence )
     *	@param validationParamsObj {Object} - parameters for doing the validation, if wanted or necessary
     *  @return {Boolean} - whether the all the validations passed or if one failed
     */
    doValidations: function(){
      	this.validationFailed = false;
      	for(var i = 0, len = this.validations.length; i < len; ++i){
			this.validationFailed = !this.validateElement(this.validations[i].type, this.validations[i].params);
    		if(this.validationFailed) return false;	
    	}
    	this.message = this.validMessage;
    	return true;
    },
    
    /**
     *	performs validation on the element and handles any error (validation or otherwise) it throws up
     *
     *	@param validationFunction {Function} - validation function to be used (ie Validate.Presence )
     *	@param validationParamsObj {Object} - parameters for doing the validation, if wanted or necessary
     *  @return {Boolean} - whether the validation has passed or failed
     */
    validateElement: function(validationFunction, validationParamsObj){
		// check whether we should display the message when empty
		switch(validationFunction){
    		case Validate.Presence:
            case Validate.Confirmation:
            case Validate.Acceptance:
    			this.displayMessageWhenEmpty = true;
    			break;
			case Validate.Custom:
				if(validationParamsObj.displayMessageWhenEmpty) this.displayMessageWhenEmpty = true;
				break;
    	}
		// select and checkbox elements values are handled differently
		var value = (this.elementType == LiveValidation.SELECT) ? this.element.options[this.element.selectedIndex].value : this.element.value; 
        if(validationFunction == Validate.Acceptance){
    	    if(this.elementType != LiveValidation.CHECKBOX) throw new Error('LiveValidation::validateElement - Element to validate acceptance must be a checkbox!');
    		value = this.element.checked;
    	}
		// now validate
        var isValid = true;
      	try{    
    		validationFunction(value, validationParamsObj);
    	} catch(error) {
    	  	if(error instanceof Validate.Error){
    			if( value !== '' || (value === '' && this.displayMessageWhenEmpty) ){
    				this.validationFailed = true;
					// Opera 10 adds stacktrace after newline
    				this.message = error.message.split('\n')[0];
    				isValid = false;
    			}
    		}else{
    		  	throw error;
    		}
    	}finally{
    	    return isValid;
        }
    },
    
    /**
     *	makes it do the all the validations and fires off the various callbacks
     *
     *  @return {Boolean} - whether the all the validations passed or if one failed
     */
    validate: function(){
      if(!this.element.disabled){
		this.beforeValidation();
		var isValid = this.doValidations();
		if(isValid){
			this.beforeValid();
			this.onValid();
			this.afterValid();
			return true;
		}else {
			this.beforeInvalid();
			this.onInvalid();
			this.afterInvalid();
			return false;
		}
		this.afterValidation();
	  }else{
      	return true;
      }
    },
	
 /**
   *  enables the field
   *
   *  @return {LiveValidation} - the LiveValidation object for chaining
   */
  enable: function(){
  	this.element.disabled = false;
	return this;
  },
  
  /**
   *  disables the field and removes any message and styles associated with the field
   *
   *  @return {LiveValidation} - the LiveValidation object for chaining
   */
  disable: function(){
  	this.element.disabled = true;
	this.removeMessageAndFieldClass();
	return this;
  },
    
    /** Message insertion methods ****************************
     * 
     * These are only used in the onValid and onInvalid callback functions and so if you overide the default callbacks,
     * you must either impliment your own functions to do whatever you want, or call some of these from them if you 
     * want to keep some of the functionality
     */
    
    /**
     *	makes a span containg the passed or failed message
     *
     * @return {HTMLSpanObject} - a span element with the message in it
     */
    createMessageSpan: function(){
        var span = document.createElement('span');
    	var textNode = document.createTextNode(this.message);
      	span.appendChild(textNode);
        return span;
    },
    
    /**
     *	inserts the element containing the message in place of the element that already exists (if it does)
     *
     * @param elementToIsert {HTMLElementObject} - an element node to insert
     */
    insertMessage: function(elementToInsert){
      	this.removeMessage();
		if(!this.validationFailed && !this.validMessage) return; // dont insert anything if vaalidMesssage has been set to false or empty string
      	if( (this.displayMessageWhenEmpty 
	      && (this.elementType == LiveValidation.CHECKBOX || this.element.value == ''))
    	  || this.element.value != '' ){
            var className = this.validationFailed ? this.invalidClass : this.validClass;
    	  	elementToInsert.className += ' ' + this.messageClass + ' ' + className;
			var parent = this.insertAfterWhatNode.parentNode;
            if(this.insertAfterWhatNode.nextSibling){
    		  	parent.insertBefore(elementToInsert, this.insertAfterWhatNode.nextSibling);
    		}else{
    	        parent.appendChild(elementToInsert);
    	    }
    	}
    },
    
    
    /**
     *	changes the class of the field based on whether it is valid or not
     */
    addFieldClass: function(){
        this.removeFieldClass();
        if(!this.validationFailed){
            if(this.displayMessageWhenEmpty || this.element.value != ''){
                if(this.element.className.indexOf(this.validFieldClass) == -1) this.element.className += ' ' + this.validFieldClass;
            }
        }else{
            if(this.element.className.indexOf(this.invalidFieldClass) == -1) this.element.className += ' ' + this.invalidFieldClass;
        }
    },
    
    /**
     *	removes the message element if it exists, so that the new message will replace it
     */
    removeMessage: function(){
    	var nextEl;
    	var el = this.insertAfterWhatNode;
    	while(el.nextSibling){
    	    if(el.nextSibling.nodeType === 1){
    		  	nextEl = el.nextSibling;
    		  	break;
    		}
    		el = el.nextSibling;
    	}
      	if(nextEl && nextEl.className.indexOf(this.messageClass) != -1) this.insertAfterWhatNode.parentNode.removeChild(nextEl);
    },
    
    /**
     *	removes the class that has been applied to the field to indicte if valid or not
     */
    removeFieldClass: function(){
	  var cn = this.element.className;
      if(cn.indexOf(this.invalidFieldClass) != -1) this.element.className = cn.split(this.invalidFieldClass).join('');
      if(cn.indexOf(this.validFieldClass) != -1) this.element.className = cn.split(this.validFieldClass).join(' ');
    },
        
    /**
     *	removes the message and the field class
     */
    removeMessageAndFieldClass: function(){
      this.removeMessage();
      this.removeFieldClass();
    }

} 

/*************************************** LiveValidationForm class ****************************************/
/**
 * This class is used internally by LiveValidation class to associate a LiveValidation field with a form it is icontained in one
 * 
 * It will therefore not really ever be needed to be used directly by the developer, unless they want to associate a LiveValidation 
 * field with a form that it is not a child of, or add some extra functionality via the hooks (access through a LiveValidation object's formObj property)
 */

/**
   *	handles validation of LiveValidation fields belonging to this form on its submittal
   *	
   *	@param element {HTMLFormElement} - a dom element reference to the form to turn into a LiveValidationForm
   */
var LiveValidationForm = function(element){
  this.initialize(element);
}

/**
 * namespace to hold instances
 */
LiveValidationForm.instances = {};

/**
   *	gets the instance of the LiveValidationForm if it has already been made or creates it if it doesnt exist
   *	
   *	@param element {mixed} - a dom element reference to or id of a form
   */
LiveValidationForm.getInstance = function(element){
  if(!element) throw new Error("LiveValidationForm::getInstance - No element reference or element id has been provided!");
  var el = element.nodeName ? element : document.getElementById(element);
  var rand = Math.random() * Math.random();
  if(!el.id) el.id = 'formId_' + rand.toString().replace(/\./, '') + new Date().valueOf();
  if(!LiveValidationForm.instances[el.id]) LiveValidationForm.instances[el.id] = new LiveValidationForm(el);
  return LiveValidationForm.instances[el.id];
}

LiveValidationForm.prototype = {
  
  beforeValidation: function(){},
  onValid: function(){},
  onInvalid: function(){},
  afterValidation: function(){},
  
  /**
   *	constructor for LiveValidationForm - handles validation of LiveValidation fields belonging to this form on its submittal
   *	
   *	@param element {HTMLFormElement} - a dom element reference to the form to turn into a LiveValidationForm
   */
  initialize: function(element){
  	this.name = element.id;
    this.element = element;
    this.fields = [];
    // preserve the old onsubmit event
	this.oldOnSubmit = this.element.onsubmit || function(){};
    var self = this;
    this.element.onsubmit = function(e){
      var ret = false;
      self.beforeValidation(),
      self.valid = LiveValidation.massValidate(self.fields);
      self.valid ? self.onValid() : self.onInvalid();
      self.afterValidation();
	  if(self.valid) ret = self.oldOnSubmit.call(this, e || window.event) !== false;
	  if(!ret) return ret;
    }
  },
  
  /**
   *	adds a LiveValidation field to the forms fields array
   *	
   *	@param element {LiveValidation} - a LiveValidation object
   */
  addField: function(newField){
    this.fields.push(newField);
  },
  
  /**
   *	removes a LiveValidation field from the forms fields array
   *	
   *	@param victim {LiveValidation} - a LiveValidation object
   */
  removeField: function(victim){
  	var victimless = [];
  	for( var i = 0, len = this.fields.length; i < len; i++){
		if(this.fields[i] !== victim) victimless.push(this.fields[i]);
	}
    this.fields = victimless;
  },
  
  /**
   *	destroy this instance and its events
   *
   * @param force {Boolean} - whether to force the detruction even if there are fields still associated
   */
  destroy: function(force){
  	// only destroy if has no fields and not being forced
  	if (this.fields.length != 0 && !force) return false;
	// remove events - set back to previous events
	this.element.onsubmit = this.oldOnSubmit;
	// remove from the instances namespace
	LiveValidationForm.instances[this.name] = null;
	return true;
  }
   
}

/*************************************** Validate class ****************************************/
/**
 * This class contains all the methods needed for doing the actual validation itself
 *
 * All methods are static so that they can be used outside the context of a form field
 * as they could be useful for validating stuff anywhere you want really
 *
 * All of them will return true if the validation is successful, but will raise a ValidationError if
 * they fail, so that this can be caught and the message explaining the error can be accessed ( as just 
 * returning false would leave you a bit in the dark as to why it failed )
 *
 * Can use validation methods alone and wrap in a try..catch statement yourself if you want to access the failure
 * message and handle the error, or use the Validate::now method if you just want true or false
 */

var Validate = {

    /**
     *	validates that the field has been filled in
     *
     *	@param value {mixed} - value to be checked
     *	@param paramsObj {Object} - parameters for this particular validation, see below for details
     *
     *	paramsObj properties:
     *							failureMessage {String} - the message to show when the field fails validation 
     *													  (DEFAULT: "Can't be empty!")
     */
    Presence: function(value, paramsObj){
      	var paramsObj = paramsObj || {};
    	var message = paramsObj.failureMessage || "Can't be empty!";
    	if(value === '' || value === null || value === undefined) Validate.fail(message);
    	return true;
    },
    
    /**
     *	validates that the value is numeric, does not fall within a given range of numbers
     *	
     *	@param value {mixed} - value to be checked
     *	@param paramsObj {Object} - parameters for this particular validation, see below for details
     *
     *	paramsObj properties:
     *							notANumberMessage {String} - the message to show when the validation fails when value is not a number
     *													  	  (DEFAULT: "Must be a number!")
     *							notAnIntegerMessage {String} - the message to show when the validation fails when value is not an integer
     *													  	  (DEFAULT: "Must be a number!")
     *							wrongNumberMessage {String} - the message to show when the validation fails when is param is used
     *													  	  (DEFAULT: "Must be {is}!")
     *							tooLowMessage {String} 		- the message to show when the validation fails when minimum param is used
     *													  	  (DEFAULT: "Must not be less than {minimum}!")
     *							tooHighMessage {String} 	- the message to show when the validation fails when maximum param is used
     *													  	  (DEFAULT: "Must not be more than {maximum}!")
     *							is {Int} 					- the length must be this long 
     *							minimum {Int} 				- the minimum length allowed
     *							maximum {Int} 				- the maximum length allowed
     *                         onlyInteger {Boolean} - if true will only allow integers to be valid
     *                                                             (DEFAULT: false)
     *
     *  NB. can be checked if it is within a range by specifying both a minimum and a maximum
     *  NB. will evaluate numbers represented in scientific form (ie 2e10) correctly as numbers				
     */
    Numericality: function(value, paramsObj){
        var suppliedValue = value;
        var value = Number(value);
    	var paramsObj = paramsObj || {};
        var minimum = ((paramsObj.minimum) || (paramsObj.minimum == 0)) ? paramsObj.minimum : null;;
        var maximum = ((paramsObj.maximum) || (paramsObj.maximum == 0)) ? paramsObj.maximum : null;
    	var is = ((paramsObj.is) || (paramsObj.is == 0)) ? paramsObj.is : null;
        var notANumberMessage = paramsObj.notANumberMessage || "Must be a number!";
        var notAnIntegerMessage = paramsObj.notAnIntegerMessage || "Must be an integer!";
    	var wrongNumberMessage = paramsObj.wrongNumberMessage || "Must be " + is + "!";
    	var tooLowMessage = paramsObj.tooLowMessage || "Must not be less than " + minimum + "!";
    	var tooHighMessage = paramsObj.tooHighMessage || "Must not be more than " + maximum + "!";
        if (!isFinite(value)) Validate.fail(notANumberMessage);
        if (paramsObj.onlyInteger && (/\.0+$|\.$/.test(String(suppliedValue))  || value != parseInt(value)) ) Validate.fail(notAnIntegerMessage);
    	switch(true){
    	  	case (is !== null):
    	  		if( value != Number(is) ) Validate.fail(wrongNumberMessage);
    			break;
    	  	case (minimum !== null && maximum !== null):
    	  		Validate.Numericality(value, {tooLowMessage: tooLowMessage, minimum: minimum});
    	  		Validate.Numericality(value, {tooHighMessage: tooHighMessage, maximum: maximum});
    	  		break;
    	  	case (minimum !== null):
    	  		if( value < Number(minimum) ) Validate.fail(tooLowMessage);
    			break;
    	  	case (maximum !== null):
    	  		if( value > Number(maximum) ) Validate.fail(tooHighMessage);
    			break;
    	}
    	return true;
    },
    
    /**
     *	validates against a RegExp pattern
     *	
     *	@param value {mixed} - value to be checked
     *	@param paramsObj {Object} - parameters for this particular validation, see below for details
     *
     *	paramsObj properties:
     *							failureMessage {String} - the message to show when the field fails validation
     *													  (DEFAULT: "Not valid!")
     *							pattern {RegExp} 		- the regular expression pattern
     *													  (DEFAULT: /./)
     *             negate {Boolean} - if set to true, will validate true if the pattern is not matched
   *                           (DEFAULT: false)
     *
     *  NB. will return true for an empty string, to allow for non-required, empty fields to validate.
     *		If you do not want this to be the case then you must either add a LiveValidation.PRESENCE validation
     *		or build it into the regular expression pattern
     */
    Format: function(value, paramsObj){
      var value = String(value);
      var paramsObj = paramsObj || {};
      var message = paramsObj.failureMessage || "Not valid!";
      var pattern = paramsObj.pattern || /./;
      var negate = paramsObj.negate || false;
      if(!negate && !pattern.test(value)) Validate.fail(message); // normal
      if(negate && pattern.test(value)) Validate.fail(message); // negated
      return true;
    },
    
    /**
     *	validates that the field contains a valid email address
     *	
     *	@param value {mixed} - value to be checked
     *	@param paramsObj {Object} - parameters for this particular validation, see below for details
     *
     *	paramsObj properties:
     *							failureMessage {String} - the message to show when the field fails validation
     *													  (DEFAULT: "Must be a number!" or "Must be an integer!")
     */
    Email: function(value, paramsObj){
    	var paramsObj = paramsObj || {};
    	var message = paramsObj.failureMessage || "Must be a valid email address!";
    	Validate.Format(value, { failureMessage: message, pattern: /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i } );
    	return true;
    },
    
    /**
     *	validates the length of the value
     *	
     *	@param value {mixed} - value to be checked
     *	@param paramsObj {Object} - parameters for this particular validation, see below for details
     *
     *	paramsObj properties:
     *							wrongLengthMessage {String} - the message to show when the fails when is param is used
     *													  	  (DEFAULT: "Must be {is} characters long!")
     *							tooShortMessage {String} 	- the message to show when the fails when minimum param is used
     *													  	  (DEFAULT: "Must not be less than {minimum} characters long!")
     *							tooLongMessage {String} 	- the message to show when the fails when maximum param is used
     *													  	  (DEFAULT: "Must not be more than {maximum} characters long!")
     *							is {Int} 					- the length must be this long 
     *							minimum {Int} 				- the minimum length allowed
     *							maximum {Int} 				- the maximum length allowed
     *
     *  NB. can be checked if it is within a range by specifying both a minimum and a maximum				
     */
    Length: function(value, paramsObj){
    	var value = String(value);
    	var paramsObj = paramsObj || {};
        var minimum = ((paramsObj.minimum) || (paramsObj.minimum == 0)) ? paramsObj.minimum : null;
    	var maximum = ((paramsObj.maximum) || (paramsObj.maximum == 0)) ? paramsObj.maximum : null;
    	var is = ((paramsObj.is) || (paramsObj.is == 0)) ? paramsObj.is : null;
        var wrongLengthMessage = paramsObj.wrongLengthMessage || "Must be " + is + " characters long!";
    	var tooShortMessage = paramsObj.tooShortMessage || "Must not be less than " + minimum + " characters long!";
    	var tooLongMessage = paramsObj.tooLongMessage || "Must not be more than " + maximum + " characters long!";
    	switch(true){
    	  	case (is !== null):
    	  		if( value.length != Number(is) ) Validate.fail(wrongLengthMessage);
    			break;
    	  	case (minimum !== null && maximum !== null):
    	  		Validate.Length(value, {tooShortMessage: tooShortMessage, minimum: minimum});
    	  		Validate.Length(value, {tooLongMessage: tooLongMessage, maximum: maximum});
    	  		break;
    	  	case (minimum !== null):
    	  		if( value.length < Number(minimum) ) Validate.fail(tooShortMessage);
    			break;
    	  	case (maximum !== null):
    	  		if( value.length > Number(maximum) ) Validate.fail(tooLongMessage);
    			break;
    		default:
    			throw new Error("Validate::Length - Length(s) to validate against must be provided!");
    	}
    	return true;
    },
    
    /**
     *	validates that the value falls within a given set of values
     *	
     *	@param value {mixed} - value to be checked
     *	@param paramsObj {Object} - parameters for this particular validation, see below for details
     *
     *	paramsObj properties:
     *							failureMessage {String} - the message to show when the field fails validation
     *													  (DEFAULT: "Must be included in the list!")
     *							within {Array} 			- an array of values that the value should fall in 
     *													  (DEFAULT: [])	
     *							allowNull {Bool} 		- if true, and a null value is passed in, validates as true
     *													  (DEFAULT: false)
     *             partialMatch {Bool} 	- if true, will not only validate against the whole value to check but also if it is a substring of the value 
     *													  (DEFAULT: false)
     *             caseSensitive {Bool} - if false will compare strings case insensitively
     *                          (DEFAULT: true)
     *             negate {Bool} 		- if true, will validate that the value is not within the given set of values
     *													  (DEFAULT: false)			
     */
    Inclusion: function(value, paramsObj){
    	var paramsObj = paramsObj || {};
    	var message = paramsObj.failureMessage || "Must be included in the list!";
      var caseSensitive = (paramsObj.caseSensitive === false) ? false : true;
    	if(paramsObj.allowNull && value == null) return true;
      if(!paramsObj.allowNull && value == null) Validate.fail(message);
    	var within = paramsObj.within || [];
      //if case insensitive, make all strings in the array lowercase, and the value too
      if(!caseSensitive){ 
        var lowerWithin = [];
        for(var j = 0, length = within.length; j < length; ++j){
        	var item = within[j];
          if(typeof item == 'string') item = item.toLowerCase();
          lowerWithin.push(item);
        }
        within = lowerWithin;
        if(typeof value == 'string') value = value.toLowerCase();
      }
    	var found = false;
    	for(var i = 0, length = within.length; i < length; ++i){
    	  if(within[i] == value) found = true;
        if(paramsObj.partialMatch){ 
          if(value.indexOf(within[i]) != -1) found = true;
        }
    	}
    	if( (!paramsObj.negate && !found) || (paramsObj.negate && found) ) Validate.fail(message);
    	return true;
    },
    
    /**
     *	validates that the value does not fall within a given set of values
     *	
     *	@param value {mixed} - value to be checked
     *	@param paramsObj {Object} - parameters for this particular validation, see below for details
     *
     *	paramsObj properties:
     *							failureMessage {String} - the message to show when the field fails validation
     *													  (DEFAULT: "Must not be included in the list!")
     *							within {Array} 			- an array of values that the value should not fall in 
     *													  (DEFAULT: [])
     *							allowNull {Bool} 		- if true, and a null value is passed in, validates as true
     *													  (DEFAULT: false)
     *             partialMatch {Bool} 	- if true, will not only validate against the whole value to check but also if it is a substring of the value 
     *													  (DEFAULT: false)
     *             caseSensitive {Bool} - if false will compare strings case insensitively
     *                          (DEFAULT: true)			
     */
    Exclusion: function(value, paramsObj){
      var paramsObj = paramsObj || {};
      paramsObj.failureMessage = paramsObj.failureMessage || "Must not be included in the list!";
      paramsObj.negate = true;
      Validate.Inclusion(value, paramsObj);
      return true;
    },
    
    /**
     *	validates that the value matches that in another field
     *	
     *	@param value {mixed} - value to be checked
     *	@param paramsObj {Object} - parameters for this particular validation, see below for details
     *
     *	paramsObj properties:
     *							failureMessage {String} - the message to show when the field fails validation
     *													  (DEFAULT: "Does not match!")
     *							match {String} 			- id of the field that this one should match						
     */
    Confirmation: function(value, paramsObj){
      	if(!paramsObj.match) throw new Error("Validate::Confirmation - Error validating confirmation: Id of element to match must be provided!");
    	var paramsObj = paramsObj || {};
    	var message = paramsObj.failureMessage || "Does not match!";
    	var match = paramsObj.match.nodeName ? paramsObj.match : document.getElementById(paramsObj.match);
    	if(!match) throw new Error("Validate::Confirmation - There is no reference with name of, or element with id of '" + paramsObj.match + "'!");
    	if(value != match.value) Validate.fail(message);
    	return true;
    },
    
    /**
     *	validates that the value is true (for use primarily in detemining if a checkbox has been checked)
     *	
     *	@param value {mixed} - value to be checked if true or not (usually a boolean from the checked value of a checkbox)
     *	@param paramsObj {Object} - parameters for this particular validation, see below for details
     *
     *	paramsObj properties:
     *							failureMessage {String} - the message to show when the field fails validation 
     *													  (DEFAULT: "Must be accepted!")
     */
    Acceptance: function(value, paramsObj){
      	var paramsObj = paramsObj || {};
    	var message = paramsObj.failureMessage || "Must be accepted!";
    	if(!value) Validate.fail(message);
    	return true;
    },
    
	 /**
     *	validates against a custom function that returns true or false (or throws a Validate.Error) when passed the value
     *	
     *	@param value {mixed} - value to be checked
     *	@param paramsObj {Object} - parameters for this particular validation, see below for details
     *
     *	paramsObj properties:
     *							failureMessage {String} - the message to show when the field fails validation
     *													  (DEFAULT: "Not valid!")
     *							against {Function} 			- a function that will take the value and object of arguments and return true or false 
     *													  (DEFAULT: function(value, argsObj){ return true; })
     *							args {Object} 		- an object of named arguments that will be passed to the custom function so are accessible through this object within it 
     *													  (DEFAULT: {})
     */
	Custom: function(value, paramsObj){
		var paramsObj = paramsObj || {};
		var against = paramsObj.against || function(){ return true; };
		var args = paramsObj.args || {};
		var message = paramsObj.failureMessage || "Not valid!";
	    if(!against(value, args)) Validate.fail(message);
	    return true;
	  },
	
    /**
     *	validates whatever it is you pass in, and handles the validation error for you so it gives a nice true or false reply
     *
     *	@param validationFunction {Function} - validation function to be used (ie Validation.validatePresence )
     *	@param value {mixed} - value to be checked if true or not (usually a boolean from the checked value of a checkbox)
     *	@param validationParamsObj {Object} - parameters for doing the validation, if wanted or necessary
     */
    now: function(validationFunction, value, validationParamsObj){
      	if(!validationFunction) throw new Error("Validate::now - Validation function must be provided!");
    	var isValid = true;
        try{    
    		validationFunction(value, validationParamsObj || {});
    	} catch(error) {
    		if(error instanceof Validate.Error){
    			isValid =  false;
    		}else{
    		 	throw error;
    		}
    	}finally{ 
            return isValid 
        }
    },
    
    /**
     *  shortcut for failing throwing a validation error
     *
     *	@param errorMessage {String} - message to display
     */
    fail: function(errorMessage){
            throw new Validate.Error(errorMessage);
    },
    
    Error: function(errorMessage){
    	this.message = errorMessage;
    	this.name = 'ValidationError';
    }

}