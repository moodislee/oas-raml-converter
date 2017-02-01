const _ = require('lodash');

module.exports = {
	
	getValidCharacters: [
		'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
		'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
		'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '-', '_'
	],
	
	getReplacementCharacter: '_',
	
	getScalarTypes: ['string', 'number', 'integer', 'boolean', 'date', 'datetime', 'date-only', 'file', 'array', 'nil', 'time-only', 'datetime-only'],
	
	getValidFormat: ['byte', 'binary', 'password', 'date', 'date-time'],
	
	parameterMappings: {},
	
	getSupportedParameterFields: [
		'displayName', 'type', 'description', 'default', 'maximum',
		'minimum', 'maxLength', 'minLength', 'pattern', 'enum', 'format',
		'collectionFormat', 'allowEmptyValue', 'exclusiveMaximum', 'exclusiveMinimum',
		'maxItems', 'minItems', 'uniqueItems', 'required', 'facets', "items",
		'(oas-allowEmptyValue)', '(oas-collectionFormat)', '(oas-exclusiveMaximum)', '(oas-exclusiveMinimum)'
	],

	getRFC3339Format: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.(\d*)Z$/,
	getDateOnlyFormat: /^\d{4}[^-]\d{2}[^-]\d{2}$/,

	setParameterFields: function (source, target) {
		for (const prop in source) {
			if (!source.hasOwnProperty(prop)) continue;
			
			if (this.getSupportedParameterFields.indexOf(prop) >= 0) {
				target[this.parameterMappings[prop] ? this.parameterMappings[prop] : prop] =
					typeof source[prop] === 'function' ? source[prop]() : source[prop];
				
				// call function if needed
				if (typeof target[prop] === 'function') {
					target[prop] = target[prop]();
				}
				
				// transform Text nodes
				if (typeof target[prop] !== 'string' && target[prop] && target[prop].value) {
					target[prop] = target[prop].value();
				}
				
				// enums must be arrays
				else if (prop === 'enum' && typeof target[prop] === 'string') {
					try {
						target[prop] = JSON.parse(target[prop].replace(/\'/g, '\"'));
					} catch (e) {
						// ignore
					}
				}
				
				if (!target.hasOwnProperty(prop) || (_.isArray(target[prop]) && _.isEmpty(target[prop]))) {
					delete target[prop];
				}
			}
		}
		
		return target;
	}
};
